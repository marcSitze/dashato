import Link from 'next/link';
import { db } from '@/lib/db';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { SearchFilters } from './search-filters';
import { SlidersHorizontal, Grid, List, X, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const view = params.view || 'grid';
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
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {q ? `Search Results for "${q}"` : categorySlug ? `Department: ${categorySlug.replace('-', ' ')}` : 'All Marketplace Products'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {products.length} of {totalCount} matching verified items
          </p>
        </div>

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
            {/* Top Toolbar: View switcher & Sorting */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              {/* Active Filter Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {q && (
                  <Badge variant="secondary" className="gap-1 py-1">
                    Query: "{q}"
                    <Link href={`/products?category=${categorySlug}&brand=${brandSlug}`}>
                      <X className="w-3 h-3 hover:text-rose-500" />
                    </Link>
                  </Badge>
                )}
                {categorySlug && (
                  <Badge variant="secondary" className="gap-1 py-1">
                    Cat: {categorySlug}
                    <Link href={`/products?q=${q}&brand=${brandSlug}`}>
                      <X className="w-3 h-3 hover:text-rose-500" />
                    </Link>
                  </Badge>
                )}
                {brandSlug && (
                  <Badge variant="secondary" className="gap-1 py-1">
                    Brand: {brandSlug}
                    <Link href={`/products?q=${q}&category=${categorySlug}`}>
                      <X className="w-3 h-3 hover:text-rose-500" />
                    </Link>
                  </Badge>
                )}
                {(q || categorySlug || brandSlug || minPrice || maxPrice || rating || vendorId) && (
                  <Link href="/products" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                    Clear All
                  </Link>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By:</span>
                <form action="/products" method="GET">
                  <input type="hidden" name="q" value={q} />
                  <input type="hidden" name="category" value={categorySlug} />
                  <input type="hidden" name="brand" value={brandSlug} />
                  <select
                    name="sort"
                    defaultValue={sort}
                    // onChange submit form automatically
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="best_selling">Best Sellers</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </form>
              </div>
            </div>

            {/* Products Grid or Empty State */}
            {products.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No products match your criteria</h3>
                <p className="text-sm text-slate-500 mb-6">Try adjusting your filters, price range, or clearing active search keywords.</p>
                <Link href="/products">
                  <Button variant="default" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">
                    Reset All Filters
                  </Button>
                </Link>
              </div>
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
