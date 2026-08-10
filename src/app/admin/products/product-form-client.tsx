'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ProductFormClientProps {
  initialData?: any;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  vendors: { id: string; businessName: string; store?: { name: string } | null }[];
}

export function ProductFormClient({ initialData, categories, brands, vendors }: ProductFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [title, setTitle] = React.useState(initialData?.title || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [shortDesc, setShortDesc] = React.useState(initialData?.shortDesc || '');
  const [sku, setSku] = React.useState(initialData?.sku || `SKU-${Date.now().toString().substring(6)}`);
  const [price, setPrice] = React.useState(initialData?.price?.toString() || '');
  const [compareAtPrice, setCompareAtPrice] = React.useState(initialData?.compareAtPrice?.toString() || '');
  const [categoryId, setCategoryId] = React.useState(initialData?.categories?.[0]?.categoryId || categories[0]?.id || '');
  const [brandId, setBrandId] = React.useState(initialData?.brandId || brands[0]?.id || '');
  const [vendorId, setVendorId] = React.useState(initialData?.vendorId || vendors[0]?.id || '');
  const [status, setStatus] = React.useState(initialData?.status || 'ACTIVE');
  const [quantity, setQuantity] = React.useState(initialData?.inventory?.quantity?.toString() || '20');

  // Image URLs list
  const [images, setImages] = React.useState<string[]>(
    initialData?.images?.map((img: any) => img.url) || [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    ]
  );
  const [newImageUrl, setNewImageUrl] = React.useState('');

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !sku || !price || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        shortDesc,
        sku,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        brandId: brandId || null,
        vendorId,
        status,
        quantity: parseInt(quantity, 10),
        images: images.map((url, idx) => ({ url, isMain: idx === 0 })),
      };

      const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      toast.success(initialData ? 'Product updated successfully!' : 'Product created successfully!');
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Product save error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl p-8 border-slate-200 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            General Product Information
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Product Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apple MacBook Pro 16 M3 Max"
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Product SKU *</label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Workflow</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Detailed tech specs, user guide, and features..."
              required
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Pricing & Inventory Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Retail Price ($USD) *</label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499.00"
                className="rounded-xl font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Compare Price (MSRP)</label>
              <Input
                type="number"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="2799.00"
                className="rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Available Stock Quantity *</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-xl font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Category, Brand, & Vendor */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Classification & Seller
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fulfilling Vendor Store *</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.store?.name || v.businessName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Images Gallery Manager */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
            Product Images Gallery
          </h3>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="rounded-xl text-xs flex-1"
            />
            <Button type="button" onClick={handleAddImage} className="bg-slate-900 text-white text-xs font-bold rounded-xl px-4">
              Add Image URL
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base px-8 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving Product...' : initialData ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
