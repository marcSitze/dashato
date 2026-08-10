import { create } from 'zustand';

export interface CompareProductType {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  brand?: string;
  avgRating: number;
  reviewCount: number;
  vendorName: string;
  specifications?: Record<string, string>;
}

interface CompareState {
  items: CompareProductType[];
  toggleCompare: (product: CompareProductType) => void;
  isInCompare: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  toggleCompare: (product) => {
    const exists = get().items.some((i) => i.id === product.id);
    if (exists) {
      set({ items: get().items.filter((i) => i.id !== product.id) });
    } else {
      if (get().items.length >= 4) {
        return; // Max 4 products allowed for visual side-by-side comparison
      }
      set({ items: [...get().items, product] });
    }
  },
  isInCompare: (productId) => get().items.some((i) => i.id === productId),
  removeItem: (productId) => set({ items: get().items.filter((i) => i.id !== productId) }),
  clearCompare: () => set({ items: [] }),
}));
