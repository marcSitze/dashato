import { BrandFormClient } from '../brand-form-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBrandPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/products" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Create Brand Partner
        </h1>
        <p className="text-sm text-slate-500">Add a new manufacturer brand to the marketplace catalog</p>
      </div>

      <BrandFormClient />
    </div>
  );
}
