import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PATCH /api/reviews/[id] - Approve/reject review or submit vendor reply (RBAC: Admin or Vendor)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Vendor or Admin required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, vendorReply } = body;

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const updated = await db.review.update({
      where: { id },
      data: {
        status: status || review.status,
        vendorReply: vendorReply !== undefined ? vendorReply : review.vendorReply,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
