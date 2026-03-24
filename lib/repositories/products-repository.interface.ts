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
}

export interface IProductsRepository {
  save(input: ProductChanges): Promise<IProduct>;
  findById(id: number): Promise<IProduct | null>;
  findAll(filters?: ProductFilters | URLSearchParams): Promise<IProduct[]>;
  updateById(id: number, updates: ProductChanges): Promise<IProduct | null>;
  deleteById(id: number): Promise<boolean>;
}
