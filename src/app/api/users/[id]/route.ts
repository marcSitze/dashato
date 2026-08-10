import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PATCH /api/users/[id] - Update user role or status (RBAC: Admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status } = body;

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        role: role || user.role,
        status: status || user.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // If role changed to VENDOR and vendor record doesn't exist, create it
    if (role === 'VENDOR') {
      const existingVendor = await db.vendor.findFirst({ where: { userId: id } });
      if (!existingVendor) {
        await db.vendor.create({
          data: {
            userId: id,
            businessName: `${user.name}'s Store`,
            isApproved: true,
            status: 'APPROVED',
            store: {
              create: {
                name: `${user.name}'s Official Store`,
                slug: `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().substring(8)}`,
              },
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
