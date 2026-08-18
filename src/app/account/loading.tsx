import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function AccountLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Account Profile Header */}
      <div className="p-8 rounded-3xl bg-slate-200 dark:bg-slate-800 flex items-center gap-6">
        <Skeleton className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48 rounded bg-slate-300 dark:bg-slate-700" />
          <Skeleton className="h-4 w-64 rounded bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>

      {/* Orders Table Skeleton */}
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
