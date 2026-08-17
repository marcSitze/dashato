"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/storefront/product-card";
import { useTranslation } from "@/lib/i18n/context";

interface HomepageClientProps {
  categories: any[];
  featuredProducts: any[];
  bestSellers: any[];
  flashDeals: any[];
  brands: any[];
  vendors: any[];
}

export function HomepageClient({
  categories,
  featuredProducts,
  bestSellers,
  flashDeals,
  brands,
  vendors,
}: HomepageClientProps) {
  const { t } = useTranslation();

  return (
    <main className="flex-1">
      {/* HERO SECTION */}
      <section className="text-secondary-foreground relative overflow-hidden py-16 lg:py-24 border-b border-secondary/50">
        <div className="absolute inset-0 bg-gradient-to-r dark:from-secondary dark:via-secondary to-primary/20 z-0" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* <Sparkles className="w-3.5 h-3.5" />  */}
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
              {t.heroBadge}
            </div> */}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black dark:text-secondary-foreground text-black/80 leading-tight tracking-tight">
              {t.heroTitle}
            </h1>

            <p className="dark:text-secondary-foreground/80 text-black/80 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-8 rounded-xl text-base shadow-lg shadow-primary/20"
                >
                  {t.shopNow} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link href="/vendor/apply">
                <Button
                  size="lg"
                  variant="outline"
                  className="dark:border-secondary-foreground/20 border-primary/20 dark:text-secondary-foreground text-black/80 dark:hover:bg-secondary-hover hover:bg-secondary/80 rounded-xl px-6"
                >
                  {t.sellOnDashato}
                </Button>
              </Link>
            </div>

            {/* Quick stats trust badges */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-secondary-foreground/10 text-secondary-foreground/80 text-xs">
              <div>
                <div className="text-2xl font-black text-primary">100%</div>
                <div className="dark:text-secondary-foreground/60 text-black/80">
                  {t.topVerifiedSellers}
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-primary">24/7</div>
                <div className="dark:text-secondary-foreground/60 text-black/80">
                  {t.trustGuarantee}
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-primary">Express</div>
                <div className="dark:text-secondary-foreground/60 text-black/80">
                  {t.trustShipping}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-6 dark:bg-secondary-hover/80 bg-primary-foreground border border-secondary-foreground/10 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-primary uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  {/* <Flame className="w-4 h-4 fill-primary text-primary" />{" "} */}
                  {t.featured}
                </span>
                <Badge variant="destructive">Save up to 30%</Badge>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary relative">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                  alt="Featured Laptop"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs text-primary font-bold uppercase">
                    {t.seller}: TechPro Official
                  </span>
                  <h3 className="text-lg font-bold dark:text-secondary-foreground text-black/80 leading-snug">
                    Apple MacBook Pro 16" M3 Max
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-xs dark:text-secondary-foreground/60 text-black/80 line-through mr-2">
                    $3,899.00
                  </span>
                  <span className="text-2xl font-black dark:text-secondary-foreground text-black/80">
                    $3,499.00
                  </span>
                </div>
                <Link href="/products/apple-macbook-pro-16-m3-max">
                  <Button
                    variant="default"
                    className="bg-primary text-primary-foreground font-bold hover:bg-primary-hover rounded-xl"
                  >
                    {t.buyNow}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {t.shopCategory}
            </h2>
            <p className="text-sm text-muted-foreground">
              Curated product categories for every need
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            {t.allCategories} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-secondary border border-border shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={
                  cat.image ||
                  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80"
                }
                alt={cat.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent flex flex-col justify-end p-5">
                <h3 className="text-lg font-bold text-secondary-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-secondary-foreground/70 line-clamp-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH DEALS COUNTDOWN BANNER */}
      <section className="dark:bg-secondary from-white via-secondary-hover to-secondary text-secondary-foreground py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              {/* <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center">
                <Zap className="w-6 h-6 fill-current animate-pulse" />
              </div> */}
              <div>
                <h2 className="text-2xl font-black text-secondary-foreground tracking-tight flex items-center gap-2">
                  {t.flashDeals}{" "}
                  <Badge variant="destructive" className="animate-bounce">
                    Limited Time
                  </Badge>
                </h2>
                <p className="text-xs text-secondary-foreground/70">
                  Exclusive prices guaranteed until stock runs out
                </p>
              </div>
            </div>

            {/* Countdown Timer Widget */}
            <div className="flex items-center gap-2 text-xs font-bold text-secondary-foreground/80">
              <Clock className="w-4 h-4 text-primary" /> {t.endsIn}
              <div className="flex items-center gap-1">
                <span className="bg-secondary-hover px-2.5 py-1 rounded-lg border border-border text-secondary-foreground text-sm font-mono font-black">
                  04{t.hours}
                </span>
                :
                <span className="bg-secondary-hover px-2.5 py-1 rounded-lg border border-border text-secondary-foreground text-sm font-mono font-black">
                  48{t.mins}
                </span>
                :
                <span className="bg-secondary-hover px-2.5 py-1 rounded-lg border border-border text-secondary-foreground text-sm font-mono font-black">
                  12{t.secs}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashDeals.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                images={product.images}
                brand={product.brand}
                vendor={product.vendor}
                avgRating={product.avgRating}
                reviewCount={product.reviewCount}
                isBestSeller={product.isBestSeller}
                isNewArrival={product.isNewArrival}
                inventory={product.inventory}
                sku={product.sku}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING & FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" /> {t.trendingTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              Hand-picked gear backed by verified seller warranties
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            {t.allCategories} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              images={product.images}
              brand={product.brand}
              vendor={product.vendor}
              avgRating={product.avgRating}
              reviewCount={product.reviewCount}
              isBestSeller={product.isBestSeller}
              isNewArrival={product.isNewArrival}
              inventory={product.inventory}
              sku={product.sku}
            />
          ))}
        </div>
      </section>

      {/* FEATURED VENDORS SPOTLIGHT */}
      <section className="bg-muted/40 py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase text-primary tracking-widest">
              Multi-Vendor Ecosystem
            </span>
            <h2 className="text-3xl font-black text-foreground">
              {t.topVerifiedSellers}
            </h2>
            <p className="text-sm text-muted-foreground">
              Direct fulfillment from authorized flagship retailers with 100%
              guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vendors.map((v: any) => (
              <div
                key={v.id}
                className="bg-card text-card-foreground rounded-3xl p-6 border border-border shadow-sm space-y-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      v.store?.logo ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={v.store?.name || v.businessName}
                    className="w-14 h-14 rounded-2xl object-cover border border-border"
                  />
                  <div>
                    <h3 className="font-bold text-card-foreground flex items-center gap-1.5">
                      {v.store?.name || v.businessName}
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {v.store?.city}, {v.store?.country}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-bold text-primary">
                        ★ {v.store?.rating || 4.9}
                      </span>
                      <span className="text-muted-foreground">
                        • {v._count.products} Products
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {v.store?.description}
                </p>

                <Link href={`/products?vendor=${v.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold rounded-xl border-border hover:bg-muted"
                  >
                    {t.visitStore} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
