import type { IProduct } from '@/lib/interfaces/product';

export type ProductChanges = Partial<
  Omit<IProduct, 'priceWithDiscount' | 'createdAt' | 'updatedAt'>
>;

export interface ProductFilters {
  categories?: string[];
  query?: string;
  inStore?: boolean;
  page?: number;
  limit?: number;
  includeOutOfStock?: boolean;
}

export interface ProductPaging {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FindAllProductsResult {
  data: IProduct[];
  paging: ProductPaging;
}

export interface IProductsRepository {
  save(input: ProductChanges): Promise<IProduct>;
  findById(id: number): Promise<IProduct | null>;
  findAll(
    filters?: ProductFilters | URLSearchParams,
  ): Promise<FindAllProductsResult>;
  updateById(id: number, updates: ProductChanges): Promise<IProduct | null>;
  deleteById(id: number): Promise<boolean>;
}
