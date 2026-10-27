'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Truck, CheckCircle2, Search, Loader2, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

interface VendorOrdersClientProps {
  initialOrderItems: any[];
}

export function VendorOrdersClient({ initialOrderItems }: VendorOrdersClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du statut');
      }

      // Update local state immediately
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, fulfillmentStatus: status } : item
        )
      );

      toast.success(
        status === 'SHIPPED'
          ? (t.orderMarkedShippedToast || 'Article marqué comme EXPÉDIÉ avec succès !')
          : (t.orderMarkedDeliveredToast || 'Article marqué comme LIVRÉ avec succès !')
      );

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de mettre à jour le statut');
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
            <CheckCircle2 className="w-3 h-3" /> {t.shippedStatus || 'EXPÉDIÉ'}
          </Badge>
        );
      case 'DELIVERED':
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold uppercase text-[10px] gap-1">
            <PackageCheck className="w-3 h-3" /> {t.deliveredStatus || 'LIVRÉ'}
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold uppercase text-[10px]">
            {t.processingStatus || 'EN COURS'}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold uppercase text-[10px]">
            {t.unfulfilledStatus || 'EN ATTENTE'}
          </Badge>
        );
    }
  };

  const statusFilters = [
    { key: 'ALL', label: t.all || 'Tous' },
    { key: 'UNFULFILLED', label: t.unfulfilledStatus || 'En Attente' },
    { key: 'PROCESSING', label: t.processingStatus || 'En Cours' },
    { key: 'SHIPPED', label: t.shippedStatus || 'Expédié' },
    { key: 'DELIVERED', label: t.deliveredStatus || 'Livré' },
  ];

  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (itemId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={t.vendorSearchPlaceholder || 'Rechercher commande n°, client, produit...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {statusFilters.map((st) => (
            <button
              key={st.key}
              onClick={() => setFilterStatus(st.key)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                filterStatus === st.key
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
                <th className="py-3 px-3">{t.orderNum || 'Commande N°'}</th>
                <th className="py-3 px-4">{t.customerDetails || 'Détails du Client'}</th>
                <th className="py-3 px-4">{t.productPurchased || 'Produit Acheté'}</th>
                <th className="py-3 px-4">{t.dateLabel || 'Date'}</th>
                <th className="py-3 px-4">{t.fulfillmentStatus || 'Statut de Livraison'}</th>
                <th className="py-3 px-4">{t.subtotal || 'Sous-total'}</th>
                <th className="py-3 px-4 text-right">{t.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {t.noStoreOrdersYet || 'Aucun article de commande ne correspond à vos critères de recherche.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => {
                  const isShipped = item.fulfillmentStatus === 'SHIPPED' || item.fulfillmentStatus === 'DELIVERED';
                  const isLoading = loadingItemId === item.id;
                  const isExpanded = expandedRows[item.id] || false;
                  const shippingAddress = item.order?.shippingAddress;
                  const shipment = item.order?.shipments?.[0];
                  const payment = item.order?.payments?.[0];

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => toggleRow(item.id)}
                            className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title={isExpanded ? 'Masquer aperçu' : 'Afficher aperçu minimal'}
                          >
                            {isExpanded ? (
                              <span className="text-amber-500 font-bold">▲</span>
                            ) : (
                              <span className="text-slate-400 font-bold">▼</span>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          {item.order?.id ? (
                            <Link
                              href={`/vendor/orders/${item.order.id}`}
                              className="hover:text-amber-500 transition-colors flex items-center gap-1"
                            >
                              {item.order?.orderNumber || 'N/A'}
                            </Link>
                          ) : (
                            item.order?.orderNumber || 'N/A'
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.order?.user?.name || 'Client'}</div>
                          <div className="text-[10px] text-slate-400">{item.order?.user?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.product?.title || 'Produit'}</div>
                          <div className="text-[10px] text-slate-400">{t.qty || 'Qté'}: {item.quantity} • {formatCurrency(item.unitPrice)}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{formatDate(item.createdAt)}</td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(item.fulfillmentStatus)}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.order?.id && (
                              <Link href={`/vendor/orders/${item.order.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 hover:border-amber-500/30 text-slate-700 dark:text-slate-300"
                                >
                                  Détails
                                </Button>
                              </Link>
                            )}

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
                                {item.fulfillmentStatus === 'DELIVERED' ? (t.deliveredStatus || 'Livré') : (t.markDelivered || 'Marquer Livré')}
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
                                {t.markShipped || 'Marquer Expédié'}
                              </Button>
                            )}
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
                                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                                  Informations Minimales de la Commande #{item.order?.orderNumber}
                                </span>
                                {item.order?.id && (
                                  <Link
                                    href={`/vendor/orders/${item.order.id}`}
                                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    Écran des détails de la commande →
                                  </Link>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">
                                    Adresse de Livraison
                                  </span>
                                  {shippingAddress ? (
                                    <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                                      <p className="font-bold">{shippingAddress.fullName || item.order?.user?.name}</p>
                                      <p>{shippingAddress.street} {shippingAddress.apartment ? `, Apt ${shippingAddress.apartment}` : ''}</p>
                                      <p>{shippingAddress.city}, {shippingAddress.country}</p>
                                      {shippingAddress.phoneNumber && (
                                        <p className="text-slate-400 text-[11px] font-mono">Tél : {shippingAddress.phoneNumber}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-slate-400">Non renseignée</p>
                                  )}
                                </div>

                                <div>
                                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">
                                    Transporteur & Suivi
                                  </span>
                                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                                    <p className="font-bold">{shipment?.carrier || 'Standard Dashato'}</p>
                                    <p className="font-mono text-slate-500 text-[11px]">
                                      N° : {shipment?.trackingNumber || 'En préparation'}
                                    </p>
                                    <Badge variant="secondary" className="mt-1 text-[9px] font-bold">
                                      {shipment?.status || 'EN ATTENTE'}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">
                                    Règlement & Statut
                                  </span>
                                  <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                                    <p className="font-bold">{payment?.paymentMethod || payment?.provider || 'Carte / Mobile Money'}</p>
                                    <Badge variant="success" className="text-[9px] font-bold mt-1">
                                      {payment?.status || 'CONFIRMÉ'}
                                    </Badge>
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

