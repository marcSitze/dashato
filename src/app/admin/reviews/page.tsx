import { db } from '@/lib/db';
import { Star, CheckCircle, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      product: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Customer Reviews Moderation Center
          </h1>
          <p className="text-sm text-slate-500">Review rating feedback, approve customer reviews, and monitor vendor responses</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reviews.map((rev: any) => (
            <div key={rev.id} className="py-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{rev.user.name}</span>
                  <span className="text-xs text-slate-400">on <strong className="text-slate-700 dark:text-slate-300">{rev.product.title}</strong></span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
                <Badge variant={rev.status === 'APPROVED' ? 'success' : 'warning'} className="uppercase font-bold text-[10px]">
                  {rev.status}
                </Badge>
              </div>

              {rev.title && <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{rev.title}</h4>}
              <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>

              {rev.vendorReply && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <span className="font-bold text-amber-600">Vendor Reply:</span>
                  <p className="text-slate-700 dark:text-slate-300">{rev.vendorReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
