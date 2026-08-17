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
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-72 bg-slate-950 text-white border-r border-slate-800 flex flex-col flex-shrink-0 hidden lg:flex">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/">
            <img
              src="/Dashato_logo_dark_mode.png"
              alt="Dashato Admin"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-primary transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info & Storefront Link */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 text-xs">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 max-w-md w-full">
            {/* Mobile Navigation Drawer Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0">
                  <Menu className="w-5 h-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-slate-950 text-white p-0 border-r border-slate-800">
                <SheetHeader className="p-6 border-b border-slate-800 flex flex-row items-center justify-between">
                  <SheetTitle>
                    <img
                      src="/Dashato_logo_dark_mode.png"
                      alt="Dashato Admin"
                      className="h-8 w-auto object-contain"
                    />
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-1 overflow-y-auto">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-primary transition-colors"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
            <Input
              type="text"
              placeholder="Search orders, SKU, users..."
              className="h-9 text-xs rounded-xl border-border bg-card text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </Button>

            <div className="flex items-center gap-2 text-xs border-l border-border pl-2 sm:pl-3">
              <span className="font-bold text-foreground truncate max-w-[100px] sm:max-w-none">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
