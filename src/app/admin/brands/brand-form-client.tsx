'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function BrandFormClient({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [name, setName] = React.useState(initialData?.name || '');
  const [slug, setSlug] = React.useState(initialData?.slug || '');
  const [logo, setLogo] = React.useState(initialData?.logo || '');
  const [website, setWebsite] = React.useState(initialData?.website || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
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
        logo,
        website,
        description,
        isFeatured,
      };

      const url = initialData ? `/api/brands/${initialData.id}` : '/api/brands';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save brand');

      toast.success(initialData ? 'Brand updated!' : 'Brand created!');
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Brand save error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl p-8 border-slate-200 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Brand Name *</label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Sony"
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
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Logo Image URL</label>
          <Input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="rounded-xl text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Website URL</label>
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.sony.com"
            className="rounded-xl text-xs"
          />
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

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="featured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="featured" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            Feature on Brand Showcase
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base px-6 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : initialData ? 'Update Brand' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
