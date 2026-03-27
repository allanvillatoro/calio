import { CATEGORIES, type Product } from '../types';

export const EMPTY_PRODUCT: Product = {
  id: 0,
  name: '',
  description: '',
  price: 100,
  quantity: 1,
  inStore: false,
  category: CATEGORIES[0],
  images: [],
};

export const PRODUCTS_PER_PAGE = 20;
