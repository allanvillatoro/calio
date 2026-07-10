'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CatalogItem, CatalogItemKind, Product } from '@/lib/types';

export type CartProduct = Omit<Product, 'category'> & {
  cartId: string;
  sourceId: string;
  kind: CatalogItemKind;
  category?: string;
};

export type CartInputItem = Product | CatalogItem | CartProduct;

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStoreState {
  items: CartItem[];
  addItem: (product: CartInputItem) => boolean;
  addProduct: (product: CartInputItem) => boolean;
  incrementItem: (cartId: string) => boolean;
  decrementItem: (cartId: string) => boolean;
  removeItem: (cartId: string) => void;
  incrementProduct: (productId: number) => boolean;
  decrementProduct: (productId: number) => boolean;
  removeProduct: (productId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

function getProductCartId(productId: number | string) {
  return `product:${productId}`;
}

function normalizeCartProduct(product: CartInputItem): CartProduct {
  if ('cartId' in product) {
    return product;
  }

  if ('kind' in product) {
    return {
      id: Number(product.sourceId),
      cartId: product.id,
      sourceId: product.sourceId,
      kind: product.kind,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      priceWithDiscount: product.priceWithDiscount,
      quantity: product.quantity,
      images: product.images,
      category: product.category,
      inStore: product.inStore,
    };
  }

  return {
    ...product,
    cartId: getProductCartId(product.id),
    sourceId: String(product.id),
    kind: 'product',
  };
}

function normalizePersistedItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    product: normalizeCartProduct(item.product),
  }));
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (input) => {
        const product = normalizeCartProduct(input);
        const existingItem = get().items.find(
          (item) => item.product.cartId === product.cartId,
        );
        const currentQuantity = existingItem?.quantity ?? 0;

        if (product.quantity <= 0 || currentQuantity >= product.quantity) {
          return false;
        }

        set((state) => ({
          items: existingItem
            ? state.items.map((item) =>
                item.product.cartId === product.cartId
                  ? { ...item, product, quantity: item.quantity + 1 }
                  : item,
              )
            : [...state.items, { product, quantity: 1 }],
        }));

        return true;
      },
      addProduct: (product) => get().addItem(product),
      incrementItem: (cartId) => {
        const existingItem = get().items.find(
          (item) => item.product.cartId === cartId,
        );

        if (!existingItem) {
          return false;
        }

        return get().addItem(existingItem.product);
      },
      decrementItem: (cartId) => {
        const existingItem = get().items.find(
          (item) => item.product.cartId === cartId,
        );

        if (!existingItem || existingItem.quantity <= 1) {
          return false;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.cartId === cartId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          ),
        }));

        return true;
      },
      removeItem: (cartId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.cartId !== cartId),
        }));
      },
      incrementProduct: (productId) =>
        get().incrementItem(getProductCartId(productId)),
      decrementProduct: (productId) =>
        get().decrementItem(getProductCartId(productId)),
      removeProduct: (productId) =>
        get().removeItem(getProductCartId(productId)),
      clearCart: () => {
        set({ items: [] });
      },
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'calio-cart',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as CartStoreState;

        return {
          ...state,
          items: normalizePersistedItems(state.items ?? []),
        };
      },
    },
  ),
);
