import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

// PATCH /api/orders/items/[id] - Update fulfillment status of a specific order item
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Vendor or Admin required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { fulfillmentStatus = 'SHIPPED', carrier = 'FedEx Express', trackingNumber } = body;

    const orderItem = await db.orderItem.findUnique({
      where: { id },
      include: { order: true, vendor: true },
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    // Permission check for VENDOR
    if (user.role === 'VENDOR') {
      const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
      if (!vendorRecord || vendorRecord.id !== orderItem.vendorId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this order item' }, { status: 403 });
      }
    }

    // Update order item status
    const updatedOrderItem = await db.orderItem.update({
      where: { id },
      data: { fulfillmentStatus },
    });

    // Create or update Shipment for this order
    const trkNum = trackingNumber || `TRK-${Date.now().toString().slice(-8)}`;
    await db.shipment.create({
      data: {
        orderId: orderItem.orderId,
        carrier,
        trackingNumber: trkNum,
        status: fulfillmentStatus,
        shippedAt: new Date(),
      },
    });

    // Update parent order status to SHIPPED if all items are shipped
    const allItems = await db.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    });

    const allShipped = allItems.every(
      (item) => item.fulfillmentStatus === 'SHIPPED' || item.fulfillmentStatus === 'DELIVERED'
    );

    if (allShipped) {
      await db.order.update({
        where: { id: orderItem.orderId },
        data: { status: 'SHIPPED' },
      });
    } else {
      await db.order.update({
        where: { id: orderItem.orderId },
        data: { status: 'PROCESSING' },
      });
    }

    // Send notification to customer
    await NotificationService.send({
      userId: orderItem.order.userId,
      title: `Item Shipped - Order #${orderItem.order.orderNumber}`,
      message: `Your purchased item has been marked as ${fulfillmentStatus} (Carrier: ${carrier}, Tracking: ${trkNum}).`,
      type: 'ORDER',
      link: `/account/orders/${orderItem.order.id}`,
    });

    return NextResponse.json({
      success: true,
      message: `Fulfillment status updated to ${fulfillmentStatus}`,
      data: updatedOrderItem,
    });
  } catch (error: any) {
    console.error('Error updating order item fulfillment status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
