import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { HomepageClient } from './homepage-client';

export const revalidate = 60; // SSR with 60s revalidation

export default async function HomePage() {
  // Fetch real data from database
  const [categories, featuredProducts, bestSellers, flashDeals, brands, vendors] = await Promise.all([
    db.category.findMany({
      where: { parentId: null },
      take: 8,
      orderBy: { sortOrder: 'asc' },
    }),
    db.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      take: 8,
      include: {
        images: true,
        brand: true,
        vendor: { include: { store: true } },
        inventory: true,
      },
    }),
    db.product.findMany({
      where: { status: 'ACTIVE', isBestSeller: true },
      take: 4,
      include: {
        images: true,
        brand: true,
        vendor: { include: { store: true } },
        inventory: true,
      },
    }),
    db.product.findMany({
      where: { status: 'ACTIVE', compareAtPrice: { gt: 0 } },
      take: 4,
      include: {
        images: true,
        brand: true,
        vendor: { include: { store: true } },
        inventory: true,
      },
    }),
    db.brand.findMany({
      where: { isFeatured: true },
      take: 6,
    }),
    db.vendor.findMany({
      where: { isApproved: true },
      take: 3,
      include: { store: true, _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header categories={categories} />
      <CartDrawer />

      <HomepageClient
        categories={categories}
        featuredProducts={featuredProducts}
        bestSellers={bestSellers}
        flashDeals={flashDeals}
        brands={brands}
        vendors={vendors}
      />

      <Footer />
    </div>
  );
}
