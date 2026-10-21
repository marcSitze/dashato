import { db } from '@/lib/db';
import { AdminDashboardClient } from './admin-dashboard-client';

const MONTH_NAMES_FR = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const CATEGORY_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export default async function AdminDashboardOverviewPage() {
  try {
    const [
      totalRevenueResult,
      totalOrders,
      totalCustomers,
      totalVendors,
      totalProducts,
      rawRecentOrders,
      allCompletedOrders,
      categoriesWithProducts,
    ] = await Promise.all([
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
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
        },
      }),
      db.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { createdAt: true, grandTotal: true },
        orderBy: { createdAt: 'asc' },
      }),
      db.category.findMany({
        select: {
          name: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          products: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const totalRevenue = totalRevenueResult?._sum?.grandTotal || 0;
    const recentOrders = JSON.parse(JSON.stringify(rawRecentOrders || []));

    // Dynamic monthly sales aggregation from database
    const now = new Date();
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    
    // Initialize the last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${MONTH_NAMES_FR[d.getMonth()]}`;
      monthlyMap.set(key, { revenue: 0, orders: 0 });
    }

    allCompletedOrders.forEach((ord) => {
      const date = new Date(ord.createdAt);
      const monthKey = MONTH_NAMES_FR[date.getMonth()];
      if (monthlyMap.has(monthKey)) {
        const current = monthlyMap.get(monthKey)!;
        current.revenue += ord.grandTotal || 0;
        current.orders += 1;
      }
    });

    const salesData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));

    // Dynamic category distribution from real products
    const totalCountedProducts = categoriesWithProducts.reduce((sum, c) => sum + c._count.products, 0);
    const categoryDistribution = categoriesWithProducts.map((cat, idx) => ({
      name: cat.name,
      value: totalCountedProducts > 0 ? Math.round((cat._count.products / totalCountedProducts) * 100) : 0,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));

    return (
      <AdminDashboardClient
        totalRevenue={totalRevenue}
        totalOrders={totalOrders || 0}
        totalCustomers={totalCustomers || 0}
        totalVendors={totalVendors || 0}
        totalProducts={totalProducts || 0}
        recentOrders={recentOrders}
        salesData={salesData}
        categoryDistribution={categoryDistribution}
      />
    );
  } catch (error: any) {
    console.error('Error loading Admin Dashboard Overview:', error);
    return (
      <AdminDashboardClient
        totalRevenue={0}
        totalOrders={0}
        totalCustomers={0}
        totalVendors={0}
        totalProducts={0}
        recentOrders={[]}
        salesData={[]}
        categoryDistribution={[]}
      />
    );
  }
}

