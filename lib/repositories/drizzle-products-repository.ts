import 'server-only';
import { and, count, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { products, type ProductRow } from '@/db/schema';
import type {
  FindAllProductsResult,
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

function isSqlCondition(value: SQL | undefined): value is SQL {
  return value !== undefined;
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
    return {
      page: 1,
      limit: 20,
    };
  }

  if (filters instanceof URLSearchParams) {
    const categories = filters
      .getAll('category')
      .flatMap((category) => category.split(','))
      .map((category) => category.trim())
      .filter(Boolean);
    const inStoreParam = filters.get('inStore');
    const pageParam = filters.get('page');
    const limitParam = filters.get('limit');

    return {
      ...(categories.length > 0 ? { categories } : {}),
      ...(inStoreParam === 'true' ? { inStore: true } : {}),
      ...(inStoreParam === 'false' ? { inStore: false } : {}),
      page: pageParam ? Number(pageParam) : 1,
      limit: limitParam ? Number(limitParam) : 20,
    };
  }

  return {
    categories: filters.categories?.map((category) => category.trim()).filter(Boolean),
    inStore: filters.inStore,
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
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

  async findAll(
    filters?: ProductFilters | URLSearchParams,
  ): Promise<FindAllProductsResult> {
    const normalizedFilters = normalizeFilters(filters);
    const currentPage = normalizedFilters.page && normalizedFilters.page > 0
      ? normalizedFilters.page
      : 1;
    const limit = normalizedFilters.limit && normalizedFilters.limit > 0
      ? normalizedFilters.limit
      : 20;
    const offset = (currentPage - 1) * limit;
    const conditions: SQL[] = [
      normalizedFilters.categories && normalizedFilters.categories.length > 0
        ? inArray(products.category, normalizedFilters.categories)
        : undefined,
      normalizedFilters.inStore !== undefined
        ? eq(products.inStore, normalizedFilters.inStore)
        : undefined,
    ].filter(isSqlCondition);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ totalItems }] = whereClause
      ? await db
          .select({ totalItems: count() })
          .from(products)
          .where(whereClause)
      : await db.select({ totalItems: count() }).from(products);

    const productRows = whereClause
      ? await db
          .select()
          .from(products)
          .where(whereClause)
          .orderBy(desc(products.id))
          .limit(limit)
          .offset(offset)
      : await db
          .select()
          .from(products)
          .orderBy(desc(products.id))
          .limit(limit)
          .offset(offset);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      data: productRows.map(mapRowToProduct),
      paging: {
        totalItems,
        totalPages,
        currentPage,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
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
