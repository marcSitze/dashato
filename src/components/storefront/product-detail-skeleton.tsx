import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery Carousel Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Product Details & Actions Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <Skeleton className="h-8 w-4/5 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Skeleton className="h-4 w-24 rounded" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-1/2 rounded-xl" />
              <Skeleton className="h-10 w-1/2 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-6 w-28 rounded" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}
