export type SellableItemKind = 'product' | 'laser-engraving';

export interface Paging {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ISellableItem {
  id: number;
  slug?: string | null;
  name: string;
  description: string;
  price: number;
  discount: number;
  priceWithDiscount: number;
  quantity: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SellableItemResponse<TItem extends ISellableItem> {
  data: TItem[];
  paging: Paging;
}
