import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { HomepageClient } from './homepage-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let categories: any[] = [];
  let featuredProducts: any[] = [];
  let bestSellers: any[] = [];
  let flashDeals: any[] = [];
  let brands: any[] = [];
  let vendors: any[] = [];

  try {
    const [rawCategories, rawFeatured, rawBestSellers, rawFlashDeals, rawBrands, rawVendors] =
      await Promise.all([
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

    categories = JSON.parse(JSON.stringify(rawCategories || []));
    featuredProducts = JSON.parse(JSON.stringify(rawFeatured || []));
    bestSellers = JSON.parse(JSON.stringify(rawBestSellers || []));
    flashDeals = JSON.parse(JSON.stringify(rawFlashDeals || []));
    brands = JSON.parse(JSON.stringify(rawBrands || []));
    vendors = JSON.parse(JSON.stringify(rawVendors || []));
  } catch (error) {
    console.error('Error fetching Homepage data:', error);
  }

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
