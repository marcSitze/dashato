import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

export default async function VendorOrdersPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  let orderItems: any[] = [];

  try {
    const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
    const vendorId = vendorRecord?.id || '';

    const rawItems = await db.orderItem.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        product: true,
      },
    });

    orderItems = JSON.parse(JSON.stringify(rawItems || []));
  } catch (err) {
    console.error('Error fetching vendor orders:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Store Orders & Fulfillment Queue
          </h1>
          <p className="text-sm text-slate-500">Manage order items purchased from your store, update shipment tracking, and customer details</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Product Purchased</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders recorded for your store products yet.
                  </td>
                </tr>
              ) : (
                orderItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {item.order?.orderNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.order?.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{item.order?.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.product?.title || 'Product'}</div>
                      <div className="text-[10px] text-slate-400">Qty: {item.quantity} • Unit: {formatCurrency(item.unitPrice)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="uppercase font-bold text-[10px]">
                        {item.fulfillmentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                        Mark Shipped
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
