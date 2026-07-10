import { describe, expect, it, vi } from 'vitest';
import type { AppDb } from '@/db';
import type { ProductRow } from '@/db/schema';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';
import { ProductConflictError } from '@/lib/errors';
import { DrizzleProductsRepository } from './drizzle-products-repository';
import type { ProductChanges } from './products-repository.interface';

vi.mock('@/db', () => ({
  db: {},
}));

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
    slug: 'anillo-aurora',
    category: 'anillos',
    inStore: true,
    createdAt,
    updatedAt,
    ...overrides,
  };
}

const validInput: ProductChanges = {
  name: 'Anillo Aurora',
  description: 'Anillo ajustable con detalle dorado',
  price: 199.99,
  discount: 0,
  quantity: 4,
  images: ['anillo-aurora.jpg'],
  slug: 'anillo-aurora',
  category: 'anillos',
  inStore: true,
};

function createSelectOneDb(rows: ProductRow[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  const where = vi.fn(() => ({
    limit,
  }));
  const from = vi.fn(() => ({
    where,
  }));
  const select = vi.fn(() => ({
    from,
  }));

  return {
    db: {
      select,
    } as unknown as AppDb,
    where,
    limit,
  };
}

function createUniqueViolation() {
  return {
    code: '23505',
    constraint: 'products_name_unique',
  };
}

describe('DrizzleProductsRepository.save', () => {
  it('inserts and maps a product', async () => {
    const row = createProductRow();
    const returning = vi.fn().mockResolvedValue([row]);
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleProductsRepository({
      insert,
    } as unknown as AppDb);

    const result = await repository.save(validInput);

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        name: validInput.name,
        description: validInput.description,
        price: validInput.price,
        discount: validInput.discount,
        quantity: validInput.quantity,
        images: validInput.images,
        category: validInput.category,
        inStore: validInput.inStore,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
    expect(result).toMatchObject({
      id: row.id,
      name: row.name,
      priceWithDiscount: row.price,
    });
  });

  it('defaults discount and inStore values', async () => {
    const returning = vi.fn().mockResolvedValue([createProductRow()]);
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleProductsRepository({
      insert,
    } as unknown as AppDb);

    await repository.save({
      ...validInput,
      discount: undefined,
      inStore: undefined,
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        discount: 0,
        inStore: false,
      }),
    );
  });

  it('throws a field-level conflict when the product name already exists', async () => {
    const returning = vi.fn().mockRejectedValue(createUniqueViolation());
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleProductsRepository({
      insert,
    } as unknown as AppDb);

    await expect(repository.save(validInput)).rejects.toBeInstanceOf(
      ProductConflictError,
    );
  });
});

describe('DrizzleProductsRepository.findById', () => {
  it('returns a mapped product when found', async () => {
    const { db, where, limit } = createSelectOneDb([
      createProductRow({ id: 21 }),
    ]);
    const repository = new DrizzleProductsRepository(db);

    const result = await repository.findById(21);

    expect(where).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({
      id: 21,
      name: 'Anillo Aurora',
    });
  });

  it('returns null when no product matches the id', async () => {
    const { db } = createSelectOneDb([]);
    const repository = new DrizzleProductsRepository(db);

    await expect(repository.findById(99)).resolves.toBeNull();
  });
});

describe('DrizzleProductsRepository.findBySlug', () => {
  it('returns a mapped product when found', async () => {
    const { db, where, limit } = createSelectOneDb([
      createProductRow({ slug: 'anillo-aurora' }),
    ]);
    const repository = new DrizzleProductsRepository(db);

    const result = await repository.findBySlug('anillo-aurora');

    expect(where).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({
      id: 7,
      slug: 'anillo-aurora',
    });
  });

  it('returns null when no product matches the slug', async () => {
    const { db } = createSelectOneDb([]);
    const repository = new DrizzleProductsRepository(db);

    await expect(repository.findBySlug('missing')).resolves.toBeNull();
  });
});

