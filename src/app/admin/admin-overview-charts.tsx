'use client';

import * as React from 'react';
import { useTranslation } from '@/lib/i18n/context';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export interface SalesDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryShare {
  name: string;
  value: number;
  color: string;
}

interface AdminOverviewChartsProps {
  salesData?: SalesDataPoint[];
  categoryDistribution?: CategoryShare[];
}

export function AdminOverviewCharts({
  salesData = [],
  categoryDistribution = [],
}: AdminOverviewChartsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-full">
      {/* Sales & Revenue Trend Chart */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {t.grossRevenueGrowthTimeline || "Chiffre d'Affaires Brut & Croissance"}
            </h3>
            <p className="text-xs text-slate-400">
              {t.monthlyRevenueTrend || 'Tendance mensuelle des revenus sur toutes les boutiques vendeurs'}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 w-fit">
            {t.financialYear || 'Exercice 2026'}
          </span>
        </div>

        <div className="h-72 w-full min-w-0 pt-4">
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, t.totalRevenue || "Chiffre d'Affaires"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Aucune donnée de vente pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Category Market Share Pie */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-w-0 max-w-full">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            {t.categoryMarketShare || 'Part de Marché par Catégorie'}
          </h3>
          <p className="text-xs text-slate-400">
            {t.departmentDistribution || 'Répartition des rayons par volume de vente'}
          </p>
        </div>

        <div className="h-56 w-full min-w-0 flex items-center justify-center">
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Part']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400">Aucune catégorie disponible</div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {categoryDistribution.map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 dark:text-slate-400 font-medium">{c.name}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{c.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

