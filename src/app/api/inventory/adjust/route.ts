import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { inventoryId, productId, type = 'ADJUSTMENT', quantityChange, newQuantity, lowStockThreshold, reason } = body;

    let targetInventoryId = inventoryId;

    // Find or create inventory if only productId was provided
    if (!targetInventoryId && productId) {
      let inv = await db.inventory.findUnique({ where: { productId } });
      if (!inv) {
        inv = await db.inventory.create({
          data: {
            productId,
            quantity: 0,
            lowStockThreshold: 5,
          },
        });
      }
      targetInventoryId = inv.id;
    }

    if (!targetInventoryId) {
      return NextResponse.json({ error: 'inventoryId or productId is required' }, { status: 400 });
    }

    const existing = await db.inventory.findUnique({
      where: { id: targetInventoryId },
      include: { product: true, variant: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 });
    }

    // Determine final quantity
    let updatedQuantity = existing.quantity;
    let delta = 0;

    if (newQuantity !== undefined && !isNaN(parseInt(newQuantity, 10))) {
      const parsedNew = Math.max(0, parseInt(newQuantity, 10));
      delta = parsedNew - existing.quantity;
      updatedQuantity = parsedNew;
    } else if (quantityChange !== undefined && !isNaN(parseInt(quantityChange, 10))) {
      delta = parseInt(quantityChange, 10);
      updatedQuantity = Math.max(0, existing.quantity + delta);
    }

    const updatedThreshold =
      lowStockThreshold !== undefined && !isNaN(parseInt(lowStockThreshold, 10))
        ? Math.max(0, parseInt(lowStockThreshold, 10))
        : existing.lowStockThreshold;

    // Transaction to update inventory and log movement
    const [updatedInventory, movement] = await db.$transaction([
      db.inventory.update({
        where: { id: targetInventoryId },
        data: {
          quantity: updatedQuantity,
          lowStockThreshold: updatedThreshold,
        },
        include: {
          product: true,
          variant: true,
          movements: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      }),
      db.inventoryMovement.create({
        data: {
          inventoryId: targetInventoryId,
          type: type as any,
          quantity: delta,
          reason: reason || `Manual ${type.toLowerCase()} by ${user.name || 'Admin'}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedInventory,
    });
  } catch (error: any) {
    console.error('Inventory adjust error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update stock' }, { status: 500 });
  }
}
