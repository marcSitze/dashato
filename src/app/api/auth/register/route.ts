import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
      },
    });

    if (role === 'VENDOR') {
      await db.vendor.create({
        data: {
          userId: user.id,
          businessName: `${name}'s Store`,
          store: {
            create: {
              name: `${name}'s Store`,
              slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().substring(8)}`,
              description: 'Verified seller on Dashato Marketplace.',
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration error' }, { status: 500 });
  }
}
