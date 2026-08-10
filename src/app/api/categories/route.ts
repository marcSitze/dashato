import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { categorySchema } from '@/schemas';

// GET /api/categories - List all categories with parent/children hierarchy
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories - Create category (RBAC: Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = categorySchema.parse(body);

    const category = await db.category.create({
      data: {
        name: validated.name,
        slug: validated.slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: validated.description || null,
        image: validated.image || null,
        parentId: validated.parentId || null,
        isFeatured: validated.isFeatured,
        sortOrder: validated.sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
