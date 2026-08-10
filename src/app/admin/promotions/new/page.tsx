import { CouponFormClient } from '../coupon-form-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCouponPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/promotions" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Promotions
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Create Discount Coupon
        </h1>
        <p className="text-sm text-slate-500">Configure promotional discount codes, minimum spend limits, and expiration rules</p>
      </div>

      <CouponFormClient />
    </div>
  );
}
