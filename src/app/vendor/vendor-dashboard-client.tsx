'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import {
  TrendingUp,
  Plus,
  Package,
  ShoppingCart,
  DollarSign,
  ChevronRight,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface VendorDashboardClientProps {
  vendorStore: any;
  grossSales: number;
  netEarnings: number;
  vendorProducts: any[];
  vendorOrderItems: any[];
}

export function VendorDashboardClient({
  vendorStore,
  grossSales,
  netEarnings,
  vendorProducts,
  vendorOrderItems,
}: VendorDashboardClientProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Vendor Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={vendorStore?.store?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
            alt=""
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-700 bg-slate-950"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {vendorStore?.store?.name || vendorStore?.businessName || t.vendorPortalTitle || 'Vendor Seller Center'}
              </h1>
              <Badge variant="success" className="font-bold text-[10px] uppercase">
                Verified Seller
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-1">{vendorStore?.store?.description}</p>
            <div className="flex items-center gap-4 text-xs text-amber-400 font-semibold mt-2">
              <span>Commission Fee Rate: {(vendorStore?.commissionRate ?? 0.10) * 100}%</span>
              <span>• Store Rating: ★ {vendorStore?.store?.rating || 4.9}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/vendor/products/new">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-5 shadow-sm">
              <Plus className="w-4 h-4 mr-1.5" /> {t.addStoreProduct || '+ Add Store Product'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.grossSales || 'Gross Sales'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(grossSales)}</div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Lifetime total volume
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.netEarnings || 'Net Vendor Earnings'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(netEarnings)}</div>
          <div className="text-xs text-slate-400">After platform commission</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t.activeStoreProducts || 'Active Store Products'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{vendorProducts.length}</div>
          <div className="text-xs text-slate-400">Live listings</div>
        </div>
      </div>

      {/* Orders Fulfillment Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            {t.fulfillmentQueue || 'Fulfillment Queue for Store Orders'}
          </h3>
          <Link href="/vendor/orders" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            View All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Product Purchased</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vendorOrderItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No orders placed for your store products yet.
                  </td>
                </tr>
              ) : (
                vendorOrderItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{item.order?.orderNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{item.product?.title || 'Product'}</td>
                    <td className="py-3.5 px-4 font-bold">{item.quantity}</td>
                    <td className="py-3.5 px-4 font-extrabold">{formatCurrency(item.totalPrice)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="uppercase font-bold text-[10px]">{item.fulfillmentStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href="/vendor/orders">
                        <Button size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                          Manage
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
