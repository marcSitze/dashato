import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { couponSchema } from '@/schemas';

// GET /api/promotions/coupons - List coupons
export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/promotions/coupons - Create a new coupon (RBAC: Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = couponSchema.parse(body);

    const existing = await db.coupon.findUnique({ where: { code: validated.code } });
    if (existing) {
      return NextResponse.json({ error: `Coupon code ${validated.code} already exists` }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: validated.code,
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        minSpend: validated.minSpend || null,
        maxDiscount: validated.maxDiscount || null,
        usageLimit: validated.usageLimit || null,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
