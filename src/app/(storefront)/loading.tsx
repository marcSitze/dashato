import { ProductGridSkeleton } from '@/components/storefront/product-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function StorefrontLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-80 sm:h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 p-8 flex flex-col justify-end space-y-4">
        <Skeleton className="h-4 w-36 rounded-full bg-slate-300 dark:bg-slate-700" />
        <Skeleton className="h-10 w-3/4 sm:w-1/2 rounded-2xl bg-slate-300 dark:bg-slate-700" />
        <Skeleton className="h-5 w-2/3 sm:w-1/3 rounded-xl bg-slate-300 dark:bg-slate-700" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-12 w-36 rounded-2xl bg-slate-300 dark:bg-slate-700" />
          <Skeleton className="h-12 w-36 rounded-2xl bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>

      {/* Category Pills Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Trending Grid Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-56 rounded-xl" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