describe('DrizzleProductsRepository.findAll', () => {
  it('returns paginated products', async () => {
    const row = createProductRow();
    const countWhere = vi.fn().mockResolvedValue([{ totalItems: 11 }]);
    const countFrom = vi.fn(() => ({
      where: countWhere,
    }));
    const rowsOffset = vi.fn().mockResolvedValue([row]);
    const rowsLimit = vi.fn(() => ({
      offset: rowsOffset,
    }));
    const rowsOrderBy = vi.fn(() => ({
      limit: rowsLimit,
    }));
    const rowsWhere = vi.fn(() => ({
      orderBy: rowsOrderBy,
    }));
    const rowsFrom = vi.fn(() => ({
      where: rowsWhere,
    }));
    const select = vi.fn((selection?: unknown) => ({
      from: selection ? countFrom : rowsFrom,
    }));
    const repository = new DrizzleProductsRepository({
      select,
    } as unknown as AppDb);

    const result = await repository.findAll({
      categories: ['anillos'],
      query: 'aurora',
      inStore: true,
      page: 2,
      limit: 5,
      includeOutOfStock: false,
    });

    expect(countWhere).toHaveBeenCalled();
    expect(rowsWhere).toHaveBeenCalled();
    expect(rowsLimit).toHaveBeenCalledWith(5);
    expect(rowsOffset).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: row.id,
          name: row.name,
        }),
      ],
      paging: {
        totalItems: 11,
        totalPages: 3,
        currentPage: 2,
        limit: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
  });

  it('returns empty pagination when there are no products', async () => {
    const countFrom = vi.fn().mockResolvedValue([{ totalItems: 0 }]);
    const rowsOffset = vi.fn().mockResolvedValue([]);
    const rowsLimit = vi.fn(() => ({
      offset: rowsOffset,
    }));
    const rowsOrderBy = vi.fn(() => ({
      limit: rowsLimit,
    }));
    const rowsFrom = vi.fn(() => ({
      orderBy: rowsOrderBy,
    }));
    const select = vi.fn((selection?: unknown) => ({
      from: selection ? countFrom : rowsFrom,
    }));
    const repository = new DrizzleProductsRepository({
      select,
    } as unknown as AppDb);

    const result = await repository.findAll({
      includeOutOfStock: true,
    });

    expect(result.paging).toEqual({
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      limit: PRODUCTS_PER_PAGE,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});

describe('DrizzleProductsRepository.updateById', () => {
  it('updates and maps a product', async () => {
    const row = createProductRow({ name: 'Anillo actualizado' });
    const returning = vi.fn().mockResolvedValue([row]);
    const where = vi.fn(() => ({
      returning,
    }));
    const set = vi.fn(() => ({
      where,
    }));
    const update = vi.fn(() => ({
      set,
    }));
    const repository = new DrizzleProductsRepository({
      update,
    } as unknown as AppDb);

    const result = await repository.updateById(7, {
      name: 'Anillo actualizado',
      description: undefined,
    });

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Anillo actualizado',
        updatedAt: expect.any(Date),
      }),
    );
    expect(set).toHaveBeenCalledWith(
      expect.not.objectContaining({
        description: undefined,
      }),
    );
    expect(result).toMatchObject({
      id: row.id,
      name: 'Anillo actualizado',
    });
  });

  it('returns null when the update does not match a product', async () => {
    const returning = vi.fn().mockResolvedValue([]);
    const where = vi.fn(() => ({
      returning,
    }));
    const set = vi.fn(() => ({
      where,
    }));
    const update = vi.fn(() => ({
      set,
    }));
    const repository = new DrizzleProductsRepository({
      update,
    } as unknown as AppDb);

    await expect(
      repository.updateById(99, { name: 'Missing' }),
    ).resolves.toBeNull();
  });

  it('throws a field-level conflict when the new name already exists', async () => {
    const returning = vi.fn().mockRejectedValue(createUniqueViolation());
    const where = vi.fn(() => ({
      returning,
    }));
    const set = vi.fn(() => ({
      where,
    }));
    const update = vi.fn(() => ({
      set,
    }));
    const repository = new DrizzleProductsRepository({
      update,
    } as unknown as AppDb);

    await expect(
      repository.updateById(7, { name: 'Anillo Aurora' }),
    ).rejects.toBeInstanceOf(ProductConflictError);
  });
});

describe('DrizzleProductsRepository.deleteById', () => {
  it('returns true when a product was deleted', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 7 }]);
    const where = vi.fn(() => ({
      returning,
    }));
    const deleteFn = vi.fn(() => ({
      where,
    }));
    const repository = new DrizzleProductsRepository({
      delete: deleteFn,
    } as unknown as AppDb);

    await expect(repository.deleteById(7)).resolves.toBe(true);
  });

  it('returns false when no product was deleted', async () => {
    const returning = vi.fn().mockResolvedValue([]);
    const where = vi.fn(() => ({
      returning,
    }));
    const deleteFn = vi.fn(() => ({
      where,
    }));
    const repository = new DrizzleProductsRepository({
      delete: deleteFn,
    } as unknown as AppDb);

    await expect(repository.deleteById(99)).resolves.toBe(false);
  });
});
