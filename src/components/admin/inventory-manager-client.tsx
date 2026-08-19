'use client';

import * as React from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  History,
  Plus,
  Minus,
  CheckCircle2,
  PackageX,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface InventoryManagerClientProps {
  initialInventories: any[];
}

export function InventoryManagerClient({ initialInventories }: InventoryManagerClientProps) {
  const { t } = useTranslation();
  const [inventories, setInventories] = React.useState<any[]>(initialInventories);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'HEALTHY' | 'LOW' | 'OUT'>('ALL');

  // Selected item for adjustment dialog
  const [selectedInv, setSelectedInv] = React.useState<any | null>(null);
  const [adjustmentType, setAdjustmentType] = React.useState<'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'RETURN'>('RESTOCK');
  const [quantityInput, setQuantityInput] = React.useState<string>('10');
  const [thresholdInput, setThresholdInput] = React.useState<string>('5');
  const [reasonInput, setReasonInput] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // History log modal state
  const [historyInv, setHistoryInv] = React.useState<any | null>(null);

  // Sync state when props change
  React.useEffect(() => {
    setInventories(initialInventories);
  }, [initialInventories]);

  // Open adjustment modal
  const handleOpenAdjust = (inv: any) => {
    setSelectedInv(inv);
    setAdjustmentType('RESTOCK');
    setQuantityInput('10');
    setThresholdInput(String(inv.lowStockThreshold || 5));
    setReasonInput('');
  };

  // Submit stock adjustment
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInv) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        inventoryId: selectedInv.id,
        productId: selectedInv.productId,
        type: adjustmentType,
        lowStockThreshold: parseInt(thresholdInput, 10) || 5,
        reason: reasonInput || undefined,
      };

      if (adjustmentType === 'ADJUSTMENT') {
        payload.newQuantity = parseInt(quantityInput, 10) || 0;
      } else if (adjustmentType === 'SALE') {
        payload.quantityChange = -(Math.abs(parseInt(quantityInput, 10) || 0));
      } else {
        payload.quantityChange = Math.abs(parseInt(quantityInput, 10) || 0);
      }

      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      toast.success('Stock inventory updated successfully!');

      // Update local state item
      setInventories((prev) =>
        prev.map((item) => (item.id === selectedInv.id ? { ...item, ...data.data } : item))
      );

      setSelectedInv(null);
    } catch (err: any) {
      toast.error(err.message || 'Error saving stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered inventory list
  const filteredInventories = React.useMemo(() => {
    return inventories.filter((inv) => {
      const title = (inv.product?.title || inv.variant?.title || '').toLowerCase();
      const sku = (inv.product?.sku || inv.variant?.sku || '').toLowerCase();
      const matchesQuery = !searchQuery || title.includes(searchQuery.toLowerCase()) || sku.includes(searchQuery.toLowerCase());

      const isLow = inv.quantity > 0 && inv.quantity <= inv.lowStockThreshold;
      const isOut = inv.quantity <= 0;
      const isHealthy = inv.quantity > inv.lowStockThreshold;

      if (statusFilter === 'HEALTHY' && !isHealthy) return false;
      if (statusFilter === 'LOW' && !isLow) return false;
      if (statusFilter === 'OUT' && !isOut) return false;

      return matchesQuery;
    });
  }, [inventories, searchQuery, statusFilter]);

  // Statistics
  const totalStockUnits = inventories.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockCount = inventories.filter((i) => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length;
  const outOfStockCount = inventories.filter((i) => i.quantity <= 0).length;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Inventory & Stock Audit Logs
          </h1>
          <p className="text-sm text-slate-500">
            Real-time stock control, threshold alerts, and automated stock movement tracking
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Units in Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalStockUnits.toLocaleString()} units
          </div>
          <p className="text-xs text-slate-400">Across {inventories.length} catalog items</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{lowStockCount} items</div>
          <p className="text-xs text-slate-400">Below minimum threshold</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{outOfStockCount} items</div>
          <p className="text-xs text-slate-400">Requires urgent restock</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by SKU or Product Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-xs pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { label: 'All Items', value: 'ALL' },
            { label: 'Healthy Stock', value: 'HEALTHY' },
            { label: 'Low Stock Alerts', value: 'LOW' },
            { label: 'Out of Stock', value: 'OUT' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === tab.value
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product / Item</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInventories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No inventory records match the selected search or filter.
                  </td>
                </tr>
              ) : (
                filteredInventories.map((inv: any) => {
                  const title = inv.product?.title || inv.variant?.title || 'Product Item';
                  const sku = inv.product?.sku || inv.variant?.sku || 'SKU-NONE';
                  const isOut = inv.quantity <= 0;
                  const isLow = inv.quantity > 0 && inv.quantity <= inv.lowStockThreshold;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{sku}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{title}</div>
                        <div className="text-[10px] text-slate-400">
                          Store: {inv.product?.vendor?.store?.name || inv.product?.vendor?.businessName || 'Marketplace'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-base text-slate-900 dark:text-slate-100">
                        {inv.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{inv.lowStockThreshold} units</td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <Badge variant="destructive" className="uppercase font-bold text-[10px]">
                            Out of Stock
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" className="uppercase font-bold text-[10px]">
                            Low Stock Alert
                          </Badge>
                        ) : (
                          <Badge variant="success" className="uppercase font-bold text-[10px]">
                            Healthy Stock
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setHistoryInv(inv)}
                          className="h-7 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <History className="w-3.5 h-3.5 mr-1" /> Logs
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAdjust(inv)}
                          className="h-7 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm rounded-lg"
                        >
                          Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal Dialog */}
      <Dialog open={!!selectedInv} onOpenChange={(open) => !open && setSelectedInv(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Adjust Stock Inventory
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update quantity and stock thresholds for {selectedInv?.product?.title || selectedInv?.variant?.title || 'product'}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStock} className="space-y-4 pt-2">
            {/* Adjustment Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'RESTOCK', label: '+ Restock Add', icon: Plus },
                  { id: 'ADJUSTMENT', label: '= Set Quantity', icon: RefreshCw },
                  { id: 'SALE', label: '- Manual Sale', icon: Minus },
                  { id: 'RETURN', label: '+ Customer Return', icon: ArrowUpRight },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = adjustmentType === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setAdjustmentType(item.id as any)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Input */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {adjustmentType === 'ADJUSTMENT' ? 'New Total Quantity' : 'Quantity Units'}
                </label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="h-10 text-sm rounded-xl font-bold bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Low Stock Alert Threshold</label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="h-10 text-sm rounded-xl font-bold bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* Reason / Audit Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason / Notes (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Received new shipment batch #904"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelectedInv(null)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-6 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" variant="primary" className="mr-2" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Update Stock'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Movement Audit History Modal Dialog */}
      <Dialog open={!!historyInv} onOpenChange={(open) => !open && setHistoryInv(null)}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Stock Movement Audit Logs
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Historical logs for {historyInv?.product?.title || historyInv?.variant?.title || 'item'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 max-h-80 overflow-y-auto pr-1">
            {!historyInv?.movements || historyInv.movements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No movement logs recorded yet for this item.</p>
            ) : (
              historyInv.movements.map((mov: any) => (
                <div key={mov.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {mov.type}
                      </span>
                      <span>{mov.reason || 'Stock Update'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">{formatDate(mov.createdAt)}</p>
                  </div>

                  <span
                    className={`font-black text-sm ${
                      mov.quantity > 0
                        ? 'text-emerald-600'
                        : mov.quantity < 0
                        ? 'text-rose-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                  </span>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setHistoryInv(null)} className="w-full rounded-xl text-xs font-bold">
              Close Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
