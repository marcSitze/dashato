import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const products = await db.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { tags: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
      },
    });

    return NextResponse.json({ suggestions: products });
  } catch (error) {
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
