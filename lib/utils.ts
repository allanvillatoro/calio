import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CATEGORIES, type Product } from './types';

export function formatPrice(price: number): string {
  return `L${price.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const BASE_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;

export function getImageUrl(filename: string): string {
  return `${BASE_URL}${filename}`;
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
