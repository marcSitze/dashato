import { db } from '@/lib/db';
import { Plus, Tag, ExternalLink, Globe, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Tag className="w-8 h-8 text-amber-500" />
            Marques Partenaires & Fabricants
          </h1>
          <p className="text-sm text-slate-500">Gérer les constructeurs et marques officielles du catalogue</p>
        </div>

        <Link href="/admin/brands/new">
          <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-4 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Créer une Marque
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand: any) => (
          <div key={brand.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-12 h-12 rounded-2xl object-contain bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-extrabold text-lg">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{brand.name}</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">/ {brand.slug}</span>
                  </div>
                </div>

                {brand.isFeatured && (
                  <Badge variant="default" className="font-bold text-[10px] bg-amber-500 text-slate-950">
                    En Vedette
                  </Badge>
                )}
              </div>

              {brand.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{brand.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> {brand._count.products} Produits
              </span>
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-amber-500 font-medium flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  Site
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
