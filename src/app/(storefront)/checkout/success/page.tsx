import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CheckoutSuccessClient } from './checkout-success-client';

export interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    orderId?: string;
    whatsappUrl?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { orderNumber, orderId, whatsappUrl } = await searchParams;

  let order: any = null;
  if (orderId) {
    try {
      const rawOrder = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true, vendor: { include: { store: true } } } },
          shippingAddress: true,
          payments: true,
        },
      });
      order = JSON.parse(JSON.stringify(rawOrder || null));
    } catch (err) {
      console.error('Error fetching checkout success order:', err);
    }
  }

  const targetWhatsappUrl = whatsappUrl ? decodeURIComponent(whatsappUrl) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <CheckoutSuccessClient
          orderNumber={orderNumber}
          order={order}
          whatsappUrl={targetWhatsappUrl}
        />
      </main>

      <Footer />
    </div>
  );
}
