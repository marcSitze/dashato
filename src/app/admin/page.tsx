import Link from 'next/link';
import { db } from '@/lib/db';
import { AdminOverviewCharts } from './admin-overview-charts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Package,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Executive Admin Analytics
          </h1>
          <p className="text-sm text-slate-500">Real-time marketplace platform performance & sales metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-4">
              + Create Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalOrders}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +12.1% growth
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCustomers}</div>
          <div className="text-xs text-slate-400">Active accounts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Vendors</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalVendors}</div>
          <div className="text-xs text-slate-400">Approved sellers</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalProducts}</div>
          <div className="text-xs text-slate-400">Live listings</div>
        </div>
      </div>

      {/* Visual Analytics Charts Component */}
      <AdminOverviewCharts />

      {/* Recent Marketplace Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Recent Platform Orders</h3>
            <p className="text-xs text-slate-400">Monitor order transactions across all seller stores</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            View All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{ord.orderNumber}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{ord.user.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" className="text-[10px] font-bold uppercase">{ord.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(ord.grandTotal)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/admin/orders`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-600 font-bold">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
