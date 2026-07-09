import type { SellableItemResponse, ISellableItem } from './sellable-item';

export interface ILaserEngraving extends ISellableItem {
  slug: string;
}

export type LaserEngravingResponse = SellableItemResponse<ILaserEngraving>;
