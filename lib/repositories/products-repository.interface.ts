export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  category: string;
  inStore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductChanges = Partial<IProduct>;

export interface ProductFilters {
  categories?: string[];
  inStore?: boolean;
  page?: number;
  limit?: number;
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
  findAll(filters?: ProductFilters | URLSearchParams): Promise<FindAllProductsResult>;
  updateById(id: number, updates: ProductChanges): Promise<IProduct | null>;
  deleteById(id: number): Promise<boolean>;
}
