'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingBag,
  Store,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { InlineOrderDropdown } from '@/components/orders/inline-order-dropdown';

interface CustomerOrdersClientProps {
  initialOrders: any[];
}

function getProductImageUrl(product: any): string {
  const first = product?.images?.[0];
  if (!first) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80';
  if (typeof first === 'string') return first;
  return first.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80';
}

export function CustomerOrdersClient({ initialOrders }: CustomerOrdersClientProps) {
  const { t } = useTranslation();
  const [orders] = React.useState<any[]>(initialOrders);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [expandedOrders, setExpandedOrders] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesNumber = order.orderNumber.toLowerCase().includes(query);
    const matchesItems = order.items?.some((it: any) =>
      it.product?.title?.toLowerCase().includes(query)
    );
    const matchesTracking = order.shipments?.some((sh: any) =>
      sh.trackingNumber?.toLowerCase().includes(query)
    );

    return matchesStatus && (matchesNumber || matchesItems || matchesTracking);
  });

  const statusFilters = [
    { key: 'ALL', label: t.all || 'Toutes' },
    { key: 'PENDING', label: t.unfulfilledStatus || 'En Attente' },
    { key: 'PROCESSING', label: t.processingStatus || 'En Préparation' },
    { key: 'SHIPPED', label: t.shippedStatus || 'Expédiées' },
    { key: 'DELIVERED', label: t.deliveredStatus || 'Livrées' },
  ];

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
        <Package className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t.noOrdersFound || 'Aucune commande trouvée'}
        </h2>
        <p className="text-sm text-slate-500">
          {t.haventPlacedOrders || "Vous n'avez pas encore passé de commande sur Dashato."}
        </p>
        <Link href="/products">
          <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">
            Commencer mes achats
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher par n° de commande, article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {statusFilters.map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st.key
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            Aucune commande ne correspond à votre filtre.
          </div>
        ) : (
          filteredOrders.map((ord: any) => {
            const isExpanded = expandedOrders[ord.id] || false;
            const shipment = ord.shipments?.[0];
            const payment = ord.payments?.[0];

            return (
              <div
                key={ord.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 transition-shadow hover:shadow-md"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-base tracking-tight">
                        #{ord.orderNumber}
                      </span>
                      <Badge variant="success" className="uppercase font-bold text-[10px]">
                        {ord.status}
                      </Badge>
                    </div>
                    <span className="text-slate-400 block text-xs">
                      Commandé le {formatDate(ord.createdAt)} • {ord.items.length} {ord.items.length > 1 ? 'articles' : 'article'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total</span>
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                        {formatCurrency(ord.grandTotal)}
                      </span>
                    </div>

                    {/* Popover Inline Dropdown trigger */}
                    <InlineOrderDropdown
                      order={ord}
                      detailsHref={`/account/orders/${ord.id}`}
                      variant="popover"
                    />

                    {/* Dedicated Order Details Screen Link */}
                    <Link href={`/account/orders/${ord.id}`}>
                      <Button
                        size="sm"
                        className="h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-sm shadow-amber-500/10"
                      >
                        <span>{t.viewFullDetails || 'Détails de la Commande'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Compact Items List Preview */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ord.items.map((item: any) => {
                    const imgUrl = getProductImageUrl(item.product);
                    const storeName = item.vendor?.store?.name || item.vendor?.businessName;

                    return (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 truncate block text-sm"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-slate-400 text-xs">
                              Vendu par : <span className="font-semibold text-slate-600 dark:text-slate-300">{storeName || 'Dashato'}</span> • Qté : {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900 dark:text-slate-100 font-mono text-sm flex-shrink-0">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Expandable Dropdown / Accordion for Minimal Order Informations */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(ord.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1"
                  >
                    <span>{isExpanded ? 'Masquer les informations minimales' : 'Afficher les informations minimales (Adresse, Suivi, Paiement)'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 animate-in fade-in slide-in-from-top-1 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Shipping Address */}
                        <div className="space-y-1">
                          <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            Adresse de Livraison
                          </span>
                          <div className="text-slate-700 dark:text-slate-300">
                            <p className="font-bold">{ord.shippingAddress?.fullName || 'Client'}</p>
                            <p>{ord.shippingAddress?.street} {ord.shippingAddress?.apartment ? `, Apt ${ord.shippingAddress.apartment}` : ''}</p>
                            <p>{ord.shippingAddress?.city}, {ord.shippingAddress?.country}</p>
                          </div>
                        </div>

                        {/* Shipment Tracking */}
                        <div className="space-y-1">
                          <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-amber-500" />
                            Suivi Transporteur
                          </span>
                          <div className="text-slate-700 dark:text-slate-300">
                            <p className="font-bold">{shipment?.carrier || 'Livraison Standard'}</p>
                            <p className="font-mono text-slate-500">
                              N°: {shipment?.trackingNumber || 'En préparation'}
                            </p>
                            <Badge variant="secondary" className="mt-1 text-[9px] font-bold">
                              {shipment?.status || 'TRAITEMENT'}
                            </Badge>
                          </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-1">
                          <span className="font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                            Règlement
                          </span>
                          <div className="text-slate-700 dark:text-slate-300">
                            <p className="font-bold">{payment?.paymentMethod || payment?.provider || 'Carte / Mobile Money'}</p>
                            <p className="text-slate-500 font-mono text-[11px]">
                              Total: {formatCurrency(ord.grandTotal)}
                            </p>
                            <Badge variant="success" className="mt-1 text-[9px] font-bold">
                              {payment?.status || 'PAYÉ'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                        <Link
                          href={`/account/orders/${ord.id}`}
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          Accéder à l'écran complet des détails de la commande <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
