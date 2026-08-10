'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Store,
  Tag,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    couponCode,
    discountPercentage,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getTax,
    getShippingFee,
    getDiscountTotal,
    getGrandTotal,
  } = useCartStore();

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const [couponInput, setCouponInput] = React.useState('');

  // Group cart items by Vendor Store
  const groupedItems = items.reduce((acc: any, item) => {
    const key = item.vendorId;
    if (!acc[key]) {
      acc[key] = {
        vendorName: item.vendorName,
        storeSlug: item.storeSlug,
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    if (couponInput.toUpperCase() === 'DASHATO10') {
      applyCoupon('DASHATO10', 10);
      toast.success('Coupon DASHATO10 applied! 10% Discount applied to your cart.');
    } else {
      toast.error('Invalid coupon code. Try DASHATO10.');
    }
  };

  const handleSaveForLater = (item: any) => {
    toggleWishlist({
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      price: item.price,
      image: item.image,
      vendorName: item.vendorName,
      inStock: true,
    });
    removeItem(item.id);
    toast.success(`Saved "${item.title.substring(0, 20)}..." for later in wishlist.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-8">
          Shopping Cart & Order Summary
        </h1>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your shopping cart is empty</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
              Explore multi-vendor electronics, workstations, audio equipment, and Scandinavian furniture.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 rounded-xl text-base">
                Discover Marketplace Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Multi-Vendor Item Groups */}
            <div className="lg:col-span-8 space-y-6">
              {Object.entries(groupedItems).map(([vendorId, group]: [string, any]) => (
                <div
                  key={vendorId}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        Fulfilled by {group.vendorName}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Verified Seller
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {group.items.map((item: any) => (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div className="space-y-1">
                            <Link href={`/products/${item.slug}`} className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-amber-500 line-clamp-1">
                              {item.title}
                            </Link>
                            {item.variantTitle && (
                              <p className="text-xs text-slate-500">Variant: {item.variantTitle}</p>
                            )}
                            <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>

                            <button
                              onClick={() => handleSaveForLater(item)}
                              className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1 pt-1"
                            >
                              <Heart className="w-3.5 h-3.5" /> Save for Later
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Quantity control */}
                          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 font-bold text-xs text-slate-800 dark:text-slate-200">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-black text-slate-900 dark:text-slate-100">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatCurrency(item.price)} each
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 p-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <Button onClick={clearCart} variant="ghost" className="text-xs text-rose-600 hover:text-rose-700">
                  Clear Entire Cart
                </Button>
                <Link href="/products">
                  <Button variant="outline" className="text-xs font-semibold rounded-xl">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Checkout Summary & Coupon Box */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Box */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" /> Coupon & Promo Code
                </h3>
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <span>Applied: {couponCode} ({discountPercentage}% OFF)</span>
                    <button onClick={removeCoupon} className="text-rose-600 hover:underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Try code DASHATO10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="text-xs rounded-xl uppercase"
                    />
                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold px-4">
                      Apply
                    </Button>
                  </form>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(getSubtotal())}</span>
                  </div>

                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo Discount ({discountPercentage}%)</span>
                      <span>-{formatCurrency(getDiscountTotal())}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>{getShippingFee() === 0 ? <strong className="text-emerald-600 font-bold uppercase">FREE</strong> : formatCurrency(getShippingFee())}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span>{formatCurrency(getTax())}</span>
                  </div>

                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-slate-50 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span>Order Total</span>
                    <span className="text-amber-600 dark:text-amber-400">{formatCurrency(getGrandTotal())}</span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/checkout')}
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Stripe Protected Multi-Vendor Payment</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
