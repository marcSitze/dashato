import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
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
  Bell,
  Search,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Strict Server-Side Role Protection
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  const navLinks = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Product Directory', href: '/admin/products', icon: Package },
    { name: 'Categories Hierarchy', href: '/admin/categories', icon: FolderTree },
    { name: 'Brand Partners', href: '/admin/brands', icon: Tag },
    { name: 'Order Management', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Inventory & Stock Logs', href: '/admin/inventory', icon: Boxes },
    { name: 'Vendor Applications & Fees', href: '/admin/vendors', icon: Store },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Coupons & Flash Sales', href: '/admin/promotions', icon: Percent },
    { name: 'Review Moderation', href: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-950 text-white border-r border-slate-800 flex flex-col flex-shrink-0 hidden lg:flex">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-black text-xl px-3 py-1 rounded-xl flex items-center gap-1">
            Dashato <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Admin
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-amber-400 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info & Storefront Link */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 text-xs">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              A
            </div>
            <div className="truncate">
              <p className="font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400">System Platform Owner</p>
            </div>
          </div>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full text-xs font-bold border-slate-700 text-slate-300 hover:bg-slate-900">
              View Customer Storefront
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search orders, SKU, users, vendors..."
              className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            </Button>

            <div className="flex items-center gap-2 text-xs border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Route Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
