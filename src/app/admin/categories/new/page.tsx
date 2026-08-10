import { db } from '@/lib/db';
import { CategoryFormClient } from '../category-form-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateCategoryPage() {
  const categories = await db.category.findMany({ select: { id: true, name: true } });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/categories" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Create Department Category
        </h1>
        <p className="text-sm text-slate-500">Add a new category or nested subcategory to the catalog hierarchy</p>
      </div>

      <CategoryFormClient parentCategories={categories} />
    </div>
  );
}
