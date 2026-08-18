import { ProductDetailSkeleton } from '@/components/storefront/product-detail-skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="px-4 py-8">
      <ProductDetailSkeleton />
    </div>
  );
}
