import type { ISellableItem, Paging } from './sellable-item';

export interface IProduct extends ISellableItem {
  category: string;
  inStoreSps: boolean;
  inStorePro: boolean;
}

export interface ProductResponse {
  data: IProduct[];
  paging: Paging;
}

export type { Paging } from './sellable-item';
