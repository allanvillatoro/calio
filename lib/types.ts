export type Category =
  | 'new in'
  | 'aretes'
  | 'collares'
  | 'anillos'
  | 'pulseras'
  | 'accesorios'
  | 'sets'
  | 'piercings-cuffs';

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
