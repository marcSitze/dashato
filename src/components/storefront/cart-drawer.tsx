'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const router = useRouter();
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, updateQuantity, removeItem, getSubtotal, getShippingFee, getGrandTotal } = useCartStore();

  const handleCheckout = () => {
    closeCartDrawer();
    router.push('/checkout');
  };

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={(open) => !open && closeCartDrawer()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="p-5 border-b border-slate-200 dark:border-slate-800">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Your Shopping Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Your cart is empty</h3>
            <p className="text-sm text-slate-500 mb-6">Discover top electronics, laptops, sound gear and modern home living.</p>
            <Button
              onClick={() => {
                closeCartDrawer();
                router.push('/products');
              }}
              variant="default"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                      Store: {item.vendorName}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{item.title}</h4>
                    {item.variantTitle && (
                      <p className="text-xs text-slate-500 mt-0.5">Variant: {item.variantTitle}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-500" /> Estimated Shipping
                  </span>
                  <span>{getShippingFee() === 0 ? <strong className="text-emerald-600 font-bold uppercase">FREE</strong> : formatCurrency(getShippingFee())}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatCurrency(getGrandTotal())}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full h-12 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted & Safe Checkout via Stripe Architecture</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
