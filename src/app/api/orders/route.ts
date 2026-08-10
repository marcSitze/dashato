import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/orders - List orders with RBAC scoping
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const where: any = {};
    if (status) where.status = status;

    // RBAC scoping rules
    if (user.role === 'CUSTOMER') {
      where.userId = user.id;
    } else if (user.role === 'VENDOR') {
      const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
      if (!vendorRecord) {
        return NextResponse.json({ success: true, data: [], pagination: { total: 0, page, limit, totalPages: 0 } });
      }
      where.items = {
        some: { vendorId: vendorRecord.id },
      };
    }
    // ADMIN sees all orders

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          items: {
            include: {
              product: { select: { id: true, title: true, slug: true, images: true } },
              vendor: { include: { store: true } },
            },
          },
          shippingAddress: true,
          shipments: true,
          payments: true,
          commissions: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}
