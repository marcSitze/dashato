'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
      quantity: 1,
      sku: `SKU-${item.productId.substring(0, 6)}`,
      vendorId: 'v1',
      vendorName: item.vendorName,
      storeSlug: 'store',
      maxStock: 20,
    });
    removeItem(item.productId);
    toast.success(`Moved "${item.title.substring(0, 20)}..." to cart!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> Saved Wishlist Items ({items.length})
          </h1>
          {items.length > 0 && (
            <Button onClick={clearWishlist} variant="ghost" className="text-xs text-rose-600">
              Clear All Saved Items
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Your wishlist is empty</h2>
            <p className="text-sm text-slate-500">Save your favorite tech gear and appliances to track prices.</p>
            <Link href="/products">
              <Button className="bg-amber-500 text-slate-950 font-bold rounded-xl">Discover Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.productId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-600">Seller: {item.vendorName}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">{item.title}</h3>
                  <div className="text-base font-black text-slate-900 dark:text-slate-100">{formatCurrency(item.price)}</div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Move to Cart
                  </Button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-full text-center text-xs text-slate-400 hover:text-rose-500 font-medium py-1"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
