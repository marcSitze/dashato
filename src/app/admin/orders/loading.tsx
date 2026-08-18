import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function AdminOrdersLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
