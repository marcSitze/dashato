'use client';

import * as React from 'react';
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

const salesData = [
  { month: 'Jan', revenue: 12400, orders: 120 },
  { month: 'Feb', revenue: 18900, orders: 190 },
  { month: 'Mar', revenue: 23400, orders: 240 },
  { month: 'Apr', revenue: 21000, orders: 210 },
  { month: 'May', revenue: 34800, orders: 350 },
  { month: 'Jun', revenue: 42100, orders: 410 },
  { month: 'Jul', revenue: 49800, orders: 490 },
  { month: 'Aug', revenue: 58400, orders: 560 },
];

const categoryDistribution = [
  { name: 'Laptops & Computers', value: 45, color: '#f59e0b' },
  { name: 'Audio & Headphones', value: 25, color: '#3b82f6' },
  { name: 'Home & Office', value: 20, color: '#10b981' },
  { name: 'Smart Wearables', value: 10, color: '#8b5cf6' },
];

export function AdminOverviewCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sales & Revenue Trend Chart */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Gross Revenue & Growth Timeline</h3>
            <p className="text-xs text-slate-400">Monthly revenue trend across all vendor stores</p>
          </div>
          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl">
            2026 Financial Year
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`$${val.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Market Share Pie */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Category Market Share</h3>
          <p className="text-xs text-slate-400">Department distribution by sales volume</p>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
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
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {categoryDistribution.map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{c.name}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{c.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
