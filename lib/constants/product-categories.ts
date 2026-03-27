export const PRODUCT_CATEGORIES = [
  'new in',
  'aretes',
  'collares',
  'pulseras',
  'anillos',
  'sets',
  'studs-cuffs',
  'accesorios',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
