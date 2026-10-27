import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Package, ExternalLink, Globe } from 'lucide-react';

export default async function VendorBrandsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  let brands: any[] = [];

  try {
    const rawBrands = await db.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    brands = JSON.parse(JSON.stringify(rawBrands || []));
  } catch (err) {
    console.error('Error fetching brands for vendor:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Tag className="w-8 h-8 text-amber-500" />
            Marques Partenaires Marketplace
          </h1>
          <p className="text-sm text-slate-500">
            Consultez les fabricants et créez une nouvelle marque pour vos fiches articles
          </p>
        </div>

        <Link href="/vendor/brands/new">
          <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-5 shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Créer une Marque
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {brands.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucune marque enregistrée</p>
            <p className="text-xs text-slate-400">Soyez le premier à ajouter une marque au catalogue marketplace.</p>
            <Link href="/vendor/brands/new" className="inline-block pt-2">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Créer une Marque
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((b: any) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 hover:border-amber-500/50 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-extrabold text-sm">
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {b.name}
                          {b.isFeatured && (
                            <Badge variant="default" className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0">
                              Top
                            </Badge>
                          )}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-mono border-slate-300 dark:border-slate-700 mt-0.5">
                          {b.slug}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {b.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {b.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                    <Package className="w-3.5 h-3.5 text-amber-500" /> {b._count?.products || 0} produits
                  </span>
                  {b.website && (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Site officiel
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
