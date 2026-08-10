import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { updateProductSchema } from '@/schemas';

// GET /api/products/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        vendor: { include: { store: true } },
        inventory: true,
        variants: true,
        categories: { include: { category: true } },
        reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update product (RBAC: Vendor owner or Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verify vendor ownership if role is VENDOR
    if (user.role === 'VENDOR') {
      const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
      if (!vendorRecord || existing.vendorId !== vendorRecord.id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this product' }, { status: 403 });
      }
    }

    const body = await request.json();
    const validated = updateProductSchema.parse(body);

    const updated = await db.product.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        shortDesc: validated.shortDesc,
        price: validated.price,
        compareAtPrice: validated.compareAtPrice,
        costPrice: validated.costPrice,
        status: validated.status as any,
        isFeatured: validated.isFeatured,
        isBestSeller: validated.isBestSeller,
        isNewArrival: validated.isNewArrival,
        specifications: validated.specifications ? JSON.stringify(validated.specifications) : undefined,
      },
      include: {
        images: true,
        inventory: true,
        vendor: { include: { store: true } },
      },
    });

    // Update inventory quantity if provided
    if (validated.quantity !== undefined && updated.inventory) {
      await db.inventory.update({
        where: { id: updated.inventory.id },
        data: { quantity: validated.quantity },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Archive / soft-delete product (RBAC: Admin or Vendor owner)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (user.role === 'VENDOR') {
      const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
      if (!vendorRecord || existing.vendorId !== vendorRecord.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Set status to ARCHIVED
    const archived = await db.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true, message: 'Product archived successfully', data: archived });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
