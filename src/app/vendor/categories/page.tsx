import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Plus, Package } from 'lucide-react';

export default async function VendorCategoriesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  let categories: any[] = [];

  try {
    const rawCategories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        parent: true,
        _count: { select: { products: true } },
      },
    });

    categories = JSON.parse(JSON.stringify(rawCategories || []));
  } catch (err) {
    console.error('Error fetching categories for vendor:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Marketplace Categories Catalog
          </h1>
          <p className="text-sm text-slate-500">Browse categories or add a new category to group your store products</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 hover:border-amber-500/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{cat.name}</h3>
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 pt-1">{cat.description}</p>
                )}
                <div className="text-[10px] font-bold text-slate-500 pt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-amber-500" /> {cat._count?.products || 0} products
                  </span>
                  {cat.parent && <span>• Subcategory of {cat.parent.name}</span>}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-300 dark:border-slate-700">
                {cat.slug}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
