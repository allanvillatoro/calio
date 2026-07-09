import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { LaserEngravingConflictError } from '@/lib/errors';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { GET, POST } from './route';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

vi.mock(
  '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository',
  () => ({
    laserEngravingsRepository: {
      findAll: vi.fn(),
      save: vi.fn(),
    },
  }),
);

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

const findAllResult = {
  data: [laserEngraving],
  paging: {
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const findAllJsonResult = {
  ...findAllResult,
  data: [
    {
      ...laserEngraving,
      createdAt: laserEngraving.createdAt.toISOString(),
      updatedAt: laserEngraving.updatedAt.toISOString(),
    },
  ],
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

function createGetRequest(queryString = '') {
  return new Request(`http://localhost/api/laser-engravings${queryString}`);
}

function createPostRequest(body: unknown) {
  return new Request('http://localhost/api/laser-engravings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('GET /api/laser-engravings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(laserEngravingsRepository.findAll).mockResolvedValue(
      findAllResult,
    );
  });

  it('fetches public laser engravings without including out-of-stock items', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const response = await GET(createGetRequest());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual(findAllJsonResult);
    expect(laserEngravingsRepository.findAll).toHaveBeenCalledWith({
      query: undefined,
      page: 1,
      limit: 20,
      includeOutOfStock: false,
    });
  });

  it('includes out-of-stock laser engravings for authenticated users', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.test',
    });

    await GET(createGetRequest());

    expect(laserEngravingsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        includeOutOfStock: true,
      }),
    );
  });

  it('parses query params before passing filters to the repository', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    await GET(createGetRequest('?query=fecha&page=3&limit=12'));

    expect(laserEngravingsRepository.findAll).toHaveBeenCalledWith({
      query: 'fecha',
      page: 3,
      limit: 12,
      includeOutOfStock: false,
    });
  });

  it('returns bad request for invalid query params', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const response = await GET(createGetRequest('?limit=101'));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.findAll).not.toHaveBeenCalled();
  });
});

describe('POST /api/laser-engravings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a laser engraving from a valid request body', async () => {
    vi.mocked(laserEngravingsRepository.save).mockResolvedValue(
      laserEngraving,
    );

    const response = await POST(createPostRequest(validLaserEngravingBody));

    expect(response.status).toBe(StatusCodes.CREATED);
    await expect(response.json()).resolves.toEqual({
      ...laserEngraving,
      createdAt: laserEngraving.createdAt.toISOString(),
      updatedAt: laserEngraving.updatedAt.toISOString(),
    });
    expect(laserEngravingsRepository.save).toHaveBeenCalledWith(
      validLaserEngravingBody,
    );
  });

  it('returns bad request for invalid request bodies', async () => {
    const response = await POST(
      createPostRequest({
        ...validLaserEngravingBody,
        images: [],
      }),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.save).not.toHaveBeenCalled();
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
    vi.mocked(laserEngravingsRepository.save).mockRejectedValue(conflict);

    const response = await POST(createPostRequest(validLaserEngravingBody));

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: conflict.message,
      details: conflict.details,
    });
  });
});
