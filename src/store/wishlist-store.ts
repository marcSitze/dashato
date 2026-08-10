import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItemType {
  productId: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  vendorName: string;
  inStock: boolean;
}

interface WishlistState {
  items: WishlistItemType[];
  toggleWishlist: (item: WishlistItemType) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set({ items: get().items.filter((i) => i.productId !== item.productId) });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'dashato-wishlist-storage',
    }
  )
);
