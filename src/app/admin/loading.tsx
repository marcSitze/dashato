import { DashboardSkeleton } from '@/components/admin/dashboard-skeleton';

export default function AdminLoading() {
  return (
    <div className="p-6">
      <DashboardSkeleton />
    </div>
  );
}
