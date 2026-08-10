import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CategoryFormClient } from '@/app/admin/categories/category-form-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [category, categories] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({ select: { id: true, name: true } }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/categories" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Edit Category: {category.name}
        </h1>
        <p className="text-sm text-slate-500">Update category title, slug, cover image, parent hierarchy, or featured status</p>
      </div>

      <CategoryFormClient initialData={category} parentCategories={categories.filter((c: any) => c.id !== category.id)} />
    </div>
  );
}
