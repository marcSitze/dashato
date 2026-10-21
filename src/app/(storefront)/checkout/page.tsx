'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { useCartStore } from '@/store/cart-store';
import { useTranslation } from '@/lib/i18n/context';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { items, couponCode, getSubtotal, getTax, getShippingFee, getDiscountTotal, getGrandTotal, clearCart } = useCartStore();

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Address State - cleanly initialized without fake static data
  const [shippingAddress, setShippingAddress] = React.useState({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phoneNumber: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Sync session user details if they arrive after mount
  React.useEffect(() => {
    if (session?.user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user.name || '',
        email: prev.email || session.user.email || '',
      }));
    }
  }, [session]);

  // Shipping Method State
  const [shippingMethod, setShippingMethod] = React.useState<'STANDARD' | 'EXPRESS' | 'OVERNIGHT'>('STANDARD');

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <AnnouncementBar />
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.emptyCart}</h2>
          <p className="text-sm text-slate-500">{t.emptyCartSubtitle}</p>
          <Link href="/products">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">
              {t.browseProducts}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleProcessOrder = async () => {
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.phoneNumber) {
      toast.error(t.orderFailedToast);
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress,
          shippingMethod,
          couponCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t.orderFailedToast);
      }

      toast.success(t.orderPlacedSuccessToast);

      // Launch WhatsApp with pre-structured order details
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      clearCart();
      router.push(`/checkout/success?orderNumber=${data.orderNumber}&orderId=${data.orderId}&whatsappUrl=${encodeURIComponent(data.whatsappUrl || '')}`);
    } catch (err: any) {
      toast.error(err.message || t.orderFailedToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        {/* Checkout Header Steps Indicator */}
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-widest bg-emerald-50 dark:bg-emerald-950/50 py-1.5 px-4 rounded-full w-fit mx-auto border border-emerald-500/20">
            <MessageSquare className="w-3.5 h-3.5" /> {t.directWhatsAppDispatch}
          </div>

          <div className="flex items-center justify-between relative max-w-sm mx-auto pt-2 px-2 sm:px-4">
            {[
              { id: 1, label: t.addressStep },
              { id: 2, label: t.shippingStep },
              { id: 3, label: t.reviewStep },
            ].map((s) => (
              <div key={s.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                    step >= s.id
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-md'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${step >= s.id ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-full">
          {/* Main Form Box */}
          <div className="lg:col-span-8 space-y-6 min-w-0 max-w-full">
            {/* STEP 1: Shipping Address */}
            {step === 1 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-6 max-w-full">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" /> {t.step1Title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.fullName}</label>
                    <Input
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="Jean Dupont"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.emailAddress}</label>
                    <Input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      placeholder="client@exemple.fr"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.phoneNumberWhatsApp}</label>
                    <Input
                      value={shippingAddress.phoneNumber}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phoneNumber: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.streetAddress}</label>
                    <Input
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="12 rue de la Paix"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.apartmentSuite}</label>
                    <Input
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      placeholder="Bâtiment B, Apt 14"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.city}</label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Paris"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.stateRegion}</label>
                    <Input
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="Île-de-France"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.postalCode}</label>
                    <Input
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      placeholder="75001"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6"
                  >
                    {t.continue} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 2: Shipping Method */}
            {step === 2 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-500" /> {t.step2Title}
                </h2>

                <div className="space-y-3">
                  {[
                    { id: 'STANDARD', title: t.standardCourier, desc: '3-5 jours ouvrés', price: getSubtotal() >= 150 ? t.free : '$9.99' },
                    { id: 'EXPRESS', title: t.expressAir, desc: '1-2 jours ouvrés', price: '$19.99' },
                    { id: 'OVERNIGHT', title: t.overnightPriority, desc: 'Livraison le jour ouvré suivant', price: '$34.99' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setShippingMethod(m.id as any)}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        shippingMethod === m.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMethod === m.id ? 'border-amber-500 bg-amber-500' : 'border-slate-400'}`}>
                          {shippingMethod === m.id && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{m.title}</h4>
                          <p className="text-xs text-slate-500">{m.desc}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{m.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6"
                  >
                    {t.reviewStep} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 3: Review & Place Order via WhatsApp */}
            {step === 3 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.step3Title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.addressStep}</h4>
                    <p className="font-semibold">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.street}{shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                    <p className="pt-1 text-slate-500">{t.phoneNumberWhatsApp}: {shippingAddress.phoneNumber}</p>
                    <p className="text-slate-500">{t.emailAddress}: {shippingAddress.email}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> {t.directWhatsAppDispatch}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      {t.whatsAppAutoNotice}
                    </p>
                    <p className="text-slate-500 pt-1">
                      {t.shipping}: <strong className="text-slate-900 dark:text-slate-100">{shippingMethod}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.orderedItemsLabel} ({items.length})</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900">
                    {items.map((i) => (
                      <div key={i.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={i.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{i.title}</p>
                            <p className="text-slate-500">{t.qty}: {i.quantity} • {t.store}: {i.vendorName}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(i.price * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
                  </Button>
                  <Button
                    onClick={handleProcessOrder}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 text-base shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      t.processingOrder
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> {t.placeOrderWhatsApp} ({formatCurrency(getGrandTotal())})
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                {t.orderSummary}
              </h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.tax} (8%)</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span>{formatCurrency(getShippingFee())}</span>
                </div>
                {getDiscountTotal() > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{t.discountCoupon} ({couponCode})</span>
                    <span>-{formatCurrency(getDiscountTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-50 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>{t.grandTotal}</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatCurrency(getGrandTotal())}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t.directWhatsAppDispatch}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
