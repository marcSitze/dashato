'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Truck, CheckCircle2, Clock, AlertCircle, Save, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [status, setStatus] = React.useState(order.status);
  const [carrier, setCarrier] = React.useState(order.shipments?.[0]?.carrier || 'FedEx');
  const [trackingNumber, setTrackingNumber] = React.useState(order.shipments?.[0]?.trackingNumber || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          carrier,
          trackingNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      toast.success('Order status & shipment updated!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Update error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Items & Customer Info */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Ordered Marketplace Items ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.product.title}</span>
                    <p className="text-xs text-slate-500">
                      Seller: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.vendor.store?.name || item.vendor.businessName}</span>
                    </p>
                    <span className="text-xs font-mono text-slate-400">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-sm text-slate-900 dark:text-slate-100">{formatCurrency(item.totalPrice)}</span>
                  <Badge variant="outline" className="block mt-1 text-[10px]">
                    {item.fulfillmentStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Multi-Vendor Commission Splits */}
        {order.commissions.length > 0 && (
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Platform Commission & Vendor Payout Splits
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.commissions.map((comm: any) => (
                <div key={comm.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{comm.vendor.store?.name || comm.vendor.businessName}</span>
                    <p className="text-slate-500">Rate: {(comm.commissionRate * 100).toFixed(0)}% Platform Fee</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="block text-emerald-600 font-bold">Platform Fee: {formatCurrency(comm.commissionAmount)}</span>
                    <span className="block text-slate-600">Net Vendor Payout: {formatCurrency(comm.netVendorPayout)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Control Panel / Status Update */}
      <div className="space-y-6">
        <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Manage Fulfillment & Tracking
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAYMENT_CONFIRMED">PAYMENT CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Shipping Carrier</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-bold"
              >
                <option value="FedEx">FedEx Express</option>
                <option value="UPS">UPS Worldwide</option>
                <option value="DHL">DHL Express</option>
                <option value="USPS">USPS Priority</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Carrier Tracking Number</label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 78129031892"
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm h-11 shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4 mr-2" /> {isUpdating ? 'Saving...' : 'Update Order & Send Tracking'}
            </Button>
          </form>

          {/* Customer Shipping Address */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100">Shipping Address:</span>
            <div className="text-slate-600 dark:text-slate-300">
              <p className="font-semibold">{order.shippingAddress?.fullName || order.user.name}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
