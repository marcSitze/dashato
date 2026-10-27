import { db } from '@/lib/db';
import { AdminOrdersClient } from './admin-orders-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  let orders: any[] = [];

  try {
    const rawOrders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true, vendor: { include: { store: true } } } },
        shippingAddress: true,
        billingAddress: true,
        shipments: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
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
          <p className="text-sm text-slate-500">
            Gérez le statut des commandes, visualisez les informations minimales inline ou accédez à l'écran de détails
          </p>
        </div>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}

