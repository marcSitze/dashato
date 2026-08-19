'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Boxes,
  LogOut,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  vendorStore?: {
    name?: string;
    logo?: string;
    rating?: number;
  } | null;
}

export function VendorSidebar({ user, vendorStore }: VendorSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navLinks = [
    { name: t.vendorDashboardNav || 'Seller Dashboard', href: '/vendor', icon: LayoutDashboard },
    { name: t.vendorProductsNav || 'My Store Products', href: '/vendor/products', icon: Package },
    { name: t.vendorOrdersNav || 'Store Orders & Fulfillment', href: '/vendor/orders', icon: ShoppingCart },
    { name: t.vendorCategoriesNav || 'Categories Catalog', href: '/vendor/categories', icon: FolderTree },
    { name: t.vendorInventoryNav || 'Stock Control', href: '/vendor/inventory', icon: Boxes },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 hidden lg:flex">
      {/* Logo & Badge Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/vendor" className="flex items-center gap-2">
          <img
            src="/Dashato_logo_light_mode.png"
            alt="Dashato Vendor"
            className="h-8 w-auto dark:hidden object-contain"
          />
          <img
            src="/Dashato_logo_dark_mode.png"
            alt="Dashato Vendor"
            className="h-8 w-auto hidden dark:block object-contain"
          />
        </Link>
        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {t.vendorBadge || 'Seller Center'}
        </span>
      </div>

      {/* Vendor Store Card */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <img
            src={vendorStore?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80'}
            alt=""
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
              {vendorStore?.name || 'Seller Store'}
            </p>
            <p className="text-[10px] text-amber-500 font-semibold">★ {vendorStore?.rating || 4.9} Store Rating</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu Links */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/vendor' && pathname?.startsWith(link.href));

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

      {/* User Card & Logout Action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center">
            {user.name ? user.name.charAt(0).toUpperCase() : 'V'}
          </div>
          <div className="truncate">
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Verified Marketplace Partner</p>
          </div>
        </div>

        <Link href="/" className="block">
          <Button variant="outline" className="w-full text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">
            {t.viewCustomerStorefront || 'View Customer Storefront'}
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-600 flex items-center justify-center gap-2 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.signOut || 'Log Out'}</span>
        </Button>
      </div>
    </aside>
  );
}
