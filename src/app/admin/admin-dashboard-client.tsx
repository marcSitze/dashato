'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { AdminOverviewCharts, SalesDataPoint, CategoryShare } from './admin-overview-charts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Package,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AdminDashboardClientProps {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalVendors: number;
  totalProducts: number;
  recentOrders: any[];
  salesData?: SalesDataPoint[];
  categoryDistribution?: CategoryShare[];
}

export function AdminDashboardClient({
  totalRevenue,
  totalOrders,
  totalCustomers,
  totalVendors,
  totalProducts,
  recentOrders,
  salesData = [],
  categoryDistribution = [],
}: AdminDashboardClientProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t.executiveAdminAnalytics || 'Analytique de Direction'}
          </h1>
          <p className="text-sm text-slate-500">
            {t.realTimePerformanceMetrics || 'Performances et métriques de vente de la plateforme en temps réel'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-4 shadow-sm">
              {t.createProductBtn || '+ Créer un Produit'}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.totalRevenue || "Chiffre d'Affaires"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% {t.vsLastMonth || 'par rapport au mois dernier'}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.totalOrders || 'Commandes Totales'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalOrders}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +12.1% {t.growthRate || 'de croissance'}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.customers || 'Clients'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCustomers}</div>
          <div className="text-xs text-slate-400">{t.activeAccounts || 'Comptes actifs'}</div>
        </div>

        {/* Active Vendors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.activeVendors || 'Vendeurs Actifs'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalVendors}</div>
          <div className="text-xs text-slate-400">{t.verifiedStores || 'Boutiques vérifiées'}</div>
        </div>

        {/* Active Products */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.activeProducts || 'Produits Actifs'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalProducts}</div>
          <div className="text-xs text-slate-400">{t.inCatalog || 'En catalogue'}</div>
        </div>
      </div>

      {/* Visual Analytics Charts Component */}
      <AdminOverviewCharts salesData={salesData} categoryDistribution={categoryDistribution} />

      {/* Recent Marketplace Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {t.recentOrdersList || 'Commandes Récentes de la Marketplace'}
            </h3>
            <p className="text-xs text-slate-400">
              {t.monthlyRevenueTrend || 'Suivi des transactions sur toutes les boutiques de vendeurs'}
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            {t.viewAllOrders || 'Voir Toutes les Commandes'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto smooth-scroll-x rounded-2xl w-full">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">{t.orderNum || 'Commande N°'}</th>
                <th className="py-3 px-4">{t.customer || 'Client'}</th>
                <th className="py-3 px-4">{t.dateLabel || 'Date'}</th>
                <th className="py-3 px-4">{t.statusLabel || 'Statut'}</th>
                <th className="py-3 px-4">{t.amount || 'Montant'}</th>
                <th className="py-3 px-4 text-right">{t.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {t.noRecentOrders || 'Aucune commande récente trouvée.'}
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{ord.user?.name || ord.user?.email || 'Client'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="text-[10px] font-bold uppercase">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(ord.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/orders`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10">
                          {t.view || 'Voir'}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

