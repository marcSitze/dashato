import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { InventoryManagerClient } from '@/components/admin/inventory-manager-client';

export const dynamic = 'force-dynamic';

export default async function VendorInventoryPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  let inventories: any[] = [];

  try {
    const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
    const vendorId = vendorRecord?.id || '';

    // Auto-create missing inventory records for vendor's products
    const vendorProductsWithoutInventory = await db.product.findMany({
      where: { vendorId, inventory: null },
      select: { id: true },
    });

    if (vendorProductsWithoutInventory.length > 0) {
      await Promise.all(
        vendorProductsWithoutInventory.map((p) =>
          db.inventory
            .create({
              data: {
                productId: p.id,
                quantity: 15,
                lowStockThreshold: 5,
              },
            })
            .catch(() => null)
        )
      );
    }

    // Query inventory for vendor products only
    const rawInventories = await db.inventory.findMany({
      where: {
        product: { vendorId },
      },
      include: {
        product: {
          include: {
            vendor: { include: { store: true } },
          },
        },
        variant: true,
        movements: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    inventories = JSON.parse(JSON.stringify(rawInventories || []));
  } catch (err) {
    console.error('Error fetching vendor inventory:', err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Store Stock Inventory Control
        </h1>
        <p className="text-sm text-slate-500">Monitor stock levels, restock items, and audit inventory movements for your store</p>
      </div>

      <InventoryManagerClient initialInventories={inventories} />
    </div>
  );
}
