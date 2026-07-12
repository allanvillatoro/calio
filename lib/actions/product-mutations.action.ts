'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import {
  createProductBodySchema,
  productIdParamsSchema,
  updateProductBodySchema,
} from '@/app/api/products/schemas';
import { ensureAuthenticatedUser } from '@/lib/actions/authenticated-action.helpers';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
import { ProductConflictError } from '@/lib/errors';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import { formatZodError } from '@/lib/zod';
import type { Product } from '../types';

interface ProductMutationErrorDetail {
  path: string;
  message: string;
}

export interface ProductMutationResult {
  success: boolean;
  product?: IProduct;
  error?: string;
  details?: ProductMutationErrorDetail[];
}

export interface ProductDeleteResult {
  success: boolean;
  error?: string;
}

type ProductMutationInput = Partial<Product> & { files?: File[] };

function revalidateProductPaths(productId: number) {
  revalidatePath('/catalogo');
  revalidatePath(`/productos/${productId}`);
}

function formatProductMutationError(error: unknown, fallbackMessage: string) {
  if (error instanceof ZodError) {
    const formattedError = formatZodError(error);

    return {
      success: false as const,
      error: formattedError.error,
      details: formattedError.details,
    };
  }

  if (error instanceof ProductConflictError) {
    return {
      success: false as const,
      error: error.message,
      details: error.details,
    };
  }

  return {
    success: false as const,
    error: fallbackMessage,
  };
}

async function mergeUploadedImages(input: ProductMutationInput) {
  const { files = [], ...productData } = input;

  if (files.length > 0) {
    const uploadedImages = await uploadProductImagesAction(files);
    productData.images = [...(productData.images ?? []), ...uploadedImages];
  }

  return productData;
}

export async function createProductAction(
  input: ProductMutationInput,
): Promise<ProductMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const productData = await mergeUploadedImages(input);
    const parsedBody = createProductBodySchema.parse(productData);
    const product = await productsRepository.save(parsedBody);

    revalidateProductPaths(product.id);

    return {
      success: true,
      product,
    };
  } catch (error) {
    const result = formatProductMutationError(
      error,
      'Failed to create product',
    );

    if (result.error === 'Failed to create product') {
      console.error('Failed to create product from server action', error);
    }

    return result;
  }
}

export async function updateProductAction(
  id: number,
  input: ProductMutationInput,
): Promise<ProductMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const validatedId = productIdParamsSchema.parse({ id }).id;
    const productData = await mergeUploadedImages(input);
    const parsedBody = updateProductBodySchema.parse(productData);
    const product = await productsRepository.updateById(
      validatedId,
      parsedBody,
    );

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    revalidateProductPaths(product.id);

    return {
      success: true,
      product,
    };
  } catch (error) {
    const result = formatProductMutationError(
      error,
      'Failed to update product',
    );

    if (result.error === 'Failed to update product') {
      console.error('Failed to update product from server action', error);
    }

    return result;
  }
}

export async function deleteProductAction(
  id: number,
): Promise<ProductDeleteResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const validatedId = productIdParamsSchema.parse({ id }).id;
    const product = await productsRepository.findById(validatedId);

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const deleted = await productsRepository.deleteById(validatedId);

    if (!deleted) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    revalidateProductPaths(validatedId);

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);

      return {
        success: false,
        error: formattedError.error,
      };
    }

    console.error('Failed to delete product from server action', error);

    return {
      success: false,
      error: 'Failed to delete product',
    };
  }
}
