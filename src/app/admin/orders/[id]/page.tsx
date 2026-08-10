import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { OrderDetailClient } from './order-detail-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      user: true,
      items: {
        include: {
          product: { include: { images: true } },
          vendor: { include: { store: true } },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      shipments: true,
      payments: true,
      commissions: { include: { vendor: { include: { store: true } } } },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin/orders" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order Stream
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <OrderDetailClient order={order} />
    </div>
  );
}
