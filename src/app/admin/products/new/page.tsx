import { db } from '@/lib/db';
import { ProductFormClient } from '../product-form-client';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CreateProductPage() {
  const [categories, brands, vendors] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true, slug: true } }),
    db.brand.findMany({ select: { id: true, name: true, slug: true } }),
    db.vendor.findMany({ select: { id: true, businessName: true, store: { select: { name: true } } } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Product Directory
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Create Marketplace Product
          </h1>
          <p className="text-sm text-slate-500">Add a new product listing to the catalog with variants & images</p>
        </div>
      </div>

      <ProductFormClient categories={categories} brands={brands} vendors={vendors} />
    </div>
  );
}
