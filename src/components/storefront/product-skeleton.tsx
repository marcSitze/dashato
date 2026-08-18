import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-card p-4 space-y-4 shadow-sm animate-pulse">
      {/* Image thumbnail placeholder */}
      <Skeleton className="aspect-square w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      
      {/* Title & Brand */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Rating & Stock */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Price & Buy Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
