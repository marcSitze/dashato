import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/vendors - List vendors
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status) where.status = status;

    const vendors = await db.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        store: true,
        _count: { select: { products: true, orderItems: true } },
      },
    });

    return NextResponse.json({ success: true, data: vendors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch vendors' }, { status: 500 });
  }
}
