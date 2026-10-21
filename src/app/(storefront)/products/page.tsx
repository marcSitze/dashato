import Link from 'next/link';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { SearchFilters } from './search-filters';
import {
  ProductsClientHeader,
  ProductsClientToolbar,
  ProductsEmptyState,
} from './products-client-toolbar';

export interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    vendor?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = params.q || '';
  const categorySlug = params.category || '';
  const brandSlug = params.brand || '';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const rating = params.rating ? parseFloat(params.rating) : undefined;
  const vendorId = params.vendor || '';
  const sort = params.sort || 'relevance';
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 12;

  // Build Prisma filter query object
  const where: any = {
    status: 'ACTIVE',
  };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  if (categorySlug && categorySlug !== 'all') {
    where.categories = {
      some: {
        category: {
          slug: categorySlug,
        },
      },
    };
  }

  if (brandSlug) {
    where.brand = {
      slug: brandSlug,
    };
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (rating !== undefined) {
    where.avgRating = {
      gte: rating,
    };
  }

  // Build sorting object
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'newest') orderBy = { createdAt: 'desc' };
  if (sort === 'rating') orderBy = { avgRating: 'desc' };
  if (sort === 'best_selling') orderBy = { isBestSeller: 'desc' };

  // Execute database queries
  const [categories, brands, vendors, totalCount, products] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true, slug: true } }),
    db.brand.findMany({ select: { id: true, name: true, slug: true } }),
    db.vendor.findMany({ select: { id: true, businessName: true, store: { select: { name: true } } } }),
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        images: true,
        brand: true,
        vendor: { include: { store: true } },
        inventory: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <AnnouncementBar />
      <Header categories={categories} />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Page Title & Active Search Term */}
        <ProductsClientHeader
          q={q}
          categorySlug={categorySlug}
          totalCount={totalCount}
          productsLength={products.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filter Panel */}
          <SearchFilters
            categories={categories}
            brands={brands}
            vendors={vendors}
            currentCategory={categorySlug}
            currentBrand={brandSlug}
            currentMinPrice={minPrice}
            currentMaxPrice={maxPrice}
            currentRating={rating}
            currentVendor={vendorId}
            currentSort={sort}
            currentQuery={q}
          />

          {/* Main Results Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar: Filter tags & Sorting */}
            <ProductsClientToolbar
              q={q}
              categorySlug={categorySlug}
              brandSlug={brandSlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              rating={rating}
              vendorId={vendorId}
              sort={sort}
              totalCount={totalCount}
              productsLength={products.length}
            />

            {/* Products Grid or Empty State */}
            {products.length === 0 ? (
              <ProductsEmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
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
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={`/products?q=${q}&category=${categorySlug}&brand=${brandSlug}&sort=${sort}&page=${p}`}
                      className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center border ${
                        p === currentPage
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
