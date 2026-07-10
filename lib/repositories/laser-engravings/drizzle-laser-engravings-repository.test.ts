import { describe, expect, it, vi } from 'vitest';
import type { AppDb } from '@/db';
import type { LaserEngravingRow } from '@/db/schema';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/product';
import { LaserEngravingConflictError } from '@/lib/errors';
import { DrizzleLaserEngravingsRepository } from './drizzle-laser-engravings-repository';
import type { LaserEngravingChanges } from './laser-engravings-repository.interface';

vi.mock('@/db', () => ({
  db: {},
}));

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

const validInput: LaserEngravingChanges = {
  slug: 'placa-corazon',
  name: 'Placa corazon',
  description: 'Placa para grabado laser personalizada',
  price: 180,
  discount: 0,
  quantity: 8,
  images: ['placa-corazon.jpg'],
};

function createSelectOneDb(rows: LaserEngravingRow[]) {
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
    select,
    from,
    where,
    limit,
  };
}

function createUniqueViolation() {
  return {
    code: '23505',
    constraint: 'laser_engravings_slug_unique',
  };
}

describe('DrizzleLaserEngravingsRepository.save', () => {
  it('inserts and maps a laser engraving', async () => {
    const row = createLaserEngravingRow();
    const returning = vi.fn().mockResolvedValue([row]);
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      insert,
    } as unknown as AppDb);

    const result = await repository.save(validInput);

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: validInput.slug,
        name: validInput.name,
        description: validInput.description,
        price: validInput.price,
        discount: validInput.discount,
        quantity: validInput.quantity,
        images: validInput.images,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
    expect(result).toMatchObject({
      id: row.id,
      slug: row.slug,
      priceWithDiscount: row.price,
    });
  });

  it('defaults discount to zero', async () => {
    const returning = vi.fn().mockResolvedValue([createLaserEngravingRow()]);
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      insert,
    } as unknown as AppDb);

    await repository.save({
      ...validInput,
      discount: undefined,
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        discount: 0,
      }),
    );
  });

  it('passes explicit ids when provided', async () => {
    const returning = vi.fn().mockResolvedValue([createLaserEngravingRow()]);
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      insert,
    } as unknown as AppDb);

    await repository.save({
      ...validInput,
      id: 1001,
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1001,
      }),
    );
  });

  it('throws a field-level conflict when the slug already exists', async () => {
    const returning = vi.fn().mockRejectedValue(createUniqueViolation());
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      insert,
    } as unknown as AppDb);

    await expect(repository.save(validInput)).rejects.toBeInstanceOf(
      LaserEngravingConflictError,
    );
  });

  it('rethrows unexpected insert errors', async () => {
    const error = new Error('database failed');
    const returning = vi.fn().mockRejectedValue(error);
    const values = vi.fn(() => ({
      returning,
    }));
    const insert = vi.fn(() => ({
      values,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      insert,
    } as unknown as AppDb);

    await expect(repository.save(validInput)).rejects.toBe(error);
  });
});

describe('DrizzleLaserEngravingsRepository.findById', () => {
  it('returns a mapped laser engraving when found', async () => {
    const { db, where, limit } = createSelectOneDb([
      createLaserEngravingRow({ id: 21 }),
    ]);
    const repository = new DrizzleLaserEngravingsRepository(db);

    const result = await repository.findById(21);

    expect(where).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({
      id: 21,
      slug: 'placa-corazon',
    });
  });

  it('returns null when no laser engraving matches the id', async () => {
    const { db } = createSelectOneDb([]);
    const repository = new DrizzleLaserEngravingsRepository(db);

    await expect(repository.findById(99)).resolves.toBeNull();
  });
});

describe('DrizzleLaserEngravingsRepository.findBySlug', () => {
  it('returns a mapped laser engraving when found', async () => {
    const { db, where, limit } = createSelectOneDb([
      createLaserEngravingRow({ slug: 'placa-corazon' }),
    ]);
    const repository = new DrizzleLaserEngravingsRepository(db);

    const result = await repository.findBySlug('placa-corazon');

    expect(where).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toMatchObject({
      id: 17,
      slug: 'placa-corazon',
    });
  });

  it('returns null when no laser engraving matches the slug', async () => {
    const { db } = createSelectOneDb([]);
    const repository = new DrizzleLaserEngravingsRepository(db);

    await expect(repository.findBySlug('missing')).resolves.toBeNull();
  });
});

describe('DrizzleLaserEngravingsRepository.findAll', () => {
  it('returns paginated laser engravings', async () => {
    const row = createLaserEngravingRow();
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
    const repository = new DrizzleLaserEngravingsRepository({
      select,
    } as unknown as AppDb);

    const result = await repository.findAll({
      query: 'placa',
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
          slug: row.slug,
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

  it('returns empty pagination when there are no laser engravings', async () => {
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
    const repository = new DrizzleLaserEngravingsRepository({
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

describe('DrizzleLaserEngravingsRepository.updateById', () => {
  it('updates and maps a laser engraving', async () => {
    const row = createLaserEngravingRow({ name: 'Placa actualizada' });
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
    const repository = new DrizzleLaserEngravingsRepository({
      update,
    } as unknown as AppDb);

    const result = await repository.updateById(17, {
      name: 'Placa actualizada',
      description: undefined,
    });

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Placa actualizada',
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
      name: 'Placa actualizada',
    });
  });

  it('returns null when the update does not match a laser engraving', async () => {
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
    const repository = new DrizzleLaserEngravingsRepository({
      update,
    } as unknown as AppDb);

    await expect(
      repository.updateById(99, { name: 'Missing' }),
    ).resolves.toBeNull();
  });

  it('throws a field-level conflict when the new slug already exists', async () => {
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
    const repository = new DrizzleLaserEngravingsRepository({
      update,
    } as unknown as AppDb);

    await expect(
      repository.updateById(17, { slug: 'placa-corazon' }),
    ).rejects.toBeInstanceOf(LaserEngravingConflictError);
  });

  it('rethrows unexpected update errors', async () => {
    const error = new Error('database failed');
    const returning = vi.fn().mockRejectedValue(error);
    const where = vi.fn(() => ({
      returning,
    }));
    const set = vi.fn(() => ({
      where,
    }));
    const update = vi.fn(() => ({
      set,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      update,
    } as unknown as AppDb);

    await expect(
      repository.updateById(17, { slug: 'placa-corazon' }),
    ).rejects.toBe(error);
  });
});

describe('DrizzleLaserEngravingsRepository.deleteById', () => {
  it('returns true when a laser engraving was deleted', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 17 }]);
    const where = vi.fn(() => ({
      returning,
    }));
    const deleteFn = vi.fn(() => ({
      where,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      delete: deleteFn,
    } as unknown as AppDb);

    await expect(repository.deleteById(17)).resolves.toBe(true);
  });

  it('returns false when no laser engraving was deleted', async () => {
    const returning = vi.fn().mockResolvedValue([]);
    const where = vi.fn(() => ({
      returning,
    }));
    const deleteFn = vi.fn(() => ({
      where,
    }));
    const repository = new DrizzleLaserEngravingsRepository({
      delete: deleteFn,
    } as unknown as AppDb);

    await expect(repository.deleteById(99)).resolves.toBe(false);
  });
});
