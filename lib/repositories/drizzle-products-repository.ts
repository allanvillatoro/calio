import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { products, type ProductRow } from '@/db/schema';
import type {
  IProduct,
  IProductsRepository,
  ProductChanges,
  ProductFilters,
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

function normalizeFilters(filters?: ProductFilters | URLSearchParams): ProductFilters {
  if (!filters) {
    return {};
  }

  if (filters instanceof URLSearchParams) {
    const categories = filters
      .getAll('category')
      .flatMap((category) => category.split(','))
      .map((category) => category.trim())
      .filter(Boolean);
    const inStoreParam = filters.get('inStore');

    return {
      ...(categories.length > 0 ? { categories } : {}),
      ...(inStoreParam === 'true' ? { inStore: true } : {}),
      ...(inStoreParam === 'false' ? { inStore: false } : {}),
    };
  }

  return {
    categories: filters.categories?.map((category) => category.trim()).filter(Boolean),
    inStore: filters.inStore,
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

  async findAll(filters?: ProductFilters | URLSearchParams): Promise<IProduct[]> {
    const normalizedFilters = normalizeFilters(filters);
    const conditions = [
      normalizedFilters.categories && normalizedFilters.categories.length > 0
        ? inArray(products.category, normalizedFilters.categories)
        : undefined,
      normalizedFilters.inStore !== undefined
        ? eq(products.inStore, normalizedFilters.inStore)
        : undefined,
    ].filter((condition) => condition !== undefined);

    const productRows =
      conditions.length > 0
        ? await db
            .select()
            .from(products)
            .where(and(...conditions))
        : await db.select().from(products);

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

  async deleteById(id: number): Promise<boolean> {
    const deletedProducts = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deletedProducts.length > 0;
  }
}

export const productsRepository: IProductsRepository =
  new DrizzleProductsRepository();
