import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

// PATCH /api/vendors/[id] - Approve/suspend vendor or adjust commission rate (RBAC: Admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, commissionRate, isApproved } = body;

    const vendor = await db.vendor.findUnique({ where: { id } });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const updated = await db.vendor.update({
      where: { id },
      data: {
        status: status || vendor.status,
        isApproved: isApproved !== undefined ? isApproved : status === 'APPROVED',
        commissionRate: commissionRate !== undefined ? parseFloat(commissionRate) : vendor.commissionRate,
      },
      include: { store: true, user: true },
    });

    // Notify vendor
    await NotificationService.send({
      userId: vendor.userId,
      title: `Vendor Account ${status === 'APPROVED' ? 'Approved!' : 'Updated'}`,
      message: `Your seller account status is now ${updated.status}. Commission rate: ${(updated.commissionRate * 100).toFixed(0)}%.`,
      type: 'SYSTEM',
      link: '/vendor',
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
