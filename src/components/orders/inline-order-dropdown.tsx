'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { toast } from 'sonner';

export interface MinimalOrderInfo {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string | Date;
  grandTotal: number;
  items?: any[];
  shippingAddress?: {
    fullName?: string;
    phoneNumber?: string;
    street?: string;
    apartment?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  shipments?: Array<{
    carrier?: string | null;
    trackingNumber?: string | null;
    status?: string;
    shippedAt?: string | Date | null;
  }>;
  payments?: Array<{
    provider?: string;
    status?: string;
    paymentMethod?: string;
    amount?: number;
  }>;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface InlineOrderDropdownProps {
  order: MinimalOrderInfo;
  detailsHref?: string;
  variant?: 'popover' | 'inline';
  className?: string;
  triggerLabel?: string;
}

function getProductImageUrl(product: any): string {
  const first = product?.images?.[0];
  if (!first) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=120&q=80';
  if (typeof first === 'string') return first;
  return first.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=120&q=80';
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
    case 'PAID':
    case 'PAYMENT_CONFIRMED':
      return 'success';
    case 'SHIPPED':
    case 'PROCESSING':
      return 'default';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function InlineOrderDropdown({
  order,
  detailsHref = `/account/orders/${order.id}`,
  variant = 'popover',
  className = '',
  triggerLabel,
}: InlineOrderDropdownProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const shipment = order.shipments?.[0];
  const payment = order.payments?.[0];
  const items = order.items || [];
  const address = order.shippingAddress;
  const itemCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  const handleCopyTracking = (e: React.MouseEvent, trackingNum: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trackingNum);
    setCopied(true);
    toast.success(t.copiedTracking || 'Tracking number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="space-y-3.5 text-xs">
      {/* Header with order number, status, and price */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              #{order.orderNumber}
            </span>
            <Badge
              variant={getStatusBadgeVariant(order.status)}
              className="text-[9px] uppercase font-bold py-0.5 px-1.5"
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {formatDate(order.createdAt)} • {itemCount} {itemCount > 1 ? 'articles' : 'article'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(order.grandTotal)}
          </span>
        </div>
      </div>

      {/* Minimal Items List (Up to 3 items) */}
      <div className="space-y-2">
        <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
          <ShoppingBag className="w-3 h-3 text-amber-500" />
          {t.itemsOrdered || 'Articles Commandés'} ({items.length})
        </span>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
          {items.slice(0, 3).map((item: any, idx: number) => {
            const imgUrl = getProductImageUrl(item.product);
            const title = item.product?.title || 'Produit';
            const storeName = item.vendor?.store?.name || item.vendor?.businessName;

            return (
              <div key={item.id || idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={imgUrl}
                    alt={title}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-800"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate text-[11px]">
                      {title}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Qté: {item.quantity}</span>
                      {storeName && (
                        <>
                          <span>•</span>
                          <span className="truncate flex items-center gap-0.5">
                            <Store className="w-2.5 h-2.5 text-slate-400" /> {storeName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 flex-shrink-0 text-[11px]">
                  {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                </span>
              </div>
            );
          })}
          {items.length > 3 && (
            <p className="pt-1.5 text-center text-[10px] font-semibold text-slate-400">
              +{items.length - 3} autre(s) article(s)...
            </p>
          )}
        </div>
      </div>

      {/* Minimal Delivery Destination */}
      {address && (
        <div className="space-y-1">
          <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-500" />
            {t.deliveryAddress || 'Adresse de Livraison'}
          </span>
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {address.fullName || order.user?.name || 'Destinataire'}
            </p>
            <p className="truncate">
              {address.street}
              {address.apartment ? `, Apt ${address.apartment}` : ''}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode} • {address.country}
            </p>
          </div>
        </div>
      )}

      {/* Shipment & Tracking or Status */}
      <div className="space-y-1">
        <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
          <Truck className="w-3 h-3 text-amber-500" />
          {t.carrierLabel || 'Expédition & Suivi'}
        </span>
        <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {shipment?.carrier || 'Livraison Standard Dashato'}
            </span>
            {shipment?.trackingNumber ? (
              <p className="text-slate-400 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                N°: {shipment.trackingNumber}
              </p>
            ) : (
              <p className="text-slate-400 text-[10px] mt-0.5">
                {t.noTrackingAvailable || 'En cours de préparation'}
              </p>
            )}
          </div>
          {shipment?.trackingNumber && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => handleCopyTracking(e, shipment.trackingNumber!)}
              className="h-6 px-2 text-[10px] rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1 font-semibold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copié' : 'Copier'}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      {payment && (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {payment.paymentMethod || payment.provider || 'Carte / Mobile Money'}
            </span>
          </div>
          <Badge
            variant={getStatusBadgeVariant(payment.status || 'PAID')}
            className="text-[9px] font-bold uppercase py-0 px-1.5"
          >
            {payment.status || 'PAID'}
          </Badge>
        </div>
      )}

      {/* Button to Full Order Details Screen */}
      <div className="pt-1">
        <Link href={detailsHref} className="block w-full">
          <Button
            size="sm"
            className="w-full h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs gap-1.5 shadow-sm shadow-amber-500/10"
          >
            <span>{t.viewFullDetails || 'Voir les Détails Complets'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`h-7 px-2.5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 gap-1 transition-all ${className}`}
        >
          <Package className="w-3.5 h-3.5 text-amber-500" />
          <span>{triggerLabel || t.quickOrderInfo || 'Infos Rapides'}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95"
      >
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
