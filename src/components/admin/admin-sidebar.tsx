'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Boxes,
  Store,
  Users,
  Percent,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navLinks = [
    { name: t.adminDashboardOverview || 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: t.adminProductDirectory || 'Product Directory', href: '/admin/products', icon: Package },
    { name: t.adminCategoriesHierarchy || 'Categories Hierarchy', href: '/admin/categories', icon: FolderTree },
    { name: t.adminBrandPartners || 'Brand Partners', href: '/admin/brands', icon: Tag },
    { name: t.adminOrderManagement || 'Order Management', href: '/admin/orders', icon: ShoppingCart },
    { name: t.adminInventoryStockLogs || 'Inventory & Stock Logs', href: '/admin/inventory', icon: Boxes },
    { name: t.adminVendorApplications || 'Vendor Applications & Fees', href: '/admin/vendors', icon: Store },
    { name: t.adminUserManagement || 'User Management', href: '/admin/users', icon: Users },
    { name: t.adminCouponsFlashSales || 'Coupons & Flash Sales', href: '/admin/promotions', icon: Percent },
    { name: t.adminReviewModeration || 'Review Moderation', href: '/admin/reviews', icon: Star },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 hidden lg:flex">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <img
            src="/Dashato_logo_light_mode.png"
            alt="Dashato Admin"
            className="h-8 w-auto dark:hidden object-contain"
          />
          <img
            src="/Dashato_logo_dark_mode.png"
            alt="Dashato Admin"
            className="h-8 w-auto hidden dark:block object-contain"
          />
        </Link>
        <span className="text-[10px] font-bold text-amber-600 dark:text-primary uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          {t.adminBadge || 'Admin'}
        </span>
      </div>

      {/* Navigation Menu Links */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors ${
                isActive
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-amber-600 dark:hover:text-primary font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Card & Storefront Direct Link */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.adminSystemPlatformOwner || 'System Platform Owner'}</p>
          </div>
        </div>
        <Link href="/" className="block">
          <Button variant="outline" className="w-full text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
            {t.viewCustomerStorefront || 'View Customer Storefront'}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
