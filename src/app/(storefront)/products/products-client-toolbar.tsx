'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { X, SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductsClientToolbarProps {
  q?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  vendorId?: string;
  sort?: string;
  totalCount: number;
  productsLength: number;
}

export function ProductsClientHeader({
  q,
  categorySlug,
  totalCount,
  productsLength,
}: {
  q?: string;
  categorySlug?: string;
  totalCount: number;
  productsLength: number;
}) {
  const { t } = useTranslation();

  const title = q
    ? `${t.searchResultsFor} "${q}"`
    : categorySlug
    ? `${t.department}: ${categorySlug.replace('-', ' ')}`
    : t.allProducts;

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        {productsLength} / {totalCount} {t.matchingVerifiedItems}
      </p>
    </div>
  );
}

export function ProductsClientToolbar({
  q,
  categorySlug,
  brandSlug,
  minPrice,
  maxPrice,
  rating,
  vendorId,
  sort,
}: ProductsClientToolbarProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.set('sort', newSort);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Active Filter Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {q && (
          <Badge variant="secondary" className="gap-1 py-1">
            {t.query}: "{q}"
            <Link href={`/products?category=${categorySlug || ''}&brand=${brandSlug || ''}`}>
              <X className="w-3 h-3 hover:text-rose-500" />
            </Link>
          </Badge>
        )}
        {categorySlug && (
          <Badge variant="secondary" className="gap-1 py-1">
            {t.cat}: {categorySlug}
            <Link href={`/products?q=${q || ''}&brand=${brandSlug || ''}`}>
              <X className="w-3 h-3 hover:text-rose-500" />
            </Link>
          </Badge>
        )}
        {brandSlug && (
          <Badge variant="secondary" className="gap-1 py-1">
            {t.brand}: {brandSlug}
            <Link href={`/products?q=${q || ''}&category=${categorySlug || ''}`}>
              <X className="w-3 h-3 hover:text-rose-500" />
            </Link>
          </Badge>
        )}
        {(q || categorySlug || brandSlug || minPrice || maxPrice || rating || vendorId) && (
          <Link href="/products" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
            {t.clearAll}
          </Link>
        )}
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.sortBy}:</span>
        <select
          value={sort || 'relevance'}
          onChange={handleSortChange}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="relevance">{t.relevance}</option>
          <option value="price_asc">{t.priceLowHigh}</option>
          <option value="price_desc">{t.priceHighLow}</option>
          <option value="newest">{t.newestArrivals}</option>
          <option value="best_selling">{t.bestSelling}</option>
          <option value="rating">{t.customerRating}</option>
        </select>
      </div>
    </div>
  );
}

export function ProductsEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        {t.noReviewsYet ? 'Aucun produit ne correspond à vos critères' : 'No products match your criteria'}
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        {t.exclusivePricesSubtitle}
      </p>
      <Link href="/products">
        <Button variant="default" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">
          {t.clearFilters}
        </Button>
      </Link>
    </div>
  );
}
