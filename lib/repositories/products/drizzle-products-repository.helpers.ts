import {
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  or,
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
import {
  calculatePriceWithDiscount,
  combineSqlConditions,
  normalizeSellableFilters,
} from '../sellable-items-repository.helpers';

export { getPagination } from '../sellable-items-repository.helpers';

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
    priceWithDiscount: calculatePriceWithDiscount(row.price, row.discount),
    quantity: row.quantity,
    images: row.images,
    slug: row.slug,
    category: row.category,
    inStoreSps: row.inStoreSps,
    inStorePro: row.inStorePro,
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

export function normalizeFilters(
  filters?: ProductFilters | URLSearchParams,
): ProductFilters {
  if (!filters) {
    return normalizeSellableFilters();
  }

  if (filters instanceof URLSearchParams) {
    const sellableFilters = normalizeSellableFilters(filters);
    const categories = normalizeCategories(
      filters
        .getAll('category')
        .flatMap((category) => category.split(','))
        .map((category) => category.trim()),
    );
    const inStoreSpsParam = filters.get('instoresps');
    const inStoreProParam = filters.get('instorepro');

    return {
      ...sellableFilters,
      ...(categories ? { categories } : {}),
      ...(inStoreSpsParam === 'true' ? { inStoreSps: true } : {}),
      ...(inStoreSpsParam === 'false' ? { inStoreSps: false } : {}),
      ...(inStoreProParam === 'true' ? { inStorePro: true } : {}),
      ...(inStoreProParam === 'false' ? { inStorePro: false } : {}),
    };
  }

  const sellableFilters = normalizeSellableFilters(filters);

  return {
    ...sellableFilters,
    categories: normalizeCategories(filters.categories),
    inStoreSps: filters.inStoreSps,
    inStorePro: filters.inStorePro,
  };
}

export function buildProductsWhereClause(filters: ProductFilters) {
  return combineSqlConditions([
    filters.includeOutOfStock ? undefined : gte(products.quantity, 1),
    filters.includeOutOfStock
      ? undefined
      : or(eq(products.inStorePro, false), gte(products.quantity, 2)),
    filters.categories
      ? inArray(products.category, filters.categories)
      : undefined,
    filters.query ? ilike(products.name, `%${filters.query}%`) : undefined,
    filters.inStoreSps !== undefined
      ? eq(products.inStoreSps, filters.inStoreSps)
      : undefined,
    filters.inStorePro !== undefined
      ? eq(products.inStorePro, filters.inStorePro)
      : undefined,
  ]);
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
