import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { brandSchema } from '@/schemas';

// GET /api/brands - List all brands
export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch brands' }, { status: 500 });
  }
}

// POST /api/brands - Create brand (RBAC: Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = brandSchema.parse(body);

    const brand = await db.brand.create({
      data: {
        name: validated.name,
        slug: validated.slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        logo: validated.logo || null,
        description: validated.description || null,
        website: validated.website || null,
        isFeatured: validated.isFeatured,
      },
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create brand' }, { status: 500 });
  }
}
