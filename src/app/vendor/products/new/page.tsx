import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ProductFormClient } from '@/app/admin/products/product-form-client';
import { ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

export default async function VendorCreateProductPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const vendorRecord = await db.vendor.findFirst({
    where: { userId: user.id },
    include: { store: true },
  });

  const [categories, brands, vendors] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true, slug: true } }),
    db.brand.findMany({ select: { id: true, name: true, slug: true } }),
    db.vendor.findMany({ select: { id: true, businessName: true, store: { select: { name: true } } } }),
  ]);

  // Pre-fill initialData for vendor if needed
  const initialData = vendorRecord
    ? { vendorId: vendorRecord.id }
    : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/vendor" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendor Seller Center
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Store className="w-8 h-8 text-amber-500" />
            Add Store Product
          </h1>
          <p className="text-sm text-slate-500">
            Add a new product listing to your store catalog with media uploads, pricing, and category selection.
          </p>
        </div>
      </div>

      <ProductFormClient
        initialData={initialData}
        categories={categories}
        brands={brands}
        vendors={vendors}
        isVendorUser={true}
        userVendorId={vendorRecord?.id}
        redirectPath="/vendor/products"
      />
    </div>
  );
}
