import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

// GET /api/orders/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await db.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            vendor: { include: { store: true } },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        shipments: true,
        payments: true,
        refunds: true,
        commissions: { include: { vendor: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Permission check
    if (user.role === 'CUSTOMER' && order.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Update status, add shipment tracking, or process cancellation/refund (RBAC: Admin or Vendor)
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
    const { status, carrier, trackingNumber, fulfillmentStatus } = body;

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update main order status if provided and user is ADMIN
    let updatedOrder = order;
    if (status && user.role === 'ADMIN') {
      updatedOrder = await db.order.update({
        where: { id },
        data: { status },
      });
    }

    // If carrier & tracking number provided, create/update Shipment record
    if (carrier || trackingNumber) {
      await db.shipment.create({
        data: {
          orderId: id,
          carrier: carrier || 'FedEx',
          trackingNumber: trackingNumber || `TRK-${Date.now()}`,
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
      });

      // Update Order Items fulfillment status
      if (user.role === 'VENDOR') {
        const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
        if (vendorRecord) {
          await db.orderItem.updateMany({
            where: { orderId: id, vendorId: vendorRecord.id },
            data: { fulfillmentStatus: 'SHIPPED' },
          });
        }
      } else {
        await db.orderItem.updateMany({
          where: { orderId: id },
          data: { fulfillmentStatus: 'SHIPPED' },
        });
      }
    }

    // Send Notification to customer
    await NotificationService.send({
      userId: order.userId,
      title: `Order ${order.orderNumber} Updated`,
      message: `Your order status has been updated to ${status || fulfillmentStatus || 'SHIPPED'}.`,
      type: 'ORDER',
      link: `/account/orders/${order.id}`,
    });

    return NextResponse.json({ success: true, message: 'Order updated successfully', data: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
