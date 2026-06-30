import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { ProductConflictError } from '@/lib/errors';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import { GET, POST } from './route';

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    findAll: vi.fn(),
    save: vi.fn(),
  },
}));

const product: IProduct = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  priceWithDiscount: 250,
  quantity: 5,
  images: ['collar-perla.jpg'],
  category: 'collares',
  inStore: true,
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
};

const findAllResult = {
  data: [product],
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
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    },
  ],
};

const validProductBody = {
  name: product.name,
  description: product.description,
  price: product.price,
  discount: product.discount,
  quantity: product.quantity,
  images: product.images,
  category: product.category,
  inStore: product.inStore,
};

function createGetRequest(queryString = '') {
  return new Request(`http://localhost/api/products${queryString}`);
}

function createPostRequest(body: unknown) {
  return new Request('http://localhost/api/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsRepository.findAll).mockResolvedValue(findAllResult);
  });

  it('fetches public products without including out-of-stock products', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const response = await GET(createGetRequest());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual(findAllJsonResult);
    expect(productsRepository.findAll).toHaveBeenCalledWith({
      categories: [],
      query: undefined,
      inStore: undefined,
      page: 1,
      limit: 20,
      includeOutOfStock: false,
    });
  });

  it('includes out-of-stock products for authenticated users', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.test',
    });

    await GET(createGetRequest());

    expect(productsRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        includeOutOfStock: true,
      }),
    );
  });

  it('parses query params before passing filters to the repository', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    await GET(
      createGetRequest(
        '?category=anillos,collares&category=sets&query=oro&instore=false&page=3&limit=12',
      ),
    );

    expect(productsRepository.findAll).toHaveBeenCalledWith({
      categories: ['anillos', 'collares', 'sets'],
      query: 'oro',
      inStore: false,
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
    expect(productsRepository.findAll).not.toHaveBeenCalled();
  });

  it('returns internal server error when fetching products fails unexpectedly', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);
    vi.mocked(productsRepository.findAll).mockRejectedValue(
      new Error('DB down'),
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await GET(createGetRequest());

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch products',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to fetch products',
      expect.any(Error),
    );

    consoleError.mockRestore();
  });
});

describe('POST /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a product from a valid request body', async () => {
    vi.mocked(productsRepository.save).mockResolvedValue(product);

    const response = await POST(createPostRequest(validProductBody));

    expect(response.status).toBe(StatusCodes.CREATED);
    await expect(response.json()).resolves.toEqual({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
    expect(productsRepository.save).toHaveBeenCalledWith(validProductBody);
  });

  it('returns bad request for invalid request bodies', async () => {
    const response = await POST(
      createPostRequest({
        ...validProductBody,
        images: [],
      }),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(productsRepository.save).not.toHaveBeenCalled();
  });

  it('returns conflict when the repository rejects a duplicate product name', async () => {
    const conflict = new ProductConflictError(
      'Ya existe un producto con ese nombre',
      'PRODUCT_NAME_ALREADY_EXISTS',
      [
        {
          path: 'name',
          message: 'Ya existe un producto con ese nombre',
        },
      ],
    );
    vi.mocked(productsRepository.save).mockRejectedValue(conflict);

    const response = await POST(createPostRequest(validProductBody));

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: conflict.message,
      details: conflict.details,
    });
  });

  it('returns internal server error when creating products fails unexpectedly', async () => {
    vi.mocked(productsRepository.save).mockRejectedValue(new Error('DB down'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await POST(createPostRequest(validProductBody));

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to create product',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to create product',
      expect.any(Error),
    );

    consoleError.mockRestore();
  });
});
