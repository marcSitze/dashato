'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Search,
  Bell,
  Menu,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Boxes,
  LogOut,
  Plus,
} from 'lucide-react';

interface VendorHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function VendorHeader({ user }: VendorHeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const navLinks = [
    { name: t.vendorDashboardNav || 'Seller Dashboard', href: '/vendor', icon: LayoutDashboard },
    { name: t.vendorProductsNav || 'My Store Products', href: '/vendor/products', icon: Package },
    { name: t.vendorOrdersNav || 'Store Orders & Fulfillment', href: '/vendor/orders', icon: ShoppingCart },
    { name: t.vendorCategoriesNav || 'Categories Catalog', href: '/vendor/categories', icon: FolderTree },
    { name: t.vendorInventoryNav || 'Stock Control', href: '/vendor/inventory', icon: Boxes },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Drawer & Search */}
      <div className="flex items-center gap-3 max-w-md w-full">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0">
              <Menu className="w-5 h-5 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-0 border-r border-slate-200 dark:border-slate-800">
            <SheetHeader className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
              <SheetTitle>
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
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/vendor' && pathname?.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>

        <div className="relative flex-1 hidden sm:block">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t.vendorSearchPlaceholder || 'Search store products, orders, SKU...'}
            className="h-9 text-xs pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-foreground shadow-none"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/vendor/products/new" className="hidden sm:block">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-3 shadow-sm h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Product
          </Button>
        </Link>
        <LanguageToggle />
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative hidden sm:flex hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        </Button>

        <div className="flex items-center gap-2 text-xs border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
          <span className="font-bold text-foreground truncate max-w-[100px] sm:max-w-none">{user.name}</span>
          <span className="hidden md:inline-block text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {t.vendorBadge || 'Seller'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Log Out"
            className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 h-8 w-8 rounded-lg ml-1"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
