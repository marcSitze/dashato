import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-card shadow-sm animate-pulse">
      {/* Header */}
      <div className="p-4 bg-muted/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-xs">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            {Array.from({ length: columns - 1 }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-20 rounded hidden sm:block" />
            ))}
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
