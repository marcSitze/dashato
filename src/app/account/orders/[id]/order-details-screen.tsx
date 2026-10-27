'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Store,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';
import { toast } from 'sonner';

interface OrderDetailsScreenProps {
  order: any;
}

function getProductImageUrl(product: any): string {
  const first = product?.images?.[0];
  if (!first) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
  if (typeof first === 'string') return first;
  return first.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
}

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return (
        <Badge variant="success" className="font-extrabold uppercase text-[11px] gap-1 px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Livrée
        </Badge>
      );
    case 'SHIPPED':
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-extrabold uppercase text-[11px] gap-1 px-3 py-1">
          <Truck className="w-3.5 h-3.5" /> Expédiée
        </Badge>
      );
    case 'PROCESSING':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-extrabold uppercase text-[11px] gap-1 px-3 py-1">
          <Clock className="w-3.5 h-3.5" /> En Préparation
        </Badge>
      );
    case 'PAYMENT_CONFIRMED':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold uppercase text-[11px] gap-1 px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Paiement Confirmé
        </Badge>
      );
    case 'CANCELLED':
    case 'REFUNDED':
      return (
        <Badge variant="destructive" className="font-extrabold uppercase text-[11px] gap-1 px-3 py-1">
          <AlertTriangle className="w-3.5 h-3.5" /> {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="font-extrabold uppercase text-[11px] gap-1 px-3 py-1">
          <Clock className="w-3.5 h-3.5" /> {status || 'En Attente'}
        </Badge>
      );
  }
}

