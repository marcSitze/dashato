import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductFormClient } from '@/app/admin/products/product-form-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, brands, vendors] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: true,
        inventory: true,
        categories: true,
        vendor: { include: { store: true } },
      },
    }),
    db.category.findMany({ select: { id: true, name: true, slug: true } }),
    db.brand.findMany({ select: { id: true, name: true, slug: true } }),
    db.vendor.findMany({ select: { id: true, businessName: true, store: { select: { name: true } } } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Product Directory
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Edit Product: {product.title}
          </h1>
          <p className="text-sm text-slate-500">Update SKU, pricing, inventory stock levels, category, or status workflow</p>
        </div>
      </div>

      <ProductFormClient initialData={product} categories={categories} brands={brands} vendors={vendors} />
    </div>
  );
}
