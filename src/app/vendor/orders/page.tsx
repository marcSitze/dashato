import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VendorOrdersClient } from './vendor-orders-client';

export const dynamic = 'force-dynamic';

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
      where: user.role === 'ADMIN' ? {} : { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            shippingAddress: true,
            shipments: true,
            payments: true,
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
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Commandes de la Boutique & Expéditions
        </h1>
        <p className="text-sm text-slate-500">
          Gérez les commandes de vos clients, mettez à jour le suivi des colis et suivez les livraisons
        </p>
      </div>

      <VendorOrdersClient initialOrderItems={orderItems} />
    </div>
  );
}


