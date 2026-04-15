import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  type SQL,
} from 'drizzle-orm';
import { products, type ProductRow } from '@/db/schema';
import type { AppDb } from '@/db';
import type {
  ProductChanges,
  ProductFilters,
} from './products-repository.interface';
import { requireField } from '../repository.helpers';
import type { IProduct } from '@/lib/interfaces/product';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';

function isSqlCondition(value: SQL | undefined): value is SQL {
  return value !== undefined;
}

export function requireProductField<K extends keyof ProductChanges>(
  input: ProductChanges,
  field: K,
): NonNullable<ProductChanges[K]> {
  return requireField(input, field, {
    label: `product.${String(field)}`,
  });
}

export function mapRowToProduct(row: ProductRow): IProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    discount: row.discount,
    priceWithDiscount: Number(
      (row.price * (1 - row.discount / 100)).toFixed(2),
    ),
    quantity: row.quantity,
    images: row.images,
    category: row.category,
    inStore: row.inStore,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function normalizeCategories(categories?: string[]): string[] | undefined {
  const normalizedCategories = categories
    ?.map((category) => category.trim())
    .filter(Boolean);

  return normalizedCategories && normalizedCategories.length > 0
    ? normalizedCategories
    : undefined;
}

function normalizeQuery(query?: string): string | undefined {
  const normalizedQuery = query?.trim();
  return normalizedQuery ? normalizedQuery : undefined;
}

export function normalizeFilters(
  filters?: ProductFilters | URLSearchParams,
): ProductFilters {
  if (!filters) {
    return {
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      includeOutOfStock: false,
    };
  }

  if (filters instanceof URLSearchParams) {
    const categories = normalizeCategories(
      filters
        .getAll('category')
        .flatMap((category) => category.split(','))
        .map((category) => category.trim()),
    );
    const inStoreParam = filters.get('instore');
    const queryParam = normalizeQuery(filters.get('query') ?? undefined);
    const pageParam = filters.get('page');
    const limitParam = filters.get('limit');

    return {
      ...(categories ? { categories } : {}),
      ...(queryParam ? { query: queryParam } : {}),
      ...(inStoreParam === 'true' ? { inStore: true } : {}),
      ...(inStoreParam === 'false' ? { inStore: false } : {}),
      page: pageParam ? Number(pageParam) : 1,
      limit: limitParam ? Number(limitParam) : PRODUCTS_PER_PAGE,
      includeOutOfStock: filters.get('includeOutOfStock') === 'true',
    };
  }

  return {
    categories: normalizeCategories(filters.categories),
    query: normalizeQuery(filters.query),
    inStore: filters.inStore,
    page: filters.page ?? 1,
    limit: filters.limit ?? PRODUCTS_PER_PAGE,
    includeOutOfStock: filters.includeOutOfStock ?? false,
  };
}

export function getPagination(filters: ProductFilters) {
  const currentPage = filters.page && filters.page > 0 ? filters.page : 1;
  const limit =
    filters.limit && filters.limit > 0 ? filters.limit : PRODUCTS_PER_PAGE;
  const offset = (currentPage - 1) * limit;

  return {
    currentPage,
    limit,
    offset,
  };
}

export function buildProductsWhereClause(filters: ProductFilters) {
  const conditions: SQL[] = [
    filters.includeOutOfStock ? undefined : gte(products.quantity, 1),
    filters.categories
      ? inArray(products.category, filters.categories)
      : undefined,
    filters.query ? ilike(products.name, `%${filters.query}%`) : undefined,
    filters.inStore !== undefined
      ? eq(products.inStore, filters.inStore)
      : undefined,
  ].filter(isSqlCondition);

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function countProductsWithDb(db: AppDb, whereClause?: SQL) {
  const [{ totalItems }] = whereClause
    ? await db.select({ totalItems: count() }).from(products).where(whereClause)
    : await db.select({ totalItems: count() }).from(products);

  return totalItems;
}

function dbSelectProducts(
  db: AppDb,
  options: {
    whereClause?: SQL;
    limit: number;
    offset: number;
  },
) {
  const { whereClause, limit, offset } = options;

  return whereClause
    ? db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(desc(products.id))
        .limit(limit)
        .offset(offset)
    : db
        .select()
        .from(products)
        .orderBy(desc(products.id))
        .limit(limit)
        .offset(offset);
}

export async function findProductRowsWithDb(
  db: AppDb,
  options: {
    whereClause?: SQL;
    limit: number;
    offset: number;
  },
) {
  return dbSelectProducts(db, options);
}
