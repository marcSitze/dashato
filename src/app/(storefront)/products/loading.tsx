import { ProductGridSkeleton } from '@/components/storefront/product-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Header & Filter Controls Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* Main Catalog Area: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3 space-y-6 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded" />
            ))}
          </div>
          <Skeleton className="h-6 w-32 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="lg:col-span-9">
          <ProductGridSkeleton count={9} />
        </div>
      </div>
    </div>
  );
}
