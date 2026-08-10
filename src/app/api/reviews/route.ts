import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { reviewSchema } from '@/schemas';

// GET /api/reviews - List reviews
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || '';
    const status = searchParams.get('status') || 'APPROVED';

    const where: any = {};
    if (productId) where.productId = productId;
    if (status !== 'ALL') where.status = status;

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews - Submit review for a product (RBAC: Authenticated user)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in to review' }, { status: 401 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const product = await db.product.findUnique({ where: { id: validated.productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const review = await db.review.create({
      data: {
        productId: validated.productId,
        userId: user.id,
        rating: validated.rating,
        title: validated.title || null,
        comment: validated.comment,
        status: 'APPROVED',
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Recalculate Product avgRating & reviewCount
    const allReviews = await db.review.findMany({
      where: { productId: validated.productId, status: 'APPROVED' },
    });

    const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id: validated.productId },
      data: {
        avgRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
