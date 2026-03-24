export type Category =
  | 'new in'
  | 'aretes'
  | 'collares'
  | 'anillos'
  | 'pulseras'
  | 'accesorios'
  | 'sets'
  | 'studs-cuffs';

export const CATEGORIES: Category[] = [
  'new in',
  'aretes',
  'collares',
  'pulseras',
  'anillos',
  'sets',
  'studs-cuffs',
  'accesorios',
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  category: Category;
  inStore?: boolean;
}

export const PRODUCTS_PER_PAGE = 20;
