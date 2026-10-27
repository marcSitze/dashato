import { db } from '@/lib/db';
import { AdminVendorsClient } from './admin-vendors-client';

export const dynamic = 'force-dynamic';

export default async function AdminVendorsPage() {
  let vendors: any[] = [];

  try {
    const rawVendors = await db.vendor.findMany({
      include: {
        user: true,
        store: true,
        _count: { select: { products: true, orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    vendors = JSON.parse(JSON.stringify(rawVendors || []));
  } catch (err) {
    console.error('Error fetching admin vendors list:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Candidatures Vendeurs & Gestion des Commissions
          </h1>
          <p className="text-sm text-slate-500">
            Approuvez les boutiques vendeuses, configurez les taux de commission personnalisés et suivez les performances
          </p>
        </div>
      </div>

      <AdminVendorsClient initialVendors={vendors} />
    </div>
  );
}


