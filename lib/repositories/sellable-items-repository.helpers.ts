import { and, type SQL } from 'drizzle-orm';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';

export interface SellableItemFilters {
  query?: string;
  page?: number;
  limit?: number;
  includeOutOfStock?: boolean;
}

export function calculatePriceWithDiscount(price: number, discount: number) {
  return Number((price * (1 - discount / 100)).toFixed(2));
}

export function normalizeQuery(query?: string): string | undefined {
  const normalizedQuery = query?.trim();
  return normalizedQuery ? normalizedQuery : undefined;
}

export function normalizeSellableFilters<TFilters extends SellableItemFilters>(
  filters?: TFilters | URLSearchParams,
): SellableItemFilters {
  if (!filters) {
    return {
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      includeOutOfStock: false,
    };
  }

  if (filters instanceof URLSearchParams) {
    const queryParam = normalizeQuery(filters.get('query') ?? undefined);
    const pageParam = filters.get('page');
    const limitParam = filters.get('limit');

    return {
      ...(queryParam ? { query: queryParam } : {}),
      page: pageParam ? Number(pageParam) : 1,
      limit: limitParam ? Number(limitParam) : PRODUCTS_PER_PAGE,
      includeOutOfStock: filters.get('includeOutOfStock') === 'true',
    };
  }

  return {
    query: normalizeQuery(filters.query),
    page: filters.page ?? 1,
    limit: filters.limit ?? PRODUCTS_PER_PAGE,
    includeOutOfStock: filters.includeOutOfStock ?? false,
  };
}

export function getPagination(filters: SellableItemFilters) {
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

function isSqlCondition(value: SQL | undefined): value is SQL {
  return value !== undefined;
}

export function combineSqlConditions(conditions: Array<SQL | undefined>) {
  const sqlConditions = conditions.filter(isSqlCondition);

  return sqlConditions.length > 0 ? and(...sqlConditions) : undefined;
}

export function buildFindAllResult<TItem>(
  data: TItem[],
  options: {
    totalItems: number;
    currentPage: number;
    limit: number;
  },
) {
  const { totalItems, currentPage, limit } = options;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    data,
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
