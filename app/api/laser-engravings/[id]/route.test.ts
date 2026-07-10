import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LaserEngravingConflictError } from '@/lib/errors';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';
import { PUT } from './route';

vi.mock(
  '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository',
  () => ({
    laserEngravingsRepository: {
      updateById: vi.fn(),
    },
  }),
);

vi.mock('@/lib/slug-conflicts', () => ({
  assertLaserEngravingSlugDoesNotConflictWithProduct: vi.fn(),
}));

const laserEngraving: ILaserEngraving = {
  id: 12,
  slug: 'grabado-nombre-fecha',
  name: 'Nombre y fecha',
  description: 'Grabado laser con nombre y fecha especial',
  price: 150,
  discount: 0,
  priceWithDiscount: 150,
  quantity: 8,
  images: ['grabado-nombre-fecha.jpg'],
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
};

const validLaserEngravingBody = {
  slug: laserEngraving.slug,
  name: laserEngraving.name,
  description: laserEngraving.description,
  price: laserEngraving.price,
  discount: laserEngraving.discount,
  quantity: laserEngraving.quantity,
  images: laserEngraving.images,
};

function createPutRequest(body: unknown) {
  return new Request('http://localhost/api/laser-engravings/12', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function createContext(id = '12') {
  return {
    params: Promise.resolve({ id }),
  };
}

describe('PUT /api/laser-engravings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).mockResolvedValue(undefined);
  });

  it('updates a laser engraving after validating public slug conflicts', async () => {
    vi.mocked(laserEngravingsRepository.updateById).mockResolvedValue(
      laserEngraving,
    );

    const response = await PUT(
      createPutRequest(validLaserEngravingBody),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).toHaveBeenCalledWith('grabado-nombre-fecha');
    expect(laserEngravingsRepository.updateById).toHaveBeenCalledWith(
      12,
      validLaserEngravingBody,
    );
  });

  it('returns conflict when a product already uses the public slug', async () => {
    const conflict = new LaserEngravingConflictError(
      'Ya existe una joya publicada con ese slug',
      'PUBLIC_SLUG_ALREADY_EXISTS',
      [
        {
          path: 'slug',
          message: 'Ya existe una joya publicada con ese slug',
        },
      ],
    );
    vi.mocked(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).mockRejectedValue(conflict);

    const response = await PUT(
      createPutRequest(validLaserEngravingBody),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: conflict.message,
      details: conflict.details,
    });
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
  });
});
