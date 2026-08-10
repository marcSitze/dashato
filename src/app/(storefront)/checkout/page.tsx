'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { useCartStore } from '@/store/cart-store';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, getSubtotal, getTax, getShippingFee, getDiscountTotal, getGrandTotal, clearCart } = useCartStore();

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Address State
  const [shippingAddress, setShippingAddress] = React.useState({
    fullName: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phoneNumber: '+1 (555) 234-5678',
    street: '742 Evergreen Terrace',
    apartment: 'Apt 4B',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62704',
    country: 'US',
  });

  // Shipping Method State
  const [shippingMethod, setShippingMethod] = React.useState<'STANDARD' | 'EXPRESS' | 'OVERNIGHT'>('STANDARD');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = React.useState<'CARD' | 'STRIPE'>('CARD');
  const [cardDetails, setCardDetails] = React.useState({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: 'SARAH JENKINS',
    expDate: '12/28',
    cvv: '888',
  });

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <AnnouncementBar />
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h2>
          <p className="text-sm text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/products">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">
              Browse Products
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleProcessOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress,
          shippingMethod,
          paymentMethod,
          cardDetails,
          couponCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete order');
      }

      toast.success(`Order ${data.orderNumber} placed successfully!`);
      clearCart();
      router.push(`/checkout/success?orderNumber=${data.orderNumber}&orderId=${data.orderId}`);
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
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
          <div className="flex items-center justify-center gap-1 text-xs font-extrabold uppercase text-amber-600 tracking-widest">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Secure Checkout
          </div>

          <div className="flex items-center justify-between relative max-w-md mx-auto pt-2">
            {[
              { id: 1, label: 'Address' },
              { id: 2, label: 'Shipping' },
              { id: 3, label: 'Payment' },
              { id: 4, label: 'Review' },
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Box */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: Shipping Address */}
            {step === 1 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" /> Step 1: Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <Input
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <Input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <Input
                      value={shippingAddress.phoneNumber}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phoneNumber: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Street Address</label>
                    <Input
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Apartment / Suite (Optional)</label>
                    <Input
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">State / Province</label>
                    <Input
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Postal / Zip Code</label>
                    <Input
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6"
                  >
                    Continue to Shipping Method <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 2: Shipping Method */}
            {step === 2 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-500" /> Step 2: Shipping Method
                </h2>

                <div className="space-y-3">
                  {[
                    { id: 'STANDARD', title: 'Standard Courier Shipping', desc: 'Delivered in 3-5 business days', price: getSubtotal() >= 150 ? 'FREE' : '$9.99' },
                    { id: 'EXPRESS', title: 'Express Air Courier', desc: 'Delivered in 1-2 business days with tracking priority', price: '$19.99' },
                    { id: 'OVERNIGHT', title: 'Overnight Priority', desc: 'Guaranteed next business day delivery', price: '$34.99' },
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
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6"
                  >
                    Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 3: Extensible Payment Gateway */}
            {step === 3 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" /> Step 3: Payment Method
                </h2>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-amber-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Stripe Card Payment Architecture</h4>
                      <p className="text-xs text-slate-400">Integrated credit/debit card processing</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Number</label>
                      <Input
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        className="rounded-xl font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expiration Date</label>
                        <Input
                          value={cardDetails.expDate}
                          onChange={(e) => setCardDetails({ ...cardDetails, expDate: e.target.value })}
                          className="rounded-xl font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CVV Security Code</label>
                        <Input
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-6"
                  >
                    Review Final Order <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 4: Review & Place Order */}
            {step === 4 && (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Step 4: Final Order Review
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Shipping Address</h4>
                    <p className="font-semibold">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.street}, {shippingAddress.apartment}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.phoneNumber}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Payment & Method</h4>
                    <p>Method: Stripe Card Processing</p>
                    <p className="font-mono">Card: {cardDetails.cardNumber}</p>
                    <p>Carrier: {shippingMethod}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Order Items ({items.length})</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900">
                    {items.map((i) => (
                      <div key={i.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={i.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{i.title}</p>
                            <p className="text-slate-500">Qty: {i.quantity} • Store: {i.vendorName}</p>
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
                  <Button variant="outline" onClick={() => setStep(3)} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={handleProcessOrder}
                    disabled={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl px-8 text-base shadow-lg shadow-amber-500/20"
                  >
                    {isSubmitting ? 'Processing Payment...' : `Complete & Pay ${formatCurrency(getGrandTotal())}`}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                Summary Total
              </h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(getShippingFee())}</span>
                </div>
                {getDiscountTotal() > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatCurrency(getDiscountTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-50 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Due</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatCurrency(getGrandTotal())}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
