'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Star,
  ShoppingBag,
  Heart,
  Scale,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Store,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCompareStore } from '@/store/compare-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function ProductDetailsClient({ product }: { product: any }) {
  const images = product.images.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80' }];

  const [selectedImage, setSelectedImage] = React.useState(images[0].url);
  const [selectedVariant, setSelectedVariant] = React.useState<any>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = React.useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = product.inventory?.quantity ?? 10;
  const vendorStoreName = product.vendor.store?.name || product.vendor.businessName;
  const vendorStoreSlug = product.vendor.store?.slug || 'vendor';

  const specs = product.specifications ? JSON.parse(product.specifications) : {};

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.title,
      slug: product.slug,
      image: selectedImage,
      price: currentPrice,
      originalPrice: currentCompareAtPrice || undefined,
      quantity,
      variantTitle: selectedVariant?.title,
      sku: currentSku,
      vendorId: product.vendorId,
      vendorName: vendorStoreName,
      storeSlug: vendorStoreSlug,
      maxStock: currentStock,
    });
    toast.success(`Added ${quantity} item(s) to shopping cart!`);
  };

  const handleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: currentPrice,
      image: selectedImage,
      vendorName: vendorStoreName,
      inStock: currentStock > 0,
    });
    toast(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const handleCompare = () => {
    toggleCompare({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: currentPrice,
      image: selectedImage,
      brand: product.brand?.name,
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      vendorName: vendorStoreName,
      specifications: specs,
    });
    toast(isCompared ? 'Removed from comparison' : 'Added to comparison list');
  };

  return (
    <div className="space-y-12">
      {/* Upper Grid: Gallery + Main Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery Thumbnails & Large Zoom Image */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative group">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
            />
            {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
              <Badge variant="destructive" className="absolute top-4 left-4 font-bold text-sm">
                Save {Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100)}%
              </Badge>
            )}
          </div>

          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img.url
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                Brand: <Link href={`/products?brand=${product.brand?.slug}`} className="text-amber-600 hover:underline">{product.brand?.name || 'Generic'}</Link>
              </span>
              <span className="text-slate-400 font-mono">SKU: {currentSku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {product.title}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.avgRating) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{product.avgRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-50">
                {formatCurrency(currentPrice)}
              </span>
              {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                <span className="text-sm text-slate-400 line-through ml-2">
                  {formatCurrency(currentCompareAtPrice)}
                </span>
              )}
            </div>
            <Badge variant={currentStock > 0 ? 'success' : 'destructive'} className="font-bold">
              {currentStock > 0 ? `In Stock (${currentStock} left)` : 'Out of Stock'}
            </Badge>
          </div>

          {/* Variant Selection */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-500">Select Variant</label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.image) setSelectedImage(v.image);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>{v.title}</div>
                    <div className="text-slate-500 font-bold mt-0.5">{formatCurrency(v.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-sm text-slate-900 dark:text-slate-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                size="lg"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20"
              >
                <ShoppingBag className="w-5 h-5 mr-2" /> Add to Shopping Cart
              </Button>
            </div>

            {/* Secondary Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleWishlist}
                variant="outline"
                className={`flex-1 rounded-xl text-xs font-bold ${
                  isWishlisted ? 'border-rose-500 text-rose-600 bg-rose-50' : ''
                }`}
              >
                <Heart className="w-4 h-4 mr-1.5 fill-current" /> {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </Button>

              <Button
                onClick={handleCompare}
                variant="outline"
                className={`flex-1 rounded-xl text-xs font-bold ${
                  isCompared ? 'border-amber-500 text-amber-600 bg-amber-50' : ''
                }`}
              >
                <Scale className="w-4 h-4 mr-1.5" /> {isCompared ? 'In Compare List' : 'Compare Product'}
              </Button>
            </div>
          </div>

          {/* Vendor Seller Information Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    {vendorStoreName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <span className="text-[10px] text-slate-400">Verified Marketplace Partner</span>
                </div>
              </div>
              <Link href={`/products?vendor=${product.vendorId}`}>
                <Button size="sm" variant="outline" className="text-xs rounded-lg h-8">
                  Visit Store
                </Button>
              </Link>
            </div>
          </div>

          {/* Guarantees & Shipping perks */}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 text-center pt-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <Truck className="w-4 h-4 mx-auto text-amber-500" />
              <span>Express Delivery</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <ShieldCheck className="w-4 h-4 mx-auto text-emerald-500" />
              <span>1 Year Warranty</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <RotateCcw className="w-4 h-4 mx-auto text-blue-500" />
              <span>30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Technical Specs, Customer Reviews */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent h-auto p-0 gap-6">
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-3 text-sm font-bold">
              Product Overview
            </TabsTrigger>
            <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-3 text-sm font-bold">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-3 text-sm font-bold">
              Customer Reviews ({product.reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6 space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <p>{product.description}</p>
          </TabsContent>

          <TabsContent value="specs" className="pt-6">
            {Object.keys(specs).length === 0 ? (
              <p className="text-slate-400 text-sm">No detailed specifications provided.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(specs).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{key}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-6 space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">No reviews yet for this product. Be the first to leave feedback!</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {product.reviews.map((rev: any) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                          {rev.user?.name ? rev.user.name[0] : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{rev.user?.name}</span>
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>

                    {rev.title && <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{rev.title}</h5>}
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>

                    {rev.vendorReply && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400">Response from {vendorStoreName}:</span>
                        <p className="text-slate-700 dark:text-slate-300">{rev.vendorReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
