import { Product } from './types';
import productsData from '@/data/products.json';

export function getProducts(): Product[] {
  return productsData as Product[];
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((product) => product.id === id);
}

