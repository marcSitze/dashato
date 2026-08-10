import Link from 'next/link';
import { db } from '@/lib/db';
import { ShoppingCart, Truck, CreditCard, User, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: { include: { product: true, vendor: { include: { store: true } } } },
      shipments: true,
      payments: true,
      commissions: { include: { vendor: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Order Fulfillment & Split Commissions
          </h1>
          <p className="text-sm text-slate-500">Manage order status timeline, shipment tracking, and vendor commissions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items / Vendors</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{ord.orderNumber}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{ord.user.name}</div>
                    <div className="text-[10px] text-slate-400">{ord.user.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {ord.items.map((it: any) => (
                        <div key={it.id} className="text-[11px] text-slate-600 dark:text-slate-300">
                          • {it.product.title.substring(0, 30)}... (Store: {it.vendor.store?.name || it.vendor.businessName})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" className="uppercase font-bold text-[10px]">{ord.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(ord.grandTotal)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/admin/orders/${ord.id}`}>
                      <Button size="sm" className="h-7 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm">
                        Manage Order
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
