import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../src/store/cart-store';

describe('Cart Store Logic', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add items to cart and compute correct subtotal', () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 'p1',
      title: 'MacBook Pro 16"',
      slug: 'macbook-pro-16',
      image: 'https://example.com/macbook.jpg',
      price: 3499.00,
      quantity: 1,
      sku: 'SKU-MBP16',
      vendorId: 'v1',
      vendorName: 'TechPro Official',
      storeSlug: 'techpro',
      maxStock: 10,
    });

    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().getSubtotal()).toBe(3499.00);
  });

  it('should apply discount coupons correctly', () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 'p2',
      title: 'Sony Headphones',
      slug: 'sony-headphones',
      image: 'https://example.com/sony.jpg',
      price: 400.00,
      quantity: 1,
      sku: 'SKU-SONY',
      vendorId: 'v2',
      vendorName: 'Apex Audio',
      storeSlug: 'apex',
      maxStock: 20,
    });

    store.applyCoupon('DASHATO10', 10); // 10% discount

    expect(useCartStore.getState().getDiscountTotal()).toBe(40.00);
    expect(useCartStore.getState().getSubtotal() - useCartStore.getState().getDiscountTotal()).toBe(360.00);
  });

  it('should calculate shipping fee correctly', () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 'p3',
      title: 'Ergonomic Desk',
      slug: 'desk',
      image: 'https://example.com/desk.jpg',
      price: 100.00,
      quantity: 1,
      sku: 'SKU-DESK',
      vendorId: 'v3',
      vendorName: 'Nordic Living',
      storeSlug: 'nordic',
      maxStock: 5,
    });

    // Subtotal = $100 (< $150 free shipping threshold), 1 vendor = $9.99
    expect(useCartStore.getState().getShippingFee()).toBe(9.99);
  });
});
