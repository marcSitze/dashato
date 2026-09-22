'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Truck, CheckCircle2, Search, Filter, Loader2, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

interface VendorOrdersClientProps {
  initialOrderItems: any[];
}

export function VendorOrdersClient({ initialOrderItems }: VendorOrdersClientProps) {
  const router = useRouter();
  const [items, setItems] = React.useState<any[]>(initialOrderItems);
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [loadingItemId, setLoadingItemId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setItems(initialOrderItems);
  }, [initialOrderItems]);

  const handleMarkStatus = async (itemId: string, status: string = 'SHIPPED') => {
    setLoadingItemId(itemId);
    try {
      const res = await fetch(`/api/orders/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillmentStatus: status,
          carrier: 'Express Air Courier',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Update local state immediately
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, fulfillmentStatus: status } : item
        )
      );

      toast.success(
        status === 'SHIPPED'
          ? 'Order item marked as SHIPPED successfully!'
          : `Fulfillment status updated to ${status}`
      );

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shipment status');
    } finally {
      setLoadingItemId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus =
      filterStatus === 'ALL' || item.fulfillmentStatus === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const orderNumber = item.order?.orderNumber || '';
    const customerName = item.order?.user?.name || '';
    const productTitle = item.product?.title || '';

    const matchesSearch =
      !searchQuery ||
      orderNumber.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      productTitle.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHIPPED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase text-[10px] gap-1">
            <CheckCircle2 className="w-3 h-3" /> SHIPPED
          </Badge>
        );
      case 'DELIVERED':
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] gap-1">
            <PackageCheck className="w-3 h-3" /> DELIVERED
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold uppercase text-[10px]">
            PROCESSING
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold uppercase text-[10px]">
            UNFULFILLED
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search order #, customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {['ALL', 'UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Product Purchased</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No order items match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => {
                  const isShipped = item.fulfillmentStatus === 'SHIPPED' || item.fulfillmentStatus === 'DELIVERED';
                  const isLoading = loadingItemId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item.order?.orderNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.order?.user?.name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400">{item.order?.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.product?.title || 'Product'}</div>
                        <div className="text-[10px] text-slate-400">Qty: {item.quantity} • Unit: {formatCurrency(item.unitPrice)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.fulfillmentStatus)}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isShipped ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkStatus(item.id, 'DELIVERED')}
                            disabled={isLoading || item.fulfillmentStatus === 'DELIVERED'}
                            className="h-8 text-xs font-semibold rounded-xl text-purple-600 hover:bg-purple-500/10 gap-1.5"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PackageCheck className="w-3.5 h-3.5 text-purple-500" />
                            )}
                            {item.fulfillmentStatus === 'DELIVERED' ? 'Delivered' : 'Mark Delivered'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleMarkStatus(item.id, 'SHIPPED')}
                            disabled={isLoading}
                            className="h-8 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 gap-1.5 shadow-sm"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" />
                            )}
                            Mark Shipped
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
