import Link from 'next/link';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export interface AdminProductsPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const resolvedParams = (await searchParams) || {};
  const status = resolvedParams.status;
  const q = resolvedParams.q;

  let products: any[] = [];

  try {
    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [{ title: { contains: q } }, { sku: { contains: q } }];
    }

    const rawProducts = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        brand: true,
        vendor: { include: { store: true } },
        inventory: true,
      },
    });

    products = JSON.parse(JSON.stringify(rawProducts || []));
  } catch (err) {
    console.error('Error fetching admin products directory:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Catalogue des Produits</h1>
            <p className="text-sm text-slate-500">Gérer l’inventaire du catalogue, les prix et les validations des vendeurs</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-4 shadow-sm">
              + Ajouter un Produit
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { label: 'Tous les Produits', value: '' },
            { label: 'Actifs', value: 'ACTIVE' },
            { label: 'En attente', value: 'PENDING_APPROVAL' },
            { label: 'Brouillons', value: 'DRAFT' },
            { label: 'Archivés', value: 'ARCHIVED' },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/products${tab.value ? `?status=${tab.value}` : ''}`}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                (status || '') === tab.value
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <div className="overflow-x-auto smooth-scroll-x rounded-2xl w-full">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Détails du Produit</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Boutique Vendeur</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun produit trouvé dans cette catégorie.
                  </td>
                </tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-950"
                        />
                        <div>
                          <Link href={`/products/${p.slug}`} target="_blank" className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 line-clamp-1">
                            {p.title}
                          </Link>
                          <span className="text-[10px] text-slate-400">{p.brand?.name || 'Générique'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{p.sku}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {p.vendor?.store?.name || p.vendor?.businessName || 'Marketplace'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(p.price)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={(p.inventory?.quantity ?? 0) > 5 ? 'success' : 'destructive'}>
                        {p.inventory?.quantity ?? 0} en stock
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'warning'} className="uppercase font-bold text-[10px]">
                        {p.status === 'ACTIVE' ? 'ACTIF' : p.status === 'PENDING_APPROVAL' ? 'EN ATTENTE' : p.status === 'DRAFT' ? 'BROUILLON' : p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-amber-600 font-bold border-amber-500/30 hover:bg-amber-500/10">
                          Modifier
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

