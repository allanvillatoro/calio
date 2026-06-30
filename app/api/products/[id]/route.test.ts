import { StatusCodes } from 'http-status-codes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductConflictError } from '@/lib/errors';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import { DELETE, GET, PUT } from './route';

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    deleteById: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
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

const productJson = {
  ...product,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
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

function createRequest(body?: unknown) {
  return new Request('http://localhost/api/products/12', {
    method: body === undefined ? 'GET' : 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function createContext(id = '12') {
  return {
    params: Promise.resolve({ id }),
  };
}

describe('GET /api/products/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a product by id', async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(product);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual(productJson);
    expect(productsRepository.findById).toHaveBeenCalledWith(12);
  });

  it('returns not found when the product does not exist', async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Product not found',
    });
  });

  it('returns bad request for invalid product ids', async () => {
    const response = await GET(createRequest(), createContext('invalid'));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(productsRepository.findById).not.toHaveBeenCalled();
  });

  it('returns internal server error when fetching a product fails unexpectedly', async () => {
    vi.mocked(productsRepository.findById).mockRejectedValue(
      new Error('DB down'),
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch product',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to fetch product',
      expect.any(Error),
    );
  });
});

describe('PUT /api/products/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates a product by id', async () => {
    vi.mocked(productsRepository.updateById).mockResolvedValue(product);

    const response = await PUT(createRequest(validProductBody), createContext());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual(productJson);
    expect(productsRepository.updateById).toHaveBeenCalledWith(
      12,
      validProductBody,
    );
  });

  it('returns not found when the product to update does not exist', async () => {
    vi.mocked(productsRepository.updateById).mockResolvedValue(null);

    const response = await PUT(createRequest(validProductBody), createContext());

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Product not found',
    });
  });

  it('returns bad request for invalid update bodies', async () => {
    const response = await PUT(
      createRequest({
        ...validProductBody,
        images: [],
      }),
      createContext(),
    );

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(productsRepository.updateById).not.toHaveBeenCalled();
  });

  it('returns conflict when updating to a duplicate product name', async () => {
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
    vi.mocked(productsRepository.updateById).mockRejectedValue(conflict);

    const response = await PUT(createRequest(validProductBody), createContext());

    expect(response.status).toBe(StatusCodes.CONFLICT);
    await expect(response.json()).resolves.toEqual({
      error: conflict.message,
      details: conflict.details,
    });
  });

  it('returns internal server error when updating fails unexpectedly', async () => {
    vi.mocked(productsRepository.updateById).mockRejectedValue(
      new Error('DB down'),
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await PUT(createRequest(validProductBody), createContext());

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to update product',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to update product',
      expect.any(Error),
    );
  });
});

describe('DELETE /api/products/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes a product by id', async () => {
    vi.mocked(productsRepository.deleteById).mockResolvedValue(true);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({
      success: true,
    });
    expect(productsRepository.deleteById).toHaveBeenCalledWith(12);
  });

  it('returns not found when the product to delete does not exist', async () => {
    vi.mocked(productsRepository.deleteById).mockResolvedValue(false);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({
      error: 'Product not found',
    });
  });

  it('returns bad request for invalid product ids', async () => {
    const response = await DELETE(createRequest(), createContext('invalid'));

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Validation failed',
    });
    expect(productsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('returns internal server error when deleting fails unexpectedly', async () => {
    vi.mocked(productsRepository.deleteById).mockRejectedValue(
      new Error('DB down'),
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to delete product',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to delete product',
      expect.any(Error),
    );
  });
});
