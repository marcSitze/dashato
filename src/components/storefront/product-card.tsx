'use client';

import * as React from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Eye, Scale, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCompareStore } from '@/store/compare-store';
import { useTranslation } from '@/lib/i18n/context';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  brand?: { name: string; slug: string } | null;
  vendor: { id: string; store?: { name: string; slug: string } | null };
  avgRating: number;
  reviewCount: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  inventory?: { quantity: number } | null;
  sku: string;
}

export function ProductCard({
  id,
  title,
  slug,
  price,
  compareAtPrice,
  images,
  brand,
  vendor,
  avgRating,
  reviewCount,
  isNewArrival,
  isBestSeller,
  inventory,
  sku,
}: ProductCardProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const isWishlisted = isInWishlist(id);
  const isCompared = isInCompare(id);

  const mainImage = images[0]?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
  const hoverImage = images[1]?.url || mainImage;
  const vendorName = vendor.store?.name || 'Verified Vendor';
  const storeSlug = vendor.store?.slug || 'vendor';
  const stock = inventory?.quantity ?? 10;

  const discountPercentage = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      title,
      slug,
      image: mainImage,
      price,
      originalPrice: compareAtPrice || undefined,
      quantity: 1,
      sku,
      vendorId: vendor.id,
      vendorName,
      storeSlug,
      maxStock: stock,
    });
    toast.success(`Added "${title.substring(0, 25)}..." to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: id,
      title,
      slug,
      price,
      image: mainImage,
      vendorName,
      inStock: stock > 0,
    });
    toast(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare({
      id,
      title,
      slug,
      price,
      image: mainImage,
      brand: brand?.name,
      avgRating,
      reviewCount,
      vendorName,
    });
    toast(isCompared ? 'Removed from comparison' : 'Added to comparison list');
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Hover zoom & Action Overlays */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="font-bold text-xs shadow-md">
              -{discountPercentage}%
            </Badge>
          )}
          {isBestSeller && (
            <Badge variant="default" className="bg-primary text-primary-foreground font-bold text-[10px]">
              {t.bestSellers}
            </Badge>
          )}
          {isNewArrival && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-bold text-[10px]">
              {t.newArrivals}
            </Badge>
          )}
        </div>

        {/* Quick Action Icon Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlistToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-card/90 text-card-foreground hover:bg-rose-500 hover:text-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleCompareToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isCompared
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/90 text-card-foreground hover:bg-primary hover:text-primary-foreground'
            }`}
            title="Compare Product"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Vendor Badge */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground font-medium truncate">{brand?.name || 'Generic'}</span>
            <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded truncate max-w-[120px]">
              {vendorName}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${slug}`} className="block">
            <h3 className="text-sm font-bold text-card-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Rating Stars & Review Count */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-card-foreground">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Price & Add to Cart Button */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <div className="text-base font-extrabold text-card-foreground">
                {formatCurrency(price)}
              </div>
              {compareAtPrice && compareAtPrice > price && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatCurrency(compareAtPrice)}
                </div>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="default"
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl flex items-center gap-1.5 px-3"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> {t.addToCart}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
