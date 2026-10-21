'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { SlidersHorizontal, Star, Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
  const { t } = useTranslation();

  const [minPrice, setMinPrice] = React.useState(currentMinPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = React.useState(currentMaxPrice?.toString() || '');

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
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

  const FilterControls = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">{t.allCategories}</h4>
        <div className="space-y-1 text-sm">
          <button
            onClick={() => applyFilter('category', '')}
            className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors ${
              !currentCategory || currentCategory === 'all'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.allDepartments}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilter('category', cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                currentCategory === cat.slug
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{cat.name}</span>
              {currentCategory === cat.slug && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">{t.priceRange}</h4>
        <form onSubmit={handlePriceApply} className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-xs rounded-xl border-border bg-card text-foreground"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-xs rounded-xl border-border bg-card text-foreground"
          />
          <Button type="submit" size="sm" className="h-9 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl text-xs px-3">
            OK
          </Button>
        </form>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">{t.brand}</h4>
        <div className="space-y-1 text-sm">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => applyFilter('brand', currentBrand === b.slug ? '' : b.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                currentBrand === b.slug
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{b.name}</span>
              {currentBrand === b.slug && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">{t.customerRating}</h4>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => applyFilter('rating', currentRating === r ? '' : r.toString())}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                currentRating === r
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < r ? 'fill-primary' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span>{t.higher}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verified Vendors */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">{t.seller}</h4>
        <div className="space-y-1 text-sm">
          {vendors.map((v) => (
            <button
              key={v.id}
              onClick={() => applyFilter('vendor', currentVendor === v.id ? '' : v.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                currentVendor === v.id
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="truncate">{v.store?.name || v.businessName}</span>
              {currentVendor === v.id && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter Panel */}
      <div className="hidden lg:block bg-card rounded-2xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>{t.filter}</span>
          </div>
          {(currentCategory || currentBrand || currentMinPrice || currentMaxPrice || currentRating || currentVendor) && (
            <button
              onClick={() => router.push('/products')}
              className="text-xs font-semibold text-rose-500 hover:underline"
            >
              {t.clearAll}
            </button>
          )}
        </div>
        <FilterControls />
      </div>

      {/* Mobile Drawer Filter Trigger */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-xl border-border flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{t.filter}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>{t.filter}</SheetTitle>
            </SheetHeader>
            <FilterControls />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
