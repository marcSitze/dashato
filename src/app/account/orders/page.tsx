import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { Package, Truck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();

  const orders = await db.order.findMany({
    where: { userId: user?.id || '' },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true, vendor: { include: { store: true } } } },
      shipments: true,
      payments: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-8">
          My Order History & Shipment Tracking
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Orders Found</h2>
            <p className="text-sm text-slate-500">You haven't placed any orders on Dashato yet.</p>
            <Link href="/products">
              <Button className="bg-amber-500 text-slate-950 font-bold rounded-xl">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord: any) => (
              <div key={ord.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{ord.orderNumber}</span>
                      <Badge variant="success" className="uppercase font-bold text-[10px]">{ord.status}</Badge>
                    </div>
                    <span className="text-slate-400">Placed on {formatDate(ord.createdAt)}</span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{formatCurrency(ord.grandTotal)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ord.items.map((item: any) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <Link href={`/products/${item.product.slug}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500">
                            {item.product.title}
                          </Link>
                          <p className="text-slate-400">Fulfilled by: {item.vendor.store?.name || item.vendor.businessName} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking & Actions Footer */}
                {ord.shipments.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">Tracking Carrier: {ord.shipments[0].carrier}</span>
                        <p className="text-slate-500 font-mono">Tracking #: {ord.shipments[0].trackingNumber}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold">{ord.shipments[0].status}</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
