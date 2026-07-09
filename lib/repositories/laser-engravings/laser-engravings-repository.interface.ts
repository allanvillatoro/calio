import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type {
  Paging,
  SellableItemResponse,
} from '@/lib/interfaces/sellable-item';

export type LaserEngravingChanges = Partial<
  Omit<ILaserEngraving, 'priceWithDiscount' | 'createdAt' | 'updatedAt'>
>;

export interface LaserEngravingFilters {
  query?: string;
  page?: number;
  limit?: number;
  includeOutOfStock?: boolean;
}

export type LaserEngravingPaging = Paging;

export type FindAllLaserEngravingsResult =
  SellableItemResponse<ILaserEngraving>;

export interface ILaserEngravingsRepository {
  save(input: LaserEngravingChanges): Promise<ILaserEngraving>;
  findById(id: number): Promise<ILaserEngraving | null>;
  findAll(
    filters?: LaserEngravingFilters | URLSearchParams,
  ): Promise<FindAllLaserEngravingsResult>;
  updateById(
    id: number,
    updates: LaserEngravingChanges,
  ): Promise<ILaserEngraving | null>;
  deleteById(id: number): Promise<boolean>;
}
