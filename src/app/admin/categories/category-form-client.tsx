'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function CategoryFormClient({ initialData, parentCategories }: { initialData?: any; parentCategories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [name, setName] = React.useState(initialData?.name || '');
  const [slug, setSlug] = React.useState(initialData?.slug || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [image, setImage] = React.useState(initialData?.image || '');
  const [parentId, setParentId] = React.useState(initialData?.parentId || '');
  const [isFeatured, setIsFeatured] = React.useState(initialData?.isFeatured ?? false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        isFeatured,
      };

      const url = initialData ? `/api/categories/${initialData.id}` : '/api/categories';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');

      toast.success(initialData ? 'Category updated!' : 'Category created!');
      router.push('/admin/categories');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Category error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl p-8 border-slate-200 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Name *</label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Laptops & Computers"
            className="rounded-xl"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Slug *</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded-xl font-mono text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parent Category (Optional for nested hierarchy)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
          >
            <option value="">None (Top Level Category)</option>
            {parentCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Cover URL</label>
          <Input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="featured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="featured" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            Feature on Homepage Category Grid
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base px-6 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
