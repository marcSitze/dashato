import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ProductFormClient } from '@/app/admin/products/product-form-client';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default async function VendorEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const { id } = await params;
  const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });

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

  // Ensure vendor owns this product if role is VENDOR
  if (user.role === 'VENDOR' && vendorRecord && product.vendorId !== vendorRecord.id) {
    redirect('/vendor/products');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/vendor/products"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Store Products
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-amber-500" />
            Edit Store Product: {product.title}
          </h1>
          <p className="text-sm text-slate-500">
            Update pricing, media images/videos, description, stock quantity, or workflow status.
          </p>
        </div>
      </div>

      <ProductFormClient
        initialData={product}
        categories={categories}
        brands={brands}
        vendors={vendors}
        isVendorUser={user.role === 'VENDOR'}
        userVendorId={vendorRecord?.id}
        redirectPath="/vendor/products"
      />
    </div>
  );
}
