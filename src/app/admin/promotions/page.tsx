import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AdminPromotionsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Moteur de Coupons & Réductions Promotionnelles
          </h1>
          <p className="text-sm text-slate-500">Configurer les codes de réduction en pourcentage, montants fixes et livraison offerte</p>
        </div>

        <Link href="/admin/promotions/new">
          <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-4 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Créer un Coupon
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
            Aucun coupon configuré pour le moment.
          </div>
        ) : (
          coupons.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-black text-xl text-amber-500 font-mono tracking-wider">{c.code}</span>
                <Badge variant={c.isActive ? 'success' : 'secondary'} className="uppercase font-bold text-[10px]">
                  {c.isActive ? 'Actif' : 'Désactivé'}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type de Réduction :</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {c.discountType === 'PERCENTAGE' ? 'POURCENTAGE' : c.discountType === 'FIXED_AMOUNT' ? 'MONTANT FIXE' : 'LIVRAISON GRATUITE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valeur :</span>
                  <span className="font-extrabold text-amber-600">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% de réduction` : `${c.discountValue} $`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nombre d’Utilisations :</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{c.usageCount} fois</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

