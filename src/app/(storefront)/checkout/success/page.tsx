import Link from 'next/link';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CheckCircle2, Package, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    orderId?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { orderNumber, orderId } = await searchParams;

  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true, vendor: { include: { store: true } } } },
          shippingAddress: true,
          payments: true,
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              Payment Confirmed
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Thank You For Your Order!
            </h1>
            <p className="text-sm text-slate-500">
              Order Number: <strong className="text-slate-900 dark:text-slate-100 font-mono">{orderNumber || order?.orderNumber || 'DSH-2026-8819'}</strong>
            </p>
          </div>

          {order && (
            <div className="text-left bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400">Order Date:</span>
                  <span className="font-bold ml-1 text-slate-900 dark:text-slate-100">{formatDate(order.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-black ml-1 text-amber-600 dark:text-amber-400">{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">Ordered Items ({order.items.length}):</span>
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{item.product.title} (x{item.quantity})</span>
                    <span className="font-mono">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/account/orders">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6 text-sm">
                <Package className="w-4 h-4 mr-2" /> Track Order Status
              </Button>
            </Link>

            <Link href="/products">
              <Button size="lg" variant="outline" className="rounded-xl px-6 text-sm">
                Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