export function OrderDetailsScreen({ order }: OrderDetailsScreenProps) {
  const { t } = useTranslation();
  const [copiedTracking, setCopiedTracking] = React.useState(false);

  const shipment = order.shipments?.[0];
  const payment = order.payments?.[0];
  const items = order.items || [];
  const shippingAddress = order.shippingAddress;
  const billingAddress = order.billingAddress || shippingAddress;

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(true);
    toast.success(t.copiedTracking || 'Numéro de suivi copié dans le presse-papiers !');
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Determine active step in timeline (0 to 4)
  const getTimelineStep = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CANCELLED':
      case 'REFUNDED':
        return -1;
      case 'DELIVERED':
        return 4;
      case 'SHIPPED':
        return 3;
      case 'PROCESSING':
        return 2;
      case 'PAYMENT_CONFIRMED':
        return 1;
      case 'PENDING':
      default:
        return 0;
    }
  };

  const currentStep = getTimelineStep(order.status);

  const timelineSteps = [
    { label: t.orderPlaced || 'Commande Passée', icon: Package, desc: formatDate(order.createdAt) },
    { label: t.paymentConfirmed || 'Paiement Confirmé', icon: ShieldCheck, desc: payment?.status === 'PAID' ? 'Validé' : 'Vérification' },
    { label: t.processingStatus || 'En Préparation', icon: Clock, desc: 'Entrepôts vendeurs' },
    { label: t.shippedStatus || 'Expédiée', icon: Truck, desc: shipment?.carrier || 'En transit' },
    { label: t.deliveredStatus || 'Livrée', icon: CheckCircle2, desc: shipment?.deliveredAt ? formatDate(shipment.deliveredAt) : 'À destination' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.backToOrders || 'Retour à mes commandes'}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t.orderNum || 'Commande N°'} {order.orderNumber}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Passée le {formatDate(order.createdAt)} à {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Buttons: Print Invoice & Support */}
        <div className="flex items-center gap-2.5 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 gap-2 h-9 shadow-sm hover:border-amber-500/40"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{t.printReceipt || 'Imprimer la Facture'}</span>
          </Button>

          <a href={`mailto:support@dashato.com?subject=Assistance commande %23${order.orderNumber}`}>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl text-xs font-bold gap-2 h-9 shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>{t.contactSupport || 'Assistance'}</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Visual Order Progress Stepper / Timeline */}
      {currentStep >= 0 && (
        <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-500" />
            {t.orderTimeline || 'Progression & Suivi de la Commande'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
            {timelineSteps.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              const Icon = step.icon;

              return (
                <div key={index} className="flex flex-col items-center text-center relative group">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCompleted
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-amber-500/20 scale-105' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2.5 text-xs font-bold tracking-tight ${
                      isCompleted
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-[110px] truncate">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Line Items & Live Shipment Tracking (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Line Items */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                {t.itemsOrdered || 'Articles Commandés'} ({items.length})
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {items.reduce((sum: number, it: any) => sum + it.quantity, 0)} au total
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item: any) => {
                const img = getProductImageUrl(item.product);
                const storeName = item.vendor?.store?.name || item.vendor?.businessName || 'Marketplace';

                return (
                  <div key={item.id} className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={img}
                        alt={item.product?.title || 'Produit'}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-sm"
                      />
                      <div className="space-y-1">
                        <Link
                          href={`/products/${item.product?.slug}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-amber-500 transition-colors line-clamp-1"
                        >
                          {item.product?.title || 'Produit Dashato'}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Store className="w-3 h-3 text-slate-400" /> {storeName}
                          </span>
                          <span>•</span>
                          <span>Qté: <strong className="text-slate-800 dark:text-slate-200">{item.quantity}</strong> × {formatCurrency(item.unitPrice)}</span>
                        </div>
                        {item.variant?.title && (
                          <span className="inline-block text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            Variante : {item.variant.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                      <span className="font-black text-base text-slate-900 dark:text-slate-100 font-mono">
                        {formatCurrency(item.totalPrice)}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold mt-1 tracking-wider"
                      >
                        {item.fulfillmentStatus || 'EN ATTENTE'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Shipment & Tracking Details */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-amber-500" />
              {t.carrierLabel || 'Détails de Livraison & Expédition'}
            </h3>

            {shipment ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
                      Transporteur Partenaire
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {shipment.carrier || 'FedEx Express Worldwide'}
                    </span>
                    {shipment.trackingNumber && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          N° de suivi : {shipment.trackingNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(shipment.trackingNumber)}
                          className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                          title="Copier le numéro de suivi"
                        >
                          {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <Badge variant="success" className="font-bold text-xs uppercase self-start sm:self-center">
                    {shipment.status || 'SHIPPED'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Date d'expédition</span>
                    <p>{shipment.shippedAt ? formatDate(shipment.shippedAt) : 'En attente de prise en charge'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Délai estimé</span>
                    <p>2 à 5 jours ouvrés avec remise contre signature</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center space-y-2">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Expédition en cours de préparation</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Les vendeurs partenaires emballent vos articles avec soin. Le numéro de suivi de votre colis sera mis à jour dès la prise en charge par le transporteur.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Financial Summary & Addresses (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Price Breakdown / Invoice Summary */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              {t.financialSummary || 'Récapitulatif Financier'}
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.subtotal || 'Sous-total articles'}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatCurrency(order.subtotal || 0)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.shipping || 'Frais de livraison'}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {order.shippingFee === 0 ? 'Gratuit' : formatCurrency(order.shippingFee || 0)}
                </span>
              </div>

              {order.taxFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxes & TVA</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {formatCurrency(order.taxFee)}
                  </span>
                </div>
              )}

              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Remise / Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-mono">-{formatCurrency(order.discountTotal)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 block">Total TTC</span>
                  <span className="text-[10px] text-slate-400">TVA & frais de douane inclus</span>
                </div>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {formatCurrency(order.grandTotal)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Method Card */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-amber-500" />
              {t.paymentDetails || 'Paiement Sécurisé'}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Moyen de paiement :</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {payment?.paymentMethod || payment?.provider || 'Carte Bancaire / Mobile Money'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Statut du règlement :</span>
                <Badge
                  variant={payment?.status === 'PAID' ? 'success' : 'secondary'}
                  className="uppercase text-[10px] font-bold"
                >
                  {payment?.status || 'PAYÉ'}
                </Badge>
              </div>

              {payment?.transactionId && (
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                  <span>Réf transaction :</span>
                  <span className="truncate max-w-[140px]">{payment.transactionId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery & Billing Address Card */}
          <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <MapPin className="w-4 h-4 text-amber-500" />
                {t.deliveryAddress || 'Adresse de Livraison'}
              </h3>
              {shippingAddress ? (
                <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {shippingAddress.fullName || order.user?.name}
                  </p>
                  <p>{shippingAddress.street} {shippingAddress.apartment ? `, Apt ${shippingAddress.apartment}` : ''}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{shippingAddress.country}</p>
                  {shippingAddress.phoneNumber && (
                    <p className="text-slate-400 pt-1 font-mono">Tél : {shippingAddress.phoneNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">Adresse de livraison non renseignée.</p>
              )}
            </div>

            {billingAddress && billingAddress.id !== shippingAddress?.id && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  {t.billingAddress || 'Adresse de Facturation'}
                </h4>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{billingAddress.fullName}</p>
                  <p>{billingAddress.street}</p>
                  <p>{billingAddress.city}, {billingAddress.country}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Help & Support Assistance */}
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantie Acheteur Dashato Protect</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Vos commandes bénéficient d'une protection intégrale contre les retards de livraison et d'une politique de retour simplifiée sous 30 jours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
