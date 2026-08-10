import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import {
  Store,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function VendorPortalDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const vendorObj = await db.vendor.findFirst({
    where: { userId: user.id },
    include: { store: true, commissions: true },
  });

  const vendorId = vendorObj?.id || '';

  const [vendorProducts, vendorOrderItems] = await Promise.all([
    db.product.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: { inventory: true },
    }),
    db.orderItem.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: { order: { include: { user: true } }, product: true },
    }),
  ]);

  const grossSales = vendorOrderItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
  const totalCommissionFees = grossSales * (vendorObj?.commissionRate || 0.10);
  const netEarnings = grossSales - totalCommissionFees;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        {/* Vendor Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={vendorObj?.store?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  {vendorObj?.store?.name || vendorObj?.businessName || 'Vendor Seller Center'}
                </h1>
                <Badge variant="success" className="font-bold text-xs uppercase">Verified Seller</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{vendorObj?.store?.description}</p>
              <div className="flex items-center gap-4 text-xs text-amber-400 font-semibold mt-2">
                <span>Commission Fee Rate: {(vendorObj?.commissionRate ?? 0.10) * 100}%</span>
                <span>• Store Rating: ★ {vendorObj?.store?.rating || 4.9}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/products/new">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-5">
                <Plus className="w-4 h-4 mr-1.5" /> Add Store Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Vendor Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(grossSales)}</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Lifetime total volume
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Vendor Earnings</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(netEarnings)}</div>
            <div className="text-xs text-slate-400">After platform commission</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Store Products</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{vendorProducts.length}</div>
            <div className="text-xs text-slate-400">Live listings</div>
          </div>
        </div>

        {/* Vendor Orders Fulfillment Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Fulfillment Queue for Store Orders
          </h3>

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
                {vendorOrderItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{item.order.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{item.product.title}</td>
                    <td className="py-3.5 px-4 font-bold">{item.quantity}</td>
                    <td className="py-3.5 px-4 font-extrabold">{formatCurrency(item.totalPrice)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="uppercase font-bold text-[10px]">{item.fulfillmentStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg">
                        Mark Shipped
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
