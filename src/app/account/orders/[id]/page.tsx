import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { OrderDetailsScreen } from './order-details-screen';

export const dynamic = 'force-dynamic';

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    const { id } = await params;
    redirect(`/login?callbackUrl=/account/orders/${id}`);
  }

  const { id } = await params;

  let order: any = null;

  try {
    order = await db.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
              },
            },
            variant: true,
            vendor: {
              include: {
                store: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        shipments: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        refunds: true,
      },
    });
  } catch (err) {
    console.error('Error fetching order details:', err);
  }

  if (!order) {
    notFound();
  }

  // Access control: Customer can only view their own orders
  if (user.role === 'CUSTOMER' && order.userId !== user.id) {
    notFound();
  }

  const safeOrder = JSON.parse(JSON.stringify(order));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
        <OrderDetailsScreen order={safeOrder} />
      </main>

      <Footer />
    </div>
  );
}
