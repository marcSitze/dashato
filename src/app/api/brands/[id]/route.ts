import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { brandSchema } from '@/schemas';

// GET /api/brands/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await db.brand.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        products: { include: { images: true } },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/brands/[id] - Update brand (RBAC: Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = brandSchema.partial().parse(body);

    const updated = await db.brand.update({
      where: { id },
      data: {
        name: validated.name,
        slug: validated.slug ? validated.slug.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined,
        logo: validated.logo,
        description: validated.description,
        website: validated.website,
        isFeatured: validated.isFeatured,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/brands/[id] - Delete brand (RBAC: Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await db.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
