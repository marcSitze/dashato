'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  PackageCheck,
  Save,
  Loader2,
  ExternalLink,
  Store,
  CreditCard,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { toast } from 'sonner';

interface VendorOrderDetailViewProps {
  order: any;
  vendorId?: string;
  isAdmin?: boolean;
}

function getProductImageUrl(product: any): string {
  const first = product?.images?.[0];
  if (!first) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80';
  if (typeof first === 'string') return first;
  return first.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80';
}

export function VendorOrderDetailView({ order, vendorId, isAdmin = false }: VendorOrderDetailViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [carrier, setCarrier] = React.useState(order.shipments?.[0]?.carrier || 'FedEx');
  const [trackingNumber, setTrackingNumber] = React.useState(order.shipments?.[0]?.trackingNumber || '');
  const [itemStatuses, setItemStatuses] = React.useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (order.items || []).forEach((it: any) => {
      map[it.id] = it.fulfillmentStatus || 'UNFULFILLED';
    });
    return map;
  });

  // Filter items if vendor is not admin
  const relevantItems = isAdmin
    ? order.items || []
    : (order.items || []).filter((it: any) => !vendorId || it.vendorId === vendorId);

  const vendorTotal = relevantItems.reduce((acc: number, it: any) => acc + (it.totalPrice || 0), 0);

  // Vendor commission if any
  const relevantCommission = order.commissions?.find((c: any) => !vendorId || c.vendorId === vendorId);

  const handleUpdateItemStatus = async (itemId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de mise à jour');

      setItemStatuses((prev) => ({ ...prev, [itemId]: newStatus }));
      toast.success(`Statut de l'article mis à jour : ${newStatus}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de mettre à jour le statut');
    }
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier,
          trackingNumber,
          fulfillmentStatus: 'SHIPPED',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour du suivi');

      toast.success(t.orderMarkedShippedToast || 'Expédition enregistrée et client notifié !');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const shippingAddress = order.shippingAddress;
  const payment = order.payments?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/vendor/orders"
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t.vendorOrdersNav || 'Retour aux Commandes de la Boutique'}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Commande #{order.orderNumber}
              </h1>
              <Badge variant="success" className="uppercase font-bold text-xs">
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Passée le {formatDate(order.createdAt)} à {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Volume de Vente</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {formatCurrency(vendorTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items to Fulfill & Payouts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Articles à expédier ({relevantItems.length})</span>
              <span className="text-xs font-mono text-slate-400">Total : {formatCurrency(vendorTotal)}</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {relevantItems.map((item: any) => {
                const img = getProductImageUrl(item.product);
                const currentStatus = itemStatuses[item.id] || item.fulfillmentStatus;

                return (
                  <div key={item.id} className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={img}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <Link
                          href={`/products/${item.product?.slug}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-amber-500"
                        >
                          {item.product?.title || 'Produit'}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono">
                          Qté : <strong>{item.quantity}</strong> × {formatCurrency(item.unitPrice)}
                        </p>
                        {item.variant?.title && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Option : {item.variant.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                        {formatCurrency(item.totalPrice)}
                      </span>

                      {/* Status Selector */}
                      <select
                        value={currentStatus}
                        onChange={(e) => handleUpdateItemStatus(item.id, e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="UNFULFILLED">EN ATTENTE</option>
                        <option value="PROCESSING">EN COURS</option>
                        <option value="SHIPPED">EXPÉDIÉ</option>
                        <option value="DELIVERED">LIVRÉ</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Commission & Net Vendor Earnings */}
          {relevantCommission && (
            <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Commissions & Revenus Nets Vendeur
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vente Brute</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {formatCurrency(relevantCommission.grossAmount || vendorTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Frais Plateforme</span>
                  <span className="font-bold text-rose-500 text-sm">
                    -{formatCurrency(relevantCommission.feeAmount || (vendorTotal * 0.1))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Versement Net Vendeur</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(relevantCommission.netAmount || (vendorTotal * 0.9))}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Tracking & Shipping Address */}
        <div className="space-y-6">
          {/* Tracking Form */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" /> Expédition & N° de Suivi
            </h3>

            <form onSubmit={handleUpdateShipment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Transporteur</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 font-semibold"
                >
                  <option value="FedEx">FedEx Express</option>
                  <option value="DHL">DHL Express</option>
                  <option value="UPS">UPS Worldwide</option>
                  <option value="Chronopost">Chronopost</option>
                  <option value="Standard">Standard Local</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Numéro de suivi</label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ex: TRK-981249012"
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs h-9 shadow-sm shadow-amber-500/10 mt-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Enregistrer l'Expédition
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Customer & Destination Info */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Destination de Livraison
            </h3>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Client</span>
                <p>{shippingAddress?.fullName || order.user?.name || 'Client'}</p>
                <p className="text-slate-400 text-[11px]">{order.user?.email}</p>
              </div>

              {shippingAddress && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Adresse</span>
                  <p>{shippingAddress.street} {shippingAddress.apartment ? `, Apt ${shippingAddress.apartment}` : ''}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{shippingAddress.country}</p>
                  {shippingAddress.phoneNumber && (
                    <p className="text-slate-400 font-mono pt-1">Tél : {shippingAddress.phoneNumber}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
