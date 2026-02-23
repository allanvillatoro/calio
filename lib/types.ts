export type Category =
  | "aretes"
  | "collares"
  | "anillos"
  | "pulseras"
  | "accesorios"
  | "sets"
  | "piercings-cuffs";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  category: Category;
}
