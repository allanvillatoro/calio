import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from './constants/product-categories';

export type Category = ProductCategory;

export const CATEGORIES: Category[] = [...PRODUCT_CATEGORIES];

export interface Product {
  id: number;
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
