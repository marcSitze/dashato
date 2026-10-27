import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users - List users (RBAC: Admin only)
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user (RBAC: Admin only)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const body = await request.json();
    const { name, email, password, role = 'CUSTOMER', status = 'ACTIVE' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Le nom, l\'email et le mot de passe sont obligatoires' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà enregistré sur la plateforme' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
        status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // If created as VENDOR, provision vendor and store record
    if (role === 'VENDOR') {
      await db.vendor.create({
        data: {
          userId: user.id,
          businessName: `${user.name}'s Store`,
          isApproved: true,
          status: 'APPROVED',
          commissionRate: 0.10,
          store: {
            create: {
              name: `${user.name}'s Official Store`,
              slug: `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().substring(8)}`,
              description: 'Boutique vérifiée sur Dashato Marketplace.',
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        _count: { orders: 0, reviews: 0 },
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

