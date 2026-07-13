import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LaserEngravingConflictError } from '@/lib/errors';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';
import { DELETE, GET, PUT } from './route';

vi.mock(
  '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository',
  () => ({
    laserEngravingsRepository: {
      deleteById: vi.fn(),
      findById: vi.fn(),
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

const laserEngravingJson = {
  ...laserEngraving,
  createdAt: laserEngraving.createdAt.toISOString(),
  updatedAt: laserEngraving.updatedAt.toISOString(),
};

function createGetRequest() {
  return new Request('http://localhost/api/laser-engravings/12');
}

function createPutRequest(body: unknown) {
  return new Request('http://localhost/api/laser-engravings/12', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function createDeleteRequest() {
  return new Request('http://localhost/api/laser-engravings/12', {
    method: 'DELETE',
  });
}

function createContext(id = '12') {
  return {
    params: Promise.resolve({ id }),
  };
}

describe('GET /api/laser-engravings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a laser engraving by id', async () => {
    vi.mocked(laserEngravingsRepository.findById).mockResolvedValue(
      laserEngraving,
    );

    const response = await GET(createGetRequest(), createContext());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual(laserEngravingJson);
    expect(laserEngravingsRepository.findById).toHaveBeenCalledWith(12);
  });

  it('returns not found when the laser engraving does not exist', async () => {
    vi.mocked(laserEngravingsRepository.findById).mockResolvedValue(null);

    const response = await GET(createGetRequest(), createContext());

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Laser engraving not found',
    });
  });

  it('returns bad request for invalid route params', async () => {
    const response = await GET(createGetRequest(), createContext('invalid'));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.findById).not.toHaveBeenCalled();
  });

  it('returns internal server error when the repository fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.mocked(laserEngravingsRepository.findById).mockRejectedValue(
      new Error('database failed'),
    );

    const response = await GET(createGetRequest(), createContext());

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch laser engraving',
    });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});

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

  it('returns not found when the laser engraving does not exist', async () => {
    vi.mocked(laserEngravingsRepository.updateById).mockResolvedValue(null);

    const response = await PUT(
      createPutRequest(validLaserEngravingBody),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Laser engraving not found',
    });
  });

  it('returns bad request for invalid route params', async () => {
    const response = await PUT(
      createPutRequest(validLaserEngravingBody),
      createContext('invalid'),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
  });

  it('returns bad request for invalid request bodies', async () => {
    const response = await PUT(
      createPutRequest({
        ...validLaserEngravingBody,
        images: [],
      }),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
  });

  it('returns bad request for numeric-only slugs', async () => {
    const response = await PUT(
      createPutRequest({
        ...validLaserEngravingBody,
        slug: '123',
      }),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          path: 'slug',
          message: 'Slug cannot contain only numbers',
        }),
      ]),
    });
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
    expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).not.toHaveBeenCalled();
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

  it('returns conflict when the repository rejects a duplicate slug', async () => {
    const conflict = new LaserEngravingConflictError(
      'Ya existe un grabado laser con ese slug',
      'LASER_ENGRAVING_SLUG_ALREADY_EXISTS',
      [
        {
          path: 'slug',
          message: 'Ya existe un grabado laser con ese slug',
        },
      ],
    );
    vi.mocked(laserEngravingsRepository.updateById).mockRejectedValue(conflict);

    const response = await PUT(
      createPutRequest(validLaserEngravingBody),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: conflict.message,
      details: conflict.details,
    });
  });

  it('returns internal server error when the repository fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.mocked(laserEngravingsRepository.updateById).mockRejectedValue(
      new Error('database failed'),
    );

    const response = await PUT(
      createPutRequest(validLaserEngravingBody),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to update laser engraving',
    });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});

describe('DELETE /api/laser-engravings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a laser engraving by id', async () => {
    vi.mocked(laserEngravingsRepository.deleteById).mockResolvedValue(true);

    const response = await DELETE(createDeleteRequest(), createContext());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({
      success: true,
    });
    expect(laserEngravingsRepository.deleteById).toHaveBeenCalledWith(12);
  });

  it('returns not found when the laser engraving does not exist', async () => {
    vi.mocked(laserEngravingsRepository.deleteById).mockResolvedValue(false);

    const response = await DELETE(createDeleteRequest(), createContext());

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Laser engraving not found',
    });
  });

  it('returns bad request for invalid route params', async () => {
    const response = await DELETE(
      createDeleteRequest(),
      createContext('invalid'),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('returns internal server error when the repository fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.mocked(laserEngravingsRepository.deleteById).mockRejectedValue(
      new Error('database failed'),
    );

    const response = await DELETE(createDeleteRequest(), createContext());

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to delete laser engraving',
    });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
