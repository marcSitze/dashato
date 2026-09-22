import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      items,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      cardDetails,
      couponCode,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return NextResponse.json({ error: 'Valid shipping address required' }, { status: 400 });
    }

    // 1. Calculate Server-Side Subtotal & Validate Inventory Stock
    let serverSubtotal = 0;
    const orderItemsData: any[] = [];
    const vendorSalesMap: Record<string, { gross: number; items: any[] }> = {};

    for (const item of items) {
      const dbProduct = await db.product.findUnique({
        where: { id: item.productId },
        include: { inventory: true, vendor: true },
      });

      if (!dbProduct || dbProduct.status !== 'ACTIVE') {
        return NextResponse.json({ error: `Product ${item.title} is no longer available` }, { status: 400 });
      }

      const availableStock = dbProduct.inventory?.quantity ?? 0;
      if (availableStock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${dbProduct.title}` }, { status: 400 });
      }

      const unitPrice = dbProduct.price;
      const itemTotal = unitPrice * item.quantity;
      serverSubtotal += itemTotal;

      orderItemsData.push({
        productId: dbProduct.id,
        variantId: item.variantId || null,
        vendorId: dbProduct.vendorId,
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
        fulfillmentStatus: 'UNFULFILLED',
      });

      if (!vendorSalesMap[dbProduct.vendorId]) {
        vendorSalesMap[dbProduct.vendorId] = { gross: 0, items: [] };
      }
      vendorSalesMap[dbProduct.vendorId].gross += itemTotal;
    }

    // 2. Server-side Tax & Shipping calculation
    let discountTotal = 0;
    if (couponCode === 'DASHATO10') {
      discountTotal = (serverSubtotal * 10) / 100;
    }

    let shippingFee = 0;
    if (shippingMethod === 'EXPRESS') shippingFee = 19.99;
    else if (shippingMethod === 'OVERNIGHT') shippingFee = 34.99;
    else if (serverSubtotal < 150) shippingFee = 9.99;

    const taxFee = (serverSubtotal - discountTotal) * 0.08;
    const grandTotal = serverSubtotal - discountTotal + taxFee + shippingFee;

    // 3. Atomic Database Transaction
    const orderNumber = `DSH-${Date.now().toString().substring(3)}`;

    const newOrder = await db.$transaction(async (tx: any) => {
      // Find or create customer account / address
      let targetUserId = user?.id;
      if (!targetUserId) {
        // Create guest user record
        const guestUser = await tx.user.create({
          data: {
            name: shippingAddress.fullName,
            email: shippingAddress.email || `guest_${Date.now()}@dashato.com`,
            role: 'CUSTOMER',
          },
        });
        targetUserId = guestUser.id;
      }

      // Create address record
      const addressRecord = await tx.address.create({
        data: {
          userId: targetUserId,
          fullName: shippingAddress.fullName,
          phoneNumber: shippingAddress.phoneNumber || '+1 555-0100',
          street: shippingAddress.street,
          apartment: shippingAddress.apartment || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'US',
          addressType: 'SHIPPING',
        },
      });

      // Create main Order with PENDING status for WhatsApp processing
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: targetUserId,
          status: 'PENDING',
          subtotal: serverSubtotal,
          shippingFee,
          taxFee,
          discountTotal,
          grandTotal,
          shippingAddressId: addressRecord.id,
          billingAddressId: addressRecord.id,
          couponCode: couponCode || null,
          items: {
            create: orderItemsData,
          },
          payments: {
            create: {
              provider: 'WHATSAPP',
              transactionId: `wa_tx_${orderNumber}`,
              amount: grandTotal,
              status: 'PENDING',
              paymentMethod: 'WHATSAPP_DIRECT',
            },
          },
        },
      });

      // Decrease Inventory & Create Movement Logs
      for (const item of items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId },
        });

        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              quantity: { decrement: item.quantity },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryId: inv.id,
              type: 'SALE',
              quantity: -item.quantity,
              reason: `WhatsApp Order ${orderNumber}`,
            },
          });
        }
      }

      // Create Vendor Commission splits
      for (const [vId, vData] of Object.entries(vendorSalesMap)) {
        const vendorObj = await tx.vendor.findUnique({ where: { id: vId } });
        const commRate = vendorObj?.commissionRate ?? 0.10;
        const feeAmount = vData.gross * commRate;
        const netAmount = vData.gross - feeAmount;

        await tx.vendorCommission.create({
          data: {
            vendorId: vId,
            orderId: order.id,
            grossAmount: vData.gross,
            feeAmount,
            netAmount,
            status: 'UNPAID',
          },
        });
      }

      return order;
    });

    // 4. Construct Well-Structured WhatsApp Message for Shop Owner
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+15550192834';
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

    const itemsListText = items.map((item: any, idx: number) => {
      const storeText = item.vendorName ? `\n   • Store: ${item.vendorName}` : '';
      const variantText = item.variantTitle ? `\n   • Variant: ${item.variantTitle}` : '';
      return `${idx + 1}. *${item.title}*
   • Qty: ${item.quantity} × $${Number(item.price).toFixed(2)} = $${(Number(item.price) * item.quantity).toFixed(2)}${variantText}${storeText}`;
    }).join('\n\n');

    const shippingMethodTitle = shippingMethod === 'EXPRESS'
      ? 'Express Air Courier ($19.99)'
      : shippingMethod === 'OVERNIGHT'
      ? 'Overnight Priority ($34.99)'
      : `Standard Courier Shipping (${shippingFee === 0 ? 'FREE' : '$9.99'})`;

    const whatsappMessageText = `🛍️ *NEW ORDER - #${orderNumber}*
----------------------------------
👤 *Customer Details:*
• *Name:* ${shippingAddress.fullName}
• *Email:* ${shippingAddress.email || 'N/A'}
• *Phone:* ${shippingAddress.phoneNumber || 'N/A'}

📍 *Delivery Address:*
${shippingAddress.street}${shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}
${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}, ${shippingAddress.country || 'US'}

🚚 *Shipping Method:*
${shippingMethodTitle}

📦 *Products Ordered:*
${itemsListText}

----------------------------------
💰 *Order Summary:*
• Subtotal: $${serverSubtotal.toFixed(2)}
• Shipping: ${shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
• Tax (8%): $${taxFee.toFixed(2)}
${discountTotal > 0 ? `• Discount (${couponCode}): -$${discountTotal.toFixed(2)}\n` : ''}• *GRAND TOTAL:* *$${grandTotal.toFixed(2)}*
----------------------------------
📌 *Status:* Submitted via WhatsApp Direct Checkout

Please confirm this order. Thank you!`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessageText)}`;

    // Send Notification
    await NotificationService.send({
      userId: newOrder.userId,
      title: `Order ${newOrder.orderNumber} Submitted!`,
      message: `Your order has been formatted and sent to the shop owner via WhatsApp. Total: $${grandTotal.toFixed(2)}.`,
      type: 'ORDER',
      link: `/account/orders/${newOrder.id}`,
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      whatsappUrl,
      whatsappMessageText,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal checkout processing error' }, { status: 500 });
  }
}
