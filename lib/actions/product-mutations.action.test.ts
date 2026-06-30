import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { ProductConflictError } from '@/lib/errors';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import type { Product } from '@/lib/types';
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from './product-mutations.action';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

vi.mock('@/lib/actions/cloudinary-upload.action', () => ({
  uploadProductImagesAction: vi.fn(),
}));

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    save: vi.fn(),
    updateById: vi.fn(),
    findById: vi.fn(),
    deleteById: vi.fn(),
  },
}));

const authenticatedUser = {
  id: 'user-1',
  email: 'admin@example.test',
};

const validProductInput = {
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  quantity: 5,
  inStore: true,
  category: 'collares',
  images: ['collar-perla.jpg'],
} satisfies Partial<Product>;

const persistedProduct: IProduct = {
  id: 12,
  name: validProductInput.name,
  description: validProductInput.description,
  price: validProductInput.price,
  discount: validProductInput.discount,
  priceWithDiscount: validProductInput.price,
  quantity: validProductInput.quantity,
  images: validProductInput.images,
  category: validProductInput.category,
  inStore: validProductInput.inStore,
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
};

function authenticate() {
  vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(
    authenticatedUser,
  );
}

function createImageFile(name: string) {
  return new File(['image'], name, {
    type: 'image/jpeg',
  });
}

describe('createProductAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const result = await createProductAction(validProductInput);

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(productsRepository.save).not.toHaveBeenCalled();
    expect(uploadProductImagesAction).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('uploads new files, merges image names, saves the product, and revalidates product paths', async () => {
    authenticate();
    const files = [createImageFile('new-image.jpg')];
    vi.mocked(uploadProductImagesAction).mockResolvedValue(['uploaded.jpg']);
    vi.mocked(productsRepository.save).mockResolvedValue(persistedProduct);

    const result = await createProductAction({
      ...validProductInput,
      files,
    });

    expect(uploadProductImagesAction).toHaveBeenCalledWith(files);
    expect(productsRepository.save).toHaveBeenCalledWith({
      ...validProductInput,
      images: ['collar-perla.jpg', 'uploaded.jpg'],
    });
    expect(revalidatePath).toHaveBeenCalledWith('/catalogo');
    expect(revalidatePath).toHaveBeenCalledWith('/productos/12');
    expect(result).toEqual({
      success: true,
      product: persistedProduct,
    });
  });

  it('returns validation details when product input is invalid', async () => {
    authenticate();

    const result = await createProductAction({
      ...validProductInput,
      images: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'images',
        }),
      ]),
    );
    expect(productsRepository.save).not.toHaveBeenCalled();
  });

  it('returns conflict details when the repository rejects a duplicate product name', async () => {
    authenticate();
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

    const result = await createProductAction(validProductInput);

    expect(result).toEqual({
      success: false,
      error: 'Ya existe un producto con ese nombre',
      details: conflict.details,
    });
  });
});

describe('updateProductAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const result = await updateProductAction(12, validProductInput);

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(productsRepository.updateById).not.toHaveBeenCalled();
  });

  it('validates the id, uploads new files, updates the product, and revalidates returned product paths', async () => {
    authenticate();
    const files = [createImageFile('updated-image.jpg')];
    const updatedProduct = {
      ...persistedProduct,
      id: 24,
      images: ['collar-perla.jpg', 'updated-upload.jpg'],
    };
    vi.mocked(uploadProductImagesAction).mockResolvedValue([
      'updated-upload.jpg',
    ]);
    vi.mocked(productsRepository.updateById).mockResolvedValue(updatedProduct);

    const result = await updateProductAction(12, {
      ...validProductInput,
      files,
    });

    expect(uploadProductImagesAction).toHaveBeenCalledWith(files);
    expect(productsRepository.updateById).toHaveBeenCalledWith(12, {
      ...validProductInput,
      images: ['collar-perla.jpg', 'updated-upload.jpg'],
    });
    expect(revalidatePath).toHaveBeenCalledWith('/catalogo');
    expect(revalidatePath).toHaveBeenCalledWith('/productos/24');
    expect(result).toEqual({
      success: true,
      product: updatedProduct,
    });
  });

  it('returns product not found when the repository cannot update the product', async () => {
    authenticate();
    vi.mocked(productsRepository.updateById).mockResolvedValue(null);

    const result = await updateProductAction(12, validProductInput);

    expect(result).toEqual({
      success: false,
      error: 'Product not found',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns validation details when the product id is invalid', async () => {
    authenticate();

    const result = await updateProductAction(0, validProductInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(productsRepository.updateById).not.toHaveBeenCalled();
  });
});

describe('deleteProductAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const result = await deleteProductAction(12);

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(productsRepository.findById).not.toHaveBeenCalled();
    expect(productsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('deletes an existing product and revalidates product paths', async () => {
    authenticate();
    vi.mocked(productsRepository.findById).mockResolvedValue(persistedProduct);
    vi.mocked(productsRepository.deleteById).mockResolvedValue(true);

    const result = await deleteProductAction(12);

    expect(productsRepository.findById).toHaveBeenCalledWith(12);
    expect(productsRepository.deleteById).toHaveBeenCalledWith(12);
    expect(revalidatePath).toHaveBeenCalledWith('/catalogo');
    expect(revalidatePath).toHaveBeenCalledWith('/productos/12');
    expect(result).toEqual({
      success: true,
    });
  });

  it('returns product not found when the product does not exist', async () => {
    authenticate();
    vi.mocked(productsRepository.findById).mockResolvedValue(null);

    const result = await deleteProductAction(12);

    expect(result).toEqual({
      success: false,
      error: 'Product not found',
    });
    expect(productsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('returns product not found when deletion reports no deleted row', async () => {
    authenticate();
    vi.mocked(productsRepository.findById).mockResolvedValue(persistedProduct);
    vi.mocked(productsRepository.deleteById).mockResolvedValue(false);

    const result = await deleteProductAction(12);

    expect(result).toEqual({
      success: false,
      error: 'Product not found',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
