import { db } from '@/lib/db';
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default async function AdminInventoryPage() {
  const inventories = await db.inventory.findMany({
    include: {
      product: true,
      variant: true,
      movements: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Inventory Management & Stock Movement Logs
          </h1>
          <p className="text-sm text-slate-500">Track real-time inventory levels, low-stock thresholds, and stock audit trails</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Product SKU</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Low Stock Threshold</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {inventories.map((inv: any) => {
                const title = inv.product?.title || inv.variant?.title || 'Product Item';
                const sku = inv.product?.sku || inv.variant?.sku || 'SKU';
                const isLow = inv.quantity <= inv.lowStockThreshold;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{sku}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{title}</td>
                    <td className="py-3.5 px-4 font-black text-base text-slate-900 dark:text-slate-100">{inv.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.lowStockThreshold} units</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={isLow ? 'destructive' : 'success'} className="uppercase font-bold text-[10px]">
                        {isLow ? 'Low Stock Alert' : 'Healthy Stock'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-amber-600">
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
