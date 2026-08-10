import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createProductSchema } from '@/schemas';

// GET /api/products - List / search products with filters & pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category') || '';
    const brandSlug = searchParams.get('brand') || '';
    const status = searchParams.get('status') || 'ACTIVE';
    const vendorId = searchParams.get('vendorId') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const where: any = {};
    if (status !== 'ALL') where.status = status;
    if (vendorId) where.vendorId = vendorId;

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      where.categories = {
        some: { category: { slug: categorySlug } },
      };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { avgRating: 'desc' };
    if (sort === 'best_selling') orderBy = { isBestSeller: 'desc' };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          brand: true,
          vendor: { include: { store: true } },
          inventory: true,
          variants: true,
          categories: { include: { category: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product (RBAC: Vendor or Admin)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Vendor or Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = createProductSchema.parse(body);

    // Determine target vendorId
    let targetVendorId = validated.vendorId;
    if (user.role === 'VENDOR') {
      const vendorRecord = await db.vendor.findFirst({ where: { userId: user.id } });
      if (!vendorRecord) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 400 });
      }
      targetVendorId = vendorRecord.id;
    }

    if (!targetVendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }

    const slug = validated.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().substring(8);

    const product = await db.product.create({
      data: {
        title: validated.title,
        slug,
        description: validated.description,
        shortDesc: validated.shortDesc || null,
        sku: validated.sku,
        price: validated.price,
        compareAtPrice: validated.compareAtPrice || null,
        costPrice: validated.costPrice || null,
        brandId: validated.brandId || null,
        vendorId: targetVendorId,
        status: user.role === 'ADMIN' ? validated.status : 'PENDING_APPROVAL',
        isFeatured: validated.isFeatured,
        isBestSeller: validated.isBestSeller,
        isNewArrival: validated.isNewArrival,
        specifications: validated.specifications ? JSON.stringify(validated.specifications) : null,
        categories: {
          create: [{ categoryId: validated.categoryId }],
        },
        images: {
          create: validated.images.map((img: any, idx: number) => ({
            url: img.url,
            alt: img.alt || validated.title,
            isMain: img.isMain || idx === 0,
            sortOrder: idx,
          })),
        },
        inventory: {
          create: {
            quantity: validated.quantity,
            lowStockThreshold: validated.lowStockThreshold,
          },
        },
      },
      include: {
        images: true,
        inventory: true,
        vendor: { include: { store: true } },
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
