import { db } from '@/lib/db';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function AdminVendorsPage() {
  const vendors = await db.vendor.findMany({
    include: {
      user: true,
      store: true,
      _count: { select: { products: true, orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Candidatures Vendeurs & Gestion des Commissions
          </h1>
          <p className="text-sm text-slate-500">Approuver les boutiques vendeuses, configurer les taux de commission et suivre les performances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vendors.map((v: any) => (
          <div key={v.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={v.store?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
              />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  {v.store?.name || v.businessName}
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </h3>
                <p className="text-xs text-slate-400">{v.user.name} ({v.user.email})</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={v.isApproved ? 'success' : 'warning'} className="uppercase font-bold text-[10px]">
                    {v.isApproved ? 'APPROUVÉ' : v.status === 'PENDING' ? 'EN ATTENTE' : v.status}
                  </Badge>
                  <span className="text-xs font-bold text-amber-600">{(v.commissionRate * 100).toFixed(0)}% Commission</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Identifiant Fiscal :</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{v.taxId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produits Listés :</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{v._count.products}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs font-bold rounded-xl">
                Configurer la Commission
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

