import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import {
  Package,
  Heart,
  MapPin,
  Shield,
  CreditCard,
  User,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();

  const customerId = user?.id || '';

  const [ordersCount, wishlistCount, recentOrders] = await Promise.all([
    db.order.count({ where: { userId: customerId } }),
    db.wishlistItem.count({ where: { wishlist: { userId: customerId } } }),
    db.order.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        items: { include: { product: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Account Sidebar Navigation */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">
                {user?.name ? user.name[0] : 'C'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{user?.name || 'Customer Account'}</h3>
                <p className="text-xs text-slate-400">{user?.email || 'sarah@example.com'}</p>
              </div>
            </div>

            <nav className="space-y-1 text-sm font-semibold">
              <Link href="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <User className="w-4 h-4" /> Account Overview
              </Link>
              <Link href="/account/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Package className="w-4 h-4" /> My Orders ({ordersCount})
              </Link>
              <Link href="/account/wishlist" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Heart className="w-4 h-4" /> Wishlist ({wishlistCount})
              </Link>
              <Link href="/account/addresses" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <MapPin className="w-4 h-4" /> Saved Addresses
              </Link>
            </nav>
          </div>

          {/* Main Account Overview Content */}
          <div className="lg:col-span-9 space-y-6">
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Customer Account Dashboard
            </h1>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{ordersCount}</div>
                <div className="text-xs text-slate-500 font-semibold">Total Orders Placed</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{wishlistCount}</div>
                <div className="text-xs text-slate-500 font-semibold">Saved Wishlist Items</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Verified</div>
                <div className="text-xs text-slate-500 font-semibold">Account Protection</div>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Recent Orders</h3>
                <Link href="/account/orders" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  View All Orders
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No recent orders found.</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((ord: any) => (
                    <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ord.orderNumber}</span>
                          <Badge variant="success" className="text-[10px] uppercase font-bold">{ord.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(ord.createdAt)} • {ord.items.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{formatCurrency(ord.grandTotal)}</div>
                        <Link href="/account/orders" className="text-xs font-semibold text-amber-600 hover:underline">
                          Details & Tracking
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
