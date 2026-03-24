import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CATEGORIES, type Product } from './types';

export function formatPrice(price: number): string {
  return `L${price.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EMPTY_PRODUCT: Product = {
  id: '',
  name: '',
  description: '',
  price: 100,
  quantity: 1,
  inStore: false,
  category: CATEGORIES[0],
  images: [],
};
