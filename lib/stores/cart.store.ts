'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/types';

export type CartProduct = Omit<Product, 'category'> & {
  category: string;
};

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStoreState {
  items: CartItem[];
  addProduct: (product: CartProduct) => boolean;
  decrementProduct: (productId: number) => void;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct: (product) => {
        const existingItem = get().items.find(
          (item) => item.product.id === product.id,
        );
        const currentQuantity = existingItem?.quantity ?? 0;

        if (product.quantity <= 0 || currentQuantity >= product.quantity) {
          return false;
        }

        set((state) => ({
          items: existingItem
            ? state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, product, quantity: item.quantity + 1 }
                  : item,
              )
            : [...state.items, { product, quantity: 1 }],
        }));

        return true;
      },
      decrementProduct: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      removeProduct: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'calio-cart',
    },
  ),
);
