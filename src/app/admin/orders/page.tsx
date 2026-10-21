import Link from 'next/link';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminOrdersPage() {
  let orders: any[] = [];

  try {
    const rawOrders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true, vendor: { include: { store: true } } } },
        shipments: true,
        payments: true,
        commissions: { include: { vendor: true } },
      },
    });

    orders = JSON.parse(JSON.stringify(rawOrders || []));
  } catch (err) {
    console.error('Error fetching admin orders directory:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Suivi des Commandes & Commissions Marketplace
          </h1>
          <p className="text-sm text-slate-500">Gérer le statut des commandes, le suivi des expéditions et les commissions vendeurs</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <div className="overflow-x-auto smooth-scroll-x rounded-2xl w-full">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Commande N°</th>
                <th className="py-3 px-4">Détails du Client</th>
                <th className="py-3 px-4">Articles & Boutiques</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Total Général</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucune commande enregistrée.
                  </td>
                </tr>
              ) : (
                orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{ord.user?.name || 'Client'}</div>
                      <div className="text-[10px] text-slate-400">{ord.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {ord.items?.map((it: any) => (
                          <div key={it.id} className="text-[11px] text-slate-600 dark:text-slate-300">
                            • {it.product?.title ? `${it.product.title.substring(0, 30)}...` : 'Produit'} (Boutique: {it.vendor?.store?.name || it.vendor?.businessName || 'Marketplace'})
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
                          Gérer
                        </Button>
                      </Link>
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

