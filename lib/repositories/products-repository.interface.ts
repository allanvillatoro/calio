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

export interface IProductsRepository {
  save(input: ProductChanges): Promise<IProduct>;
  findById(id: number): Promise<IProduct | null>;
  findAll(): Promise<IProduct[]>;
  updateById(id: number, updates: ProductChanges): Promise<IProduct | null>;
}
