import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemType {
  id: string; // unique cart item key (productId + optional variantId)
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  variantTitle?: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  storeSlug: string;
  maxStock: number;
}

interface CartState {
  items: CartItemType[];
  couponCode?: string;
  discountPercentage: number;
  addItem: (item: Omit<CartItemType, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountPct: number) => boolean;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getShippingFee: () => number;
  getDiscountTotal: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      discountPercentage: 0,

      addItem: (item) => {
        const id = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const newQty = Math.min(updated[existingIndex].quantity + item.quantity, item.maxStock);
          updated[existingIndex].quantity = newQty;
          set({ items: updated });
        } else {
          set({ items: [...currentItems, { ...item, id }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.min(quantity, item.maxStock) } : item
          ),
        });
      },

      clearCart: () => set({ items: [], couponCode: undefined, discountPercentage: 0 }),

      applyCoupon: (code, discountPct) => {
        if (!code) return false;
        set({ couponCode: code.toUpperCase(), discountPercentage: discountPct });
        return true;
      },

      removeCoupon: () => set({ couponCode: undefined, discountPercentage: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscountTotal: () => {
        const subtotal = get().getSubtotal();
        return (subtotal * get().discountPercentage) / 100;
      },

      getTax: () => {
        const taxableSubtotal = get().getSubtotal() - get().getDiscountTotal();
        return taxableSubtotal * 0.08; // 8% standard tax estimate
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal > 150) return 0; // Free shipping over $150
        // Group by vendor for multi-vendor shipping calculation
        const vendorIds = new Set(get().items.map((item) => item.vendorId));
        return vendorIds.size * 9.99; // $9.99 per vendor fulfillment
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal - get().getDiscountTotal() + get().getTax() + get().getShippingFee();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'dashato-cart-storage',
    }
  )
);
