import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { products, type ProductRow } from '@/db/schema';
import type {
  IProduct,
  IProductsRepository,
  ProductChanges,
} from './products-repository.interface';

function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function requireProductField<K extends keyof ProductChanges>(
  input: ProductChanges,
  field: K,
): NonNullable<ProductChanges[K]> {
  const value = input[field];

  if (value === undefined || value === null) {
    throw new Error(`Missing required product field: ${String(field)}`);
  }

  return value as NonNullable<ProductChanges[K]>;
}

function mapRowToProduct(row: ProductRow): IProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    quantity: row.quantity,
    images: row.images,
    category: row.category,
    inStore: row.inStore,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleProductsRepository implements IProductsRepository {
  async save(input: ProductChanges): Promise<IProduct> {
    const [product] = await db
      .insert(products)
      .values({
        name: requireProductField(input, 'name'),
        description: requireProductField(input, 'description'),
        price: requireProductField(input, 'price'),
        quantity: requireProductField(input, 'quantity'),
        images: requireProductField(input, 'images'),
        category: requireProductField(input, 'category'),
        inStore: input.inStore ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return mapRowToProduct(product);
  }

  async findById(id: number): Promise<IProduct | null> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return product ? mapRowToProduct(product) : null;
  }

  async findAll(): Promise<IProduct[]> {
    const productRows = await db.select().from(products);

    return productRows.map(mapRowToProduct);
  }

  async updateById(id: number, updates: ProductChanges): Promise<IProduct | null> {
    const [product] = await db
      .update(products)
      .set({
        ...omitUndefined(updates),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return product ? mapRowToProduct(product) : null;
  }
}

export const productsRepository: IProductsRepository =
  new DrizzleProductsRepository();
