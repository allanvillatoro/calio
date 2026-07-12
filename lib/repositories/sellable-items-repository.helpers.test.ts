import { describe, expect, it } from 'vitest';
import type { SQL } from 'drizzle-orm';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';
import {
  buildFindAllResult,
  calculatePriceWithDiscount,
  combineSqlConditions,
  getPagination,
  normalizeQuery,
  normalizeSellableFilters,
} from './sellable-items-repository.helpers';

describe('calculatePriceWithDiscount', () => {
  it('returns a price rounded to two decimals', () => {
    expect(calculatePriceWithDiscount(99.99, 15)).toBe(84.99);
  });
});

describe('normalizeQuery', () => {
  it('trims queries and removes empty values', () => {
    expect(normalizeQuery('  perla  ')).toBe('perla');
    expect(normalizeQuery('   ')).toBeUndefined();
  });
});

describe('normalizeSellableFilters', () => {
  it('returns public defaults when filters are omitted', () => {
    expect(normalizeSellableFilters()).toEqual({
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      includeOutOfStock: false,
    });
  });

  it('normalizes object filters', () => {
    expect(
      normalizeSellableFilters({
        query: '  oro  ',
        page: 3,
        limit: 12,
        includeOutOfStock: true,
      }),
    ).toEqual({
      query: 'oro',
      page: 3,
      limit: 12,
      includeOutOfStock: true,
    });
  });

  it('normalizes URLSearchParams filters', () => {
    const filters = normalizeSellableFilters(
      new URLSearchParams({
        query: '  oro  ',
        page: '4',
        limit: '8',
        includeOutOfStock: 'true',
      }),
    );

    expect(filters).toEqual({
      query: 'oro',
      page: 4,
      limit: 8,
      includeOutOfStock: true,
    });
  });
});

describe('getPagination', () => {
  it('calculates offset from page and limit', () => {
    expect(
      getPagination({
        page: 3,
        limit: 20,
      }),
    ).toEqual({
      currentPage: 3,
      limit: 20,
      offset: 40,
    });
  });

  it('falls back to defaults for invalid pagination values', () => {
    expect(
      getPagination({
        page: 0,
        limit: -10,
      }),
    ).toEqual({
      currentPage: 1,
      limit: PRODUCTS_PER_PAGE,
      offset: 0,
    });
  });
});

describe('combineSqlConditions', () => {
  it('returns undefined when all conditions are undefined', () => {
    expect(combineSqlConditions([undefined, undefined])).toBeUndefined();
  });

  it('returns a SQL expression when at least one condition exists', () => {
    expect(combineSqlConditions([{} as SQL, undefined])).toBeDefined();
  });
});

describe('buildFindAllResult', () => {
  it('builds paging metadata for a populated page', () => {
    expect(
      buildFindAllResult([{ id: 1 }], {
        totalItems: 25,
        currentPage: 2,
        limit: 10,
      }),
    ).toEqual({
      data: [{ id: 1 }],
      paging: {
        totalItems: 25,
        totalPages: 3,
        currentPage: 2,
        limit: 10,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
  });

  it('uses zero total pages when no items exist', () => {
    expect(
      buildFindAllResult([], {
        totalItems: 0,
        currentPage: 1,
        limit: 10,
      }).paging,
    ).toMatchObject({
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
