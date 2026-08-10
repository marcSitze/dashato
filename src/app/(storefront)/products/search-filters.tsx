'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  vendors: { id: string; businessName: string; store?: { name: string } | null }[];
  currentCategory?: string;
  currentBrand?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentRating?: number;
  currentVendor?: string;
  currentSort?: string;
  currentQuery?: string;
}

export function SearchFilters({
  categories,
  brands,
  vendors,
  currentCategory,
  currentBrand,
  currentMinPrice,
  currentMaxPrice,
  currentRating,
  currentVendor,
  currentSort,
  currentQuery,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = React.useState(currentMinPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = React.useState(currentMaxPrice?.toString() || '');

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter update
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm sticky top-24">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filter Discovery
        </h3>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Categories</h4>
        <div className="space-y-1 text-sm">
          <button
            onClick={() => applyFilter('category', '')}
            className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors ${
              !currentCategory || currentCategory === 'all'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All Departments
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilter('category', cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                currentCategory === cat.slug
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>{cat.name}</span>
              {currentCategory === cat.slug && <Check className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Price Range ($USD)</h4>
        <form onSubmit={handlePriceApply} className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-xs rounded-xl"
          />
          <span className="text-slate-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-xs rounded-xl"
          />
          <Button type="submit" size="sm" className="h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs px-3">
            Go
          </Button>
        </form>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Brand</h4>
        <div className="space-y-1 text-sm">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => applyFilter('brand', currentBrand === b.slug ? '' : b.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                currentBrand === b.slug
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>{b.name}</span>
              {currentBrand === b.slug && <Check className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Minimum Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => applyFilter('rating', currentRating === r ? '' : r.toString())}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                currentRating === r
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < r ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
