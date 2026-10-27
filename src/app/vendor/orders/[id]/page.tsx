import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VendorOrderDetailView } from './vendor-order-detail-view';

export const dynamic = 'force-dynamic';

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const { id } = await params;

  let vendorId: string | undefined;
  if (user.role === 'VENDOR') {
    const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
    if (!vendorRecord) {
      redirect('/vendor/apply');
    }
    vendorId = vendorRecord.id;
  }

  const order = await db.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
      // If vendor, ensure they have at least one item in this order
      ...(user.role === 'VENDOR'
        ? { items: { some: { vendorId } } }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { include: { images: true } },
          variant: true,
          vendor: { include: { store: true } },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      shipments: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      commissions: { include: { vendor: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const safeOrder = JSON.parse(JSON.stringify(order));

  return (
    <div className="space-y-6">
      <VendorOrderDetailView
        order={safeOrder}
        vendorId={vendorId}
        isAdmin={user.role === 'ADMIN'}
      />
    </div>
  );
}
