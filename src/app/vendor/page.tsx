import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VendorDashboardClient } from './vendor-dashboard-client';

export default async function VendorPortalDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  let vendorStore: any = null;
  let grossSales = 0;
  let netEarnings = 0;
  let vendorProducts: any[] = [];
  let vendorOrderItems: any[] = [];

  try {
    const rawVendorObj = await db.vendor.findFirst({
      where: { userId: user.id },
      include: { store: true, commissions: true },
    });

    const vendorId = rawVendorObj?.id || '';

    const [rawProducts, rawOrderItems] = await Promise.all([
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

    grossSales = rawOrderItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const totalCommissionFees = grossSales * (rawVendorObj?.commissionRate || 0.10);
    netEarnings = grossSales - totalCommissionFees;

    vendorStore = JSON.parse(JSON.stringify(rawVendorObj || {}));
    vendorProducts = JSON.parse(JSON.stringify(rawProducts || []));
    vendorOrderItems = JSON.parse(JSON.stringify(rawOrderItems || []));
  } catch (err) {
    console.error('Error loading vendor dashboard:', err);
  }

  return (
    <VendorDashboardClient
      vendorStore={vendorStore}
      grossSales={grossSales}
      netEarnings={netEarnings}
      vendorProducts={vendorProducts}
      vendorOrderItems={vendorOrderItems}
    />
  );
}
