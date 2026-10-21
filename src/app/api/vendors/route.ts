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

// POST /api/vendors - Submit vendor application
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, storeName, supportEmail, supportPhone, taxId, description } = body;

    if (!businessName || !storeName || !supportEmail) {
      return NextResponse.json(
        { error: 'Business name, store name, and support email are required' },
        { status: 400 }
      );
    }

    // Generate unique slug for store
    const baseSlug = storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug || 'store'}-${Date.now().toString(36)}`;

    const vendor = await db.vendor.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        businessName,
        legalName: businessName,
        taxId: taxId || null,
        status: 'PENDING',
        isApproved: false,
        store: {
          create: {
            name: storeName,
            slug,
            description: description || null,
            supportEmail,
            supportPhone: supportPhone || null,
          },
        },
      },
      update: {
        businessName,
        legalName: businessName,
        taxId: taxId || null,
        store: {
          upsert: {
            create: {
              name: storeName,
              slug,
              description: description || null,
              supportEmail,
              supportPhone: supportPhone || null,
            },
            update: {
              name: storeName,
              description: description || null,
              supportEmail,
              supportPhone: supportPhone || null,
            },
          },
        },
      },
      include: { store: true },
    });

    return NextResponse.json({ success: true, data: vendor }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting vendor application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit vendor application' },
      { status: 500 }
    );
  }
}

