import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { CustomerOrdersClient } from './customer-orders-client';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();
  let orders: any[] = [];

  if (user?.id) {
    try {
      const rawOrders = await db.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
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
        },
      });
      orders = JSON.parse(JSON.stringify(rawOrders || []));
    } catch (err) {
      console.error('Customer orders page db error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Historique de Commandes & Suivi des Colis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consultez les informations minimales ou accédez à l'écran détaillé de chacune de vos commandes
          </p>
        </div>

        <CustomerOrdersClient initialOrders={orders} />
      </main>

      <Footer />
    </div>
  );
}

