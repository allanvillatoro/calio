import { describe, expect, it, vi } from 'vitest';
import type { SQL } from 'drizzle-orm';
import type { AppDb } from '@/db';
import type { LaserEngravingRow } from '@/db/schema';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';
import {
  buildLaserEngravingsWhereClause,
  countLaserEngravingsWithDb,
  findLaserEngravingRowsWithDb,
  getPagination,
  mapRowToLaserEngraving,
  normalizeFilters,
  requireLaserEngravingField,
} from './drizzle-laser-engravings-repository.helpers';

const createdAt = new Date('2026-01-15T12:00:00.000Z');
const updatedAt = new Date('2026-01-16T12:00:00.000Z');

function createLaserEngravingRow(
  overrides: Partial<LaserEngravingRow> = {},
): LaserEngravingRow {
  return {
    id: 17,
    slug: 'placa-corazon',
    name: 'Placa corazon',
    description: 'Placa para grabado laser personalizada',
    price: 180,
    quantity: 8,
    discount: 0,
    images: ['placa-corazon.jpg'],
    createdAt,
    updatedAt,
    ...overrides,
  };
}

describe('mapRowToLaserEngraving', () => {
  it('maps laser engraving rows without changing persisted fields', () => {
    const row = createLaserEngravingRow();

    const laserEngraving = mapRowToLaserEngraving(row);

    expect(laserEngraving).toMatchObject({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      price: row.price,
      discount: row.discount,
      quantity: row.quantity,
      images: row.images,
      createdAt,
      updatedAt,
    });
  });

  it('derives priceWithDiscount rounded to two decimals', () => {
    const row = createLaserEngravingRow({
      price: 99.99,
      discount: 15,
    });

    const laserEngraving = mapRowToLaserEngraving(row);

    expect(laserEngraving.priceWithDiscount).toBe(84.99);
  });

  it('keeps priceWithDiscount equal to price when discount is zero', () => {
    const row = createLaserEngravingRow({
      price: 125,
      discount: 0,
    });

    const laserEngraving = mapRowToLaserEngraving(row);

    expect(laserEngraving.priceWithDiscount).toBe(125);
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

  it('normalizes object filters by trimming empty query values', () => {
    const filters = normalizeFilters({
      query: '  placa  ',
      page: 3,
      limit: 12,
      includeOutOfStock: true,
    });

    expect(filters).toEqual({
      query: 'placa',
      page: 3,
      limit: 12,
      includeOutOfStock: true,
    });
  });

  it('removes empty object query filters and preserves pagination defaults', () => {
    const filters = normalizeFilters({
      query: '   ',
    });

    expect(filters).toEqual({
      query: undefined,
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      includeOutOfStock: false,
    });
  });

  it('normalizes URLSearchParams filters', () => {
    const params = new URLSearchParams({
      query: '  medalla  ',
      page: '4',
      limit: '8',
      includeOutOfStock: 'true',
    });

    const filters = normalizeFilters(params);

    expect(filters).toEqual({
      query: 'medalla',
      page: 4,
      limit: 8,
      includeOutOfStock: true,
    });
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

describe('buildLaserEngravingsWhereClause', () => {
  it('builds a public catalog where clause that excludes out-of-stock laser engravings', () => {
    const whereClause = buildLaserEngravingsWhereClause({
      includeOutOfStock: false,
    });

    expect(whereClause).toBeDefined();
  });

  it('omits the where clause when authenticated requests have no filters', () => {
    const whereClause = buildLaserEngravingsWhereClause({
      includeOutOfStock: true,
    });

    expect(whereClause).toBeUndefined();
  });

  it('builds a where clause for text search requests', () => {
    const whereClause = buildLaserEngravingsWhereClause({
      query: 'placa',
      includeOutOfStock: true,
    });

    expect(whereClause).toBeDefined();
  });
});

describe('requireLaserEngravingField', () => {
  it('returns present laser engraving fields', () => {
    const value = requireLaserEngravingField({ name: 'Placa corazon' }, 'name');

    expect(value).toBe('Placa corazon');
  });

  it('throws with the laser engraving field label when a required field is missing', () => {
    expect(() => requireLaserEngravingField({}, 'name')).toThrow(
      'Missing required field: laserEngraving.name',
    );
  });
});

describe('database helpers', () => {
  it('counts laser engravings with a where clause', async () => {
    const whereClause = {} as SQL;
    const where = vi.fn().mockResolvedValue([{ totalItems: 7 }]);
    const from = vi.fn(() => ({
      where,
    }));
    const select = vi.fn(() => ({
      from,
    }));
    const db = {
      select,
    } as unknown as AppDb;

    await expect(countLaserEngravingsWithDb(db, whereClause)).resolves.toBe(7);

    expect(select).toHaveBeenCalled();
    expect(from).toHaveBeenCalled();
    expect(where).toHaveBeenCalledWith(whereClause);
  });

  it('counts laser engravings without a where clause', async () => {
    const from = vi.fn().mockResolvedValue([{ totalItems: 3 }]);
    const select = vi.fn(() => ({
      from,
    }));
    const db = {
      select,
    } as unknown as AppDb;

    await expect(countLaserEngravingsWithDb(db)).resolves.toBe(3);

    expect(from).toHaveBeenCalled();
  });

  it('finds laser engraving rows with a where clause', async () => {
    const rows = [createLaserEngravingRow()];
    const whereClause = {} as SQL;
    const offset = vi.fn().mockResolvedValue(rows);
    const limit = vi.fn(() => ({
      offset,
    }));
    const orderBy = vi.fn(() => ({
      limit,
    }));
    const where = vi.fn(() => ({
      orderBy,
    }));
    const from = vi.fn(() => ({
      where,
    }));
    const select = vi.fn(() => ({
      from,
    }));
    const db = {
      select,
    } as unknown as AppDb;

    await expect(
      findLaserEngravingRowsWithDb(db, {
        whereClause,
        limit: 10,
        offset: 20,
      }),
    ).resolves.toEqual(rows);

    expect(where).toHaveBeenCalledWith(whereClause);
    expect(limit).toHaveBeenCalledWith(10);
    expect(offset).toHaveBeenCalledWith(20);
  });

  it('finds laser engraving rows without a where clause', async () => {
    const rows = [createLaserEngravingRow({ id: 9 })];
    const offset = vi.fn().mockResolvedValue(rows);
    const limit = vi.fn(() => ({
      offset,
    }));
    const orderBy = vi.fn(() => ({
      limit,
    }));
    const from = vi.fn(() => ({
      orderBy,
    }));
    const select = vi.fn(() => ({
      from,
    }));
    const db = {
      select,
    } as unknown as AppDb;

    await expect(
      findLaserEngravingRowsWithDb(db, {
        limit: 8,
        offset: 0,
      }),
    ).resolves.toEqual(rows);

    expect(orderBy).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(8);
    expect(offset).toHaveBeenCalledWith(0);
  });
});
