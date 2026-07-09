import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from './constants/product-categories';

export type Category = ProductCategory;

export const CATEGORIES: Category[] = [...PRODUCT_CATEGORIES];

export interface Product {
  id: number;
  slug?: string | null;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount: number;
  quantity: number;
  images: string[];
  category: Category;
  inStore?: boolean;
}

export type CatalogItemKind = 'product' | 'laser-engraving';

export interface CatalogItem {
  id: string;
  sourceId: string;
  slug?: string | null;
  kind: CatalogItemKind;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount: number;
  quantity: number;
  images: string[];
  category?: Category;
  inStore?: boolean;
}
