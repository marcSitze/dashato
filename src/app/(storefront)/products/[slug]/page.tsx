import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { ProductDetailsClient } from './product-details-client';
import { Star, ShieldCheck, Truck, RotateCcw, Store, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ProductDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      brand: true,
      vendor: {
        include: {
          store: true,
        },
      },
      variants: true,
      inventory: true,
      categories: {
        include: {
          category: true,
        },
      },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products in same brand or vendor
  const relatedProducts = await db.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: product.id },
      OR: [{ vendorId: product.vendorId }, { brandId: product.brandId }],
    },
    take: 4,
    include: {
      images: true,
      brand: true,
      vendor: { include: { store: true } },
      inventory: true,
    },
  });

  const categories = await db.category.findMany({ select: { id: true, name: true, slug: true } });

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images.map((img: any) => img.url),
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Generic',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.inventory && product.inventory.quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.vendor.store?.name || product.vendor.businessName,
      },
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnnouncementBar />
      <Header categories={categories} />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-amber-500 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-500 transition-colors">Produits</Link>
          {product.categories && product.categories.length > 0 && product.categories[0]?.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.categories[0].category.slug}`}
                className="hover:text-amber-500 transition-colors"
              >
                {product.categories[0].category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Client Interactive Product Gallery & Buy Box */}
        <ProductDetailsClient product={product} />

        {/* Related Products Recommendation Carousel */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Vous Aimerez Aussi
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Découvrez d'autres articles recommandés par notre marketplace
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Voir tout le catalogue &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel: any) => (
                <ProductCard
                  key={rel.id}
                  id={rel.id}
                  title={rel.title}
                  slug={rel.slug}
                  price={rel.price}
                  compareAtPrice={rel.compareAtPrice}
                  images={rel.images}
                  brand={rel.brand}
                  vendor={rel.vendor}
                  avgRating={rel.avgRating}
                  reviewCount={rel.reviewCount}
                  isBestSeller={rel.isBestSeller}
                  isNewArrival={rel.isNewArrival}
                  inventory={rel.inventory}
                  sku={rel.sku}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
