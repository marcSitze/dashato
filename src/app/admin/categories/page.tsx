import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Hiérarchie des Catégories & Structure SEO
          </h1>
          <p className="text-sm text-slate-500">Gérer les départements et l’arborescence du catalogue</p>
        </div>

        <Link href="/admin/categories/new">
          <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-4 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Créer une Catégorie
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                {cat.isFeatured && <Badge variant="default" className="font-bold text-[10px] bg-amber-500 text-slate-950">En Vedette</Badge>}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{cat.name}</span>
                <span className="text-xs text-slate-400 font-mono">/ {cat.slug}</span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{cat.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-amber-600 dark:text-amber-400">{cat._count.products} Produits</span>
              <Link href={`/admin/categories/${cat.id}/edit`}>
                <Button size="sm" variant="outline" className="h-7 text-xs font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10">
                  Modifier
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

