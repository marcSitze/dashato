"use client";

import * as React from "react";
import Link from "next/link";
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
  Film,
  Sparkles,
  Sliders,
  FileText,
  MessageSquare,
  Share2,
  Check,
  Tag,
  MapPin,
  Mail,
  Phone,
  Layers,
  Award,
  Clock,
  Box,
  Play,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  isVideoUrl,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  isDirectVideoUrl,
  findYouTubeUrls,
} from "@/lib/media-utils";
import { Spinner } from "@/components/ui/spinner";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCompareStore } from "@/store/compare-store";
import { useTranslation } from "@/lib/i18n/context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function ProductDetailsClient({ product }: { product: any }) {
  const { t } = useTranslation();
  const images = product.images && product.images.length > 0 ? product.images : [];

  const [selectedImage, setSelectedImage] = React.useState(images[0]?.url || "");
  const [selectedVariant, setSelectedVariant] = React.useState<any>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAtPrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = product.inventory?.quantity ?? 10;
  const vendorStoreName =
    product.vendor?.store?.name || product.vendor?.businessName || t.seller;
  const vendorStoreSlug = product.vendor?.store?.slug || "vendor";

  // Safely parse specifications JSON
  const specs = React.useMemo(() => {
    if (!product.specifications) return {};
    if (typeof product.specifications === "object") return product.specifications;
    try {
      const parsed = JSON.parse(product.specifications);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return { Informations: product.specifications };
    }
  }, [product.specifications]);

  // Safely parse tags
  const tagsList = React.useMemo(() => {
    if (!product.tags) return [];
    if (Array.isArray(product.tags)) return product.tags;
    if (typeof product.tags === "string") {
      if (product.tags.startsWith("[")) {
        try {
          return JSON.parse(product.tags);
        } catch {}
      }
      return product.tags
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [product.tags]);

  // Rating distribution calculation
  const ratingDistribution = React.useMemo(() => {
    const reviews = product.reviews || [];
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[rating as keyof typeof counts] =
        (counts[rating as keyof typeof counts] || 0) + 1;
    });
    return counts;
  }, [product.reviews]);

  const primaryCategory = product.categories?.[0]?.category;
  const isSelectedYouTube = isYouTubeUrl(selectedImage);
  const isSelectedDirectVideo = isDirectVideoUrl(selectedImage);
  const isSelectedVideo = isSelectedYouTube || isSelectedDirectVideo;

  // Detect any YouTube video in gallery images or product description
  const galleryYouTubeUrls = images
    .filter((img: any) => isYouTubeUrl(img.url))
    .map((img: any) => img.url);
  const descYouTubeUrls = findYouTubeUrls(product.description);
  const allYouTubeVideos = Array.from(new Set([...galleryYouTubeUrls, ...descYouTubeUrls]));

  const handleAddToCart = () => {
    if (currentStock <= 0 || isAdding) return;
    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.title,
      slug: product.slug,
      image: selectedImage || (images[0]?.url ?? ""),
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
    toast.success(t.addedToCartToast);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      price: currentPrice,
      image: selectedImage || (images[0]?.url ?? ""),
      vendorName: vendorStoreName,
      inStock: currentStock > 0,
    });
    toast(isWishlisted ? t.removedFromWishlistToast : t.savedToWishlistToast);
  };

  const handleCompare = () => {
    toggleCompare({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: currentPrice,
      image: selectedImage || (images[0]?.url ?? ""),
      brand: product.brand?.name,
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      vendorName: vendorStoreName,
      specifications: specs,
    });
    toast(isCompared ? t.removedFromCompareToast : t.addedToCompareToast);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success(t.linkCopied);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      {/* Upper Grid: Gallery + Main Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Thumbnails & Large Zoom Image */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md relative group">
            {isSelectedYouTube ? (
              <iframe
                src={getYouTubeEmbedUrl(selectedImage) || ""}
                title={product.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isSelectedDirectVideo ? (
              <video
                src={selectedImage}
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={selectedImage || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80"}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
              />
            )}

            {/* Discount Badge */}
            {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
              <Badge
                variant="destructive"
                className="absolute top-4 left-4 font-bold text-sm shadow-md pointer-events-none"
              >
                {t.saveDiscount}{" "}
                {Math.round(
                  ((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100
                )}
                %
              </Badge>
            )}

            {/* In stock badge */}
            <Badge
              variant={currentStock > 0 ? "success" : "destructive"}
              className="absolute top-4 right-4 font-bold text-xs shadow-md pointer-events-none"
            >
              {currentStock > 0 ? t.inStock : t.outOfStock}
            </Badge>
          </div>

          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto smooth-scroll-x no-scrollbar pb-2">
              {images.map((img: any, idx: number) => {
                const isYt = isYouTubeUrl(img.url);
                const isDirect = isDirectVideoUrl(img.url);
                const isVid = isYt || isDirect;
                const ytThumb = isYt ? getYouTubeThumbnail(img.url) : null;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === img.url
                        ? "border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {isYt && ytThumb ? (
                      <>
                        <img
                          src={ytThumb}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : isDirect ? (
                      <>
                        <video
                          src={img.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <Film className="w-5 h-5 text-amber-400" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Desktop Visual Trust Features */}
          <div className="hidden sm:grid grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Truck className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {t.trustShipping}
                </p>
                <p className="text-[11px] text-slate-500">2-3 jours ouvrés</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {t.authenticityGuarantee}
                </p>
                <p className="text-[11px] text-slate-500">Garantie Dashato</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <RotateCcw className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {t.trustReturns}
                </p>
                <p className="text-[11px] text-slate-500">Sous 30 jours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info & Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            {/* Meta Row: Category, Brand, SKU */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                {primaryCategory && (
                  <Link
                    href={`/products?category=${primaryCategory.slug}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {primaryCategory.name}
                  </Link>
                )}
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Link
                    href={`/products?brand=${product.brand?.slug}`}
                    className="hover:text-amber-600 hover:underline"
                  >
                    {product.brand?.name || "Dashato"}
                  </Link>
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {t.sku}: {currentSku}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-snug">
              {product.title}
            </h1>

            {/* Ratings Summary with Smooth Jump */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.avgRating)
                        ? "fill-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {product.avgRating.toFixed(1)}
              </span>
              <button
                onClick={() => scrollTo("section-reviews")}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
              >
                ({product.reviewCount} {t.customerReviewsCount} &middot; {t.seeAllReviews})
              </button>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-50">
                {formatCurrency(currentPrice)}
              </span>
              {currentCompareAtPrice && currentCompareAtPrice > currentPrice && (
                <span className="text-sm text-slate-400 line-through ml-2.5">
                  {formatCurrency(currentCompareAtPrice)}
                </span>
              )}
            </div>
            <div className="text-right">
              <Badge
                variant={currentStock > 0 ? "success" : "destructive"}
                className="font-bold text-xs"
              >
                {currentStock > 0
                  ? `${t.inStock} (${currentStock} ${t.inStockLeft})`
                  : t.outOfStock}
              </Badge>
            </div>
          </div>

          {/* Key Highlights Callout (shortDesc) */}
          {product.shortDesc && (
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{t.keyHighlights}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {product.shortDesc}
              </p>
            </div>
          )}

          {/* Quick Technical Specs Attribute Matrix */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {t.brand}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {product.brand?.name || "Dashato Official"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {t.warranty}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {t.standardWarranty}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {t.category}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                {primaryCategory?.name || "Marketplace"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {t.availability}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {currentStock > 0 ? t.inStock : t.outOfStock}
              </span>
            </div>
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-500">
                {t.selectVariant}
              </label>
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
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>{v.title}</div>
                    <div className="text-slate-500 font-bold mt-0.5">
                      {formatCurrency(v.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-sm text-slate-900 dark:text-slate-100">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock, quantity + 1))
                  }
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || isAdding}
                size="lg"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <Spinner size="sm" variant="primary" className="mr-2" />
                    <span>{t.addingToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    <span>{t.addToCart}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Secondary Action buttons: Wishlist, Compare, Share */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleWishlist}
                variant="outline"
                className={`flex-1 rounded-xl text-xs font-bold transition-all ${
                  isWishlisted
                    ? "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                    : ""
                }`}
              >
                <Heart className="w-4 h-4 mr-1.5 fill-current" />
                {isWishlisted ? t.savedToWishlistToast : t.wishlist}
              </Button>

              <Button
                onClick={handleCompare}
                variant="outline"
                className={`flex-1 rounded-xl text-xs font-bold transition-all ${
                  isCompared
                    ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }`}
              >
                <Scale className="w-4 h-4 mr-1.5" />
                {isCompared ? t.addedToCompareToast : t.compare}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="rounded-xl text-xs font-bold px-3 transition-all"
                title={t.shareProduct}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Vendor Seller Information Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {vendorStoreName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {t.seller} &middot; Dashato Marketplace
                  </span>
                </div>
              </div>
              <Link href={`/products?vendor=${product.vendorId}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs rounded-xl h-8 font-bold"
                >
                  {t.visitStore}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Quick-Jump Anchor Bar */}
      <div className="sticky top-16 z-20 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-y sm:border sm:rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto smooth-scroll-x no-scrollbar">
          <button
            onClick={() => scrollTo("section-overview")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{t.quickOverview}</span>
          </button>
          <button
            onClick={() => scrollTo("section-specifications")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>{t.quickSpecs}</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold">
              {Object.keys(specs).length + 4}
            </span>
          </button>
          <button
            onClick={() => scrollTo("section-vendor")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{t.quickSeller}</span>
          </button>
          <button
            onClick={() => scrollTo("section-reviews")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span>{t.quickReviews}</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-extrabold">
              {product.reviews.length}
            </span>
          </button>
          {allYouTubeVideos.length > 0 && (
            <button
              onClick={() => scrollTo("section-video")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
              <span>Vidéo Démo</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 font-extrabold">
                {allYouTubeVideos.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* CONTINUOUS OPEN CONTENT SECTIONS (NO HIDDEN OVERFLOW) */}
      <div className="space-y-10">
        {/* SECTION 1: DESCRIPTION & PRESENTATION COMPLÈTE */}
        <section
          id="section-overview"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 scroll-mt-28"
        >
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {t.description}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t.productOverviewSubtitle}
              </p>
            </div>
          </div>

          {/* Formatted Full Description */}
          <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
            {product.description}
          </div>

          {/* Product Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t.authenticityGuarantee}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Produit neuf d'origine, inspecté et validé par notre service qualité avant expédition.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t.fastDeliveryGuarantee}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Colis soigné avec numéro de suivi instantané envoyé par email dès la prise en charge.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t.easyReturnsGuarantee}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Essayez en toute sérénité. Retour simplifié et remboursement direct en cas d'insatisfaction.
              </p>
            </div>
          </div>

          {/* Tags Cloud */}
          {tagsList.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t.tags}
              </span>
              <div className="flex flex-wrap gap-2">
                {tagsList.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs py-1 px-3 bg-slate-50 dark:bg-slate-950 font-medium"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION: YOUTUBE VIDEO SHOWCASE */}
        {allYouTubeVideos.length > 0 && (
          <section
            id="section-video"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 scroll-mt-28"
          >
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 fill-red-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <span>Présentation & Démonstration Vidéo</span>
                  <Badge variant="destructive" className="bg-red-600 text-white font-extrabold text-[10px]">
                    YouTube
                  </Badge>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Visualisez les caractéristiques, le déballage et le fonctionnement réel de ce produit
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${allYouTubeVideos.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
              {allYouTubeVideos.map((videoUrl, vIdx) => {
                const embedUrl = getYouTubeEmbedUrl(videoUrl);
                if (!embedUrl) return null;
                return (
                  <div
                    key={vIdx}
                    className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg relative group"
                  >
                    <iframe
                      src={embedUrl}
                      title={`${product.title} - Video Demo ${vIdx + 1}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 2: FICHE TECHNIQUE & SPÉCIFICATIONS COMPLÈTES */}
        <section
          id="section-specifications"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 scroll-mt-28"
        >
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {t.allSpecifications}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t.specsSubtitle}
              </p>
            </div>
          </div>

          {/* Core + Custom Specs Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Standard Core Specifications */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.brand}
              </span>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {product.brand?.name || "Dashato"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.sku}
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {currentSku}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.category}
              </span>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {primaryCategory?.name || "Marketplace"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t.warranty}
              </span>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                {t.standardWarranty}
              </span>
            </div>

            {/* Custom Dynamic Specifications from JSON */}
            {Object.entries(specs).map(([key, val]: [string, any]) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {key}
                </span>
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>

          {Object.keys(specs).length === 0 && (
            <p className="text-slate-400 text-sm italic">
              {t.noSpecs}
            </p>
          )}
        </section>

        {/* SECTION 3: BOUTIQUE VENDEUR & ENGAGEMENTS PLATEFORME */}
        <section
          id="section-vendor"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 scroll-mt-28"
        >
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {t.sellerStoreSubtitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Vendeur professionnel certifié Dashato Marketplace
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Vendor Profile Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-2xl flex items-center justify-center">
                  {vendorStoreName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {vendorStoreName}
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500 inline" />
                      Certifié
                    </Badge>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span>4.9 / 5 &middot; Vendeur Top Performance</span>
                  </div>
                </div>
              </div>

              {product.vendor?.store?.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.vendor.store.description}
                </p>
              )}

              {/* Contact and Location badges */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                {(product.vendor?.store?.city || product.vendor?.store?.country) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>
                      {[product.vendor?.store?.city, product.vendor?.store?.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {product.vendor?.store?.supportEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{product.vendor.store.supportEmail}</span>
                  </div>
                )}
                {product.vendor?.store?.supportPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{product.vendor.store.supportPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visit Store Action Button */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-center items-start lg:items-end">
              <Link href={`/products?vendor=${product.vendorId}`} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 font-bold rounded-2xl shadow-sm cursor-pointer"
                >
                  <Store className="w-4 h-4 mr-2" />
                  {t.visitStore}
                </Button>
              </Link>
              <span className="text-[11px] text-slate-400 text-center lg:text-right">
                Consultez l'ensemble du catalogue de ce marchand
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 4: AVIS & ÉVALUATIONS DES CLIENTS */}
        <section
          id="section-reviews"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 scroll-mt-28"
        >
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.reviews} ({product.reviews.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t.reviewsSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Summary & Star Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {/* Big Rating Score */}
            <div className="md:col-span-4 text-center md:text-left space-y-2">
              <div className="text-5xl font-black text-slate-900 dark:text-slate-50">
                {product.avgRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center md:justify-start text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.avgRating)
                        ? "fill-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {product.reviewCount} {t.customerReviewsCount}
              </p>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="md:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars as keyof typeof ratingDistribution] || 0;
                const total = product.reviews.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-slate-500">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {product.reviews.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                {t.noReviewsYet}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Partagez votre avis après avoir reçu votre commande pour aider les autres clients Dashato.
              </p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
              {product.reviews.map((rev: any) => (
                <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                        {rev.user?.name ? rev.user.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {rev.user?.name || "Client Vérifié"}
                          </span>
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold py-0 h-4">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {t.verifiedPurchase}
                          </Badge>
                        </div>
                        <div className="flex items-center text-amber-400 text-xs mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-amber-400" : "text-slate-300 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  {rev.title && (
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {rev.title}
                    </h5>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>

                  {/* Vendor Reply Card */}
                  {rev.vendorReply && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5 ml-4 sm:ml-8">
                      <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        {t.responseFromVendor} {vendorStoreName}:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {rev.vendorReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
