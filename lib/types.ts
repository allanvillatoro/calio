export type Category =
  | 'new in'
  | 'aretes'
  | 'collares'
  | 'anillos'
  | 'pulseras'
  | 'accesorios'
  | 'sets'
  | 'piercings-cuffs';

export const CATEGORIES: Category[] = [
  'new in',
  'aretes',
  'collares',
  'pulseras',
  'anillos',
  'sets',
  'piercings-cuffs',
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
}
