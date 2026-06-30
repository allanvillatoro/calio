import { describe, expect, it } from 'vitest';
import type { ProductRow } from '@/db/schema';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';
import {
  buildProductsWhereClause,
  getPagination,
  mapRowToProduct,
  normalizeFilters,
  requireProductField,
} from './drizzle-products-repository.helpers';

const createdAt = new Date('2026-01-15T12:00:00.000Z');
const updatedAt = new Date('2026-01-16T12:00:00.000Z');

function createProductRow(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: 7,
    name: 'Anillo Aurora',
    description: 'Anillo ajustable con detalle dorado',
    price: 199.99,
    quantity: 4,
    discount: 0,
    images: ['anillo-aurora.jpg'],
    category: 'anillos',
    inStore: true,
    createdAt,
    updatedAt,
    ...overrides,
  };
}

describe('mapRowToProduct', () => {
  it('maps product rows without changing persisted fields', () => {
    const row = createProductRow();

    const product = mapRowToProduct(row);

    expect(product).toMatchObject({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      discount: row.discount,
      quantity: row.quantity,
      images: row.images,
      category: row.category,
      inStore: row.inStore,
      createdAt,
      updatedAt,
    });
  });

  it('derives priceWithDiscount rounded to two decimals', () => {
    const row = createProductRow({
      price: 99.99,
      discount: 15,
    });

    const product = mapRowToProduct(row);

    expect(product.priceWithDiscount).toBe(84.99);
  });

  it('keeps priceWithDiscount equal to price when discount is zero', () => {
    const row = createProductRow({
      price: 125,
      discount: 0,
    });

    const product = mapRowToProduct(row);

    expect(product.priceWithDiscount).toBe(125);
  });
});

describe('normalizeFilters', () => {
  it('returns public catalog defaults when filters are omitted', () => {
    const filters = normalizeFilters();

    expect(filters).toEqual({
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      includeOutOfStock: false,
    });
  });

  it('normalizes object filters by trimming empty category and query values', () => {
    const filters = normalizeFilters({
      categories: [' anillos ', '', 'collares'],
      query: '  perla  ',
      inStore: false,
      page: 3,
      limit: 12,
      includeOutOfStock: true,
    });

    expect(filters).toEqual({
      categories: ['anillos', 'collares'],
      query: 'perla',
      inStore: false,
      page: 3,
      limit: 12,
      includeOutOfStock: true,
    });
  });

  it('removes empty object filters and preserves pagination defaults', () => {
    const filters = normalizeFilters({
      categories: [' ', ''],
      query: '   ',
    });

    expect(filters).toEqual({
      categories: undefined,
      query: undefined,
      inStore: undefined,
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      includeOutOfStock: false,
    });
  });

  it('normalizes URLSearchParams with comma-separated categories', () => {
    const params = new URLSearchParams({
      category: ' anillos, collares ',
      query: '  oro  ',
      instore: 'true',
      page: '4',
      limit: '8',
      includeOutOfStock: 'true',
    });

    const filters = normalizeFilters(params);

    expect(filters).toEqual({
      categories: ['anillos', 'collares'],
      query: 'oro',
      inStore: true,
      page: 4,
      limit: 8,
      includeOutOfStock: true,
    });
  });

  it('normalizes repeated URL category params', () => {
    const params = new URLSearchParams();
    params.append('category', 'aretes,pulseras');
    params.append('category', 'sets');

    const filters = normalizeFilters(params);

    expect(filters.categories).toEqual(['aretes', 'pulseras', 'sets']);
  });

  it('parses instore=false from URLSearchParams', () => {
    const params = new URLSearchParams({
      instore: 'false',
    });

    const filters = normalizeFilters(params);

    expect(filters.inStore).toBe(false);
  });
});

describe('getPagination', () => {
  it('calculates the offset from page and limit', () => {
    const pagination = getPagination({
      page: 3,
      limit: 20,
    });

    expect(pagination).toEqual({
      currentPage: 3,
      limit: 20,
      offset: 40,
    });
  });

  it('falls back to safe defaults for non-positive page and limit', () => {
    const pagination = getPagination({
      page: 0,
      limit: -10,
    });

    expect(pagination).toEqual({
      currentPage: 1,
      limit: PRODUCTS_PER_PAGE,
      offset: 0,
    });
  });
});

describe('buildProductsWhereClause', () => {
  it('builds a public catalog where clause that excludes out-of-stock products', () => {
    const whereClause = buildProductsWhereClause({
      includeOutOfStock: false,
    });

    expect(whereClause).toBeDefined();
  });

  it('omits the where clause when authenticated requests have no filters', () => {
    const whereClause = buildProductsWhereClause({
      includeOutOfStock: true,
    });

    expect(whereClause).toBeUndefined();
  });

  it('builds a where clause for authenticated filtered requests', () => {
    const whereClause = buildProductsWhereClause({
      categories: ['anillos'],
      query: 'oro',
      inStore: true,
      includeOutOfStock: true,
    });

    expect(whereClause).toBeDefined();
  });
});

describe('requireProductField', () => {
  it('returns present product fields', () => {
    const value = requireProductField({ name: 'Anillo Aurora' }, 'name');

    expect(value).toBe('Anillo Aurora');
  });

  it('throws with the product field label when a required field is missing', () => {
    expect(() => requireProductField({}, 'name')).toThrow(
      'Missing required field: product.name',
    );
  });
});
