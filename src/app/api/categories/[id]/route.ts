import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { categorySchema } from '@/schemas';

// GET /api/categories/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await db.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        parent: true,
        children: true,
        products: { include: { product: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update category (RBAC: Admin or Vendor)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDOR')) {
      return NextResponse.json({ error: 'Unauthorized: Admin or Vendor access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = categorySchema.partial().parse(body);

    const updated = await db.category.update({
      where: { id },
      data: {
        name: validated.name,
        slug: validated.slug ? validated.slug.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined,
        description: validated.description,
        image: validated.image,
        parentId: validated.parentId,
        isFeatured: validated.isFeatured,
        sortOrder: validated.sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete category (RBAC: Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
