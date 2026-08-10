'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function CouponFormClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [code, setCode] = React.useState('');
  const [discountType, setDiscountType] = React.useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = React.useState('');
  const [minSpend, setMinSpend] = React.useState('');
  const [usageLimit, setUsageLimit] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minSpend: minSpend ? parseFloat(minSpend) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive,
      };

      const res = await fetch('/api/promotions/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      toast.success('Coupon created successfully!');
      router.push('/admin/promotions');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Coupon save error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl p-8 border-slate-200 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Coupon Code *</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. SUMMER25"
            className="rounded-xl font-mono text-sm uppercase"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount Type *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount Value *</label>
            <Input
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="e.g. 15 for 15% or $15"
              className="rounded-xl font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Minimum Order Spend ($)</label>
            <Input
              type="number"
              step="0.01"
              value={minSpend}
              onChange={(e) => setMinSpend(e.target.value)}
              placeholder="50.00"
              className="rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Usage Limit</label>
            <Input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="100"
              className="rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="active" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            Coupon Active Immediately
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base px-6 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
