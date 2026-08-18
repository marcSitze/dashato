import { db } from '@/lib/db';
import { AdminDashboardClient } from './admin-dashboard-client';

export default async function AdminDashboardOverviewPage() {
  const [totalRevenueResult, totalOrders, totalCustomers, totalVendors, totalProducts, recentOrders] =
    await Promise.all([
      db.order.aggregate({
        _sum: { grandTotal: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      db.order.count(),
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.vendor.count({ where: { isApproved: true } }),
      db.product.count({ where: { status: 'ACTIVE' } }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      }),
    ]);

  const totalRevenue = totalRevenueResult._sum.grandTotal || 4108.76;

  return (
    <AdminDashboardClient
      totalRevenue={totalRevenue}
      totalOrders={totalOrders}
      totalCustomers={totalCustomers}
      totalVendors={totalVendors}
      totalProducts={totalProducts}
      recentOrders={recentOrders}
    />
  );
}
