import { db } from '@/lib/db';
import { InventoryManagerClient } from '@/components/admin/inventory-manager-client';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  let inventories: any[] = [];

  try {
    // 1. Find any products in the catalog missing an Inventory record and create default inventory
    const productsWithoutInventory = await db.product.findMany({
      where: { inventory: null },
      select: { id: true },
    });

    if (productsWithoutInventory.length > 0) {
      await Promise.all(
        productsWithoutInventory.map((p) =>
          db.inventory
            .create({
              data: {
                productId: p.id,
                quantity: 10,
                lowStockThreshold: 5,
              },
            })
            .catch(() => null)
        )
      );
    }

    // 2. Query all inventory stock items with vendor details and movement audit logs
    const rawInventories = await db.inventory.findMany({
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
    console.error('Error fetching admin inventory:', err);
  }

  return <InventoryManagerClient initialInventories={inventories} />;
}
