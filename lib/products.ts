import type { Product } from './types';
import productsData from '@/data/products.json';

export function getProducts(): Product[] {
  return productsData.map((product) => ({
    ...product,
    id: product.id,
  })) as Product[];
}

export function getProductById(id: number): Product | undefined {
  return getProducts().find((product) => product.id === id);
}
