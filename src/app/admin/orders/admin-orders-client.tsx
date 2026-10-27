'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Truck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  ShoppingBag,
  Store,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { InlineOrderDropdown } from '@/components/orders/inline-order-dropdown';

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
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
    const matchesUser =
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query);
    const matchesItems = order.items?.some((it: any) =>
      it.product?.title?.toLowerCase().includes(query)
    );
    const matchesTracking = order.shipments?.some((sh: any) =>
      sh.trackingNumber?.toLowerCase().includes(query)
    );

    return matchesStatus && (matchesNumber || matchesUser || matchesItems || matchesTracking);
  });

  const statusFilters = [
    { key: 'ALL', label: t.all || 'Toutes' },
    { key: 'PENDING', label: t.unfulfilledStatus || 'En Attente' },
    { key: 'PROCESSING', label: t.processingStatus || 'En Préparation' },
    { key: 'SHIPPED', label: t.shippedStatus || 'Expédiées' },
    { key: 'DELIVERED', label: t.deliveredStatus || 'Livrées' },
    { key: 'CANCELLED', label: 'Annulées' },
  ];

  return (
    <div className="space-y-6">
      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={t.adminSearchPlaceholder || 'Rechercher commande n°, client, produit...'}
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

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <div className="overflow-x-auto smooth-scroll-x rounded-2xl w-full">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 px-3">Commande N°</th>
                <th className="py-3 px-4">Détails du Client</th>
                <th className="py-3 px-4">Articles & Boutiques</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Total Général</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Aucune commande enregistrée ou trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord: any) => {
                  const isExpanded = expandedOrders[ord.id] || false;
                  const shipment = ord.shipments?.[0];
                  const payment = ord.payments?.[0];
                  const shippingAddress = ord.shippingAddress;

                  return (
                    <React.Fragment key={ord.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(ord.id)}
                            className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title={isExpanded ? 'Masquer aperçu' : 'Afficher aperçu minimal'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-amber-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="hover:text-amber-500 transition-colors"
                          >
                            {ord.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{ord.user?.name || 'Client'}</div>
                          <div className="text-[10px] text-slate-400">{ord.user?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {ord.items?.map((it: any) => (
                              <div key={it.id} className="text-[11px] text-slate-600 dark:text-slate-300">
                                • {it.product?.title ? `${it.product.title.substring(0, 26)}...` : 'Produit'} (Boutique: {it.vendor?.store?.name || it.vendor?.businessName || 'Marketplace'})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="success" className="uppercase font-bold text-[10px]">{ord.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(ord.grandTotal)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Popover Inline Dropdown */}
                            <InlineOrderDropdown
                              order={ord}
                              detailsHref={`/admin/orders/${ord.id}`}
                              variant="popover"
                              triggerLabel="Aperçu"
                            />

                            <Link href={`/admin/orders/${ord.id}`}>
                              <Button size="sm" className="h-7 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm">
                                Gérer
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Inline Dropdown Row for Minimal Order Information */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-950/80">
                          <td colSpan={8} className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                                  Informations Minimales de la Commande #{ord.orderNumber}
                                </span>
                                <Link
                                  href={`/admin/orders/${ord.id}`}
                                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                                >
                                  Accéder à l'écran de gestion complète <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-amber-500" />
                                    Adresse de Livraison
                                  </span>
                                  {shippingAddress ? (
                                    <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                                      <p className="font-bold">{shippingAddress.fullName || ord.user?.name}</p>
                                      <p>{shippingAddress.street} {shippingAddress.apartment ? `, Apt ${shippingAddress.apartment}` : ''}</p>
                                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                                      <p className="font-semibold text-slate-800 dark:text-slate-200">{shippingAddress.country}</p>
                                      {shippingAddress.phoneNumber && (
                                        <p className="text-slate-400 text-[11px] font-mono">Tél : {shippingAddress.phoneNumber}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-slate-400">Non renseignée</p>
                                  )}
                                </div>

                                <div>
                                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1 flex items-center gap-1">
                                    <Truck className="w-3 h-3 text-amber-500" />
                                    Expédition & Suivi
                                  </span>
                                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                                    <p className="font-bold">{shipment?.carrier || 'Standard'}</p>
                                    <p className="font-mono text-slate-500 text-[11px]">
                                      N° : {shipment?.trackingNumber || 'En préparation'}
                                    </p>
                                    <Badge variant="secondary" className="mt-1 text-[9px] font-bold">
                                      {shipment?.status || 'TRAITEMENT'}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-amber-500" />
                                    Paiement & Commissions
                                  </span>
                                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                                    <p className="font-bold">{payment?.paymentMethod || payment?.provider || 'Carte Bancaire / MoMo'}</p>
                                    <Badge variant="success" className="text-[9px] font-bold mt-1">
                                      {payment?.status || 'PAYÉ'}
                                    </Badge>
                                    {ord.commissions?.length > 0 && (
                                      <p className="text-[11px] text-emerald-600 font-bold pt-1 font-mono">
                                        Commissions: {ord.commissions.length} boutique(s)
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
