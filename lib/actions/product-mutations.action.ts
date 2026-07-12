'use server';

import { revalidatePath } from 'next/cache';
import {
  createProductBodySchema,
  productIdParamsSchema,
  updateProductBodySchema,
} from '@/app/api/products/schemas';
import { ensureAuthenticatedUser } from '@/lib/actions/authenticated-action.helpers';
import {
  formatMutationError,
  logUnexpectedMutationError,
  mergeUploadedImages,
  type MutationErrorDetail,
} from '@/lib/actions/mutation-action.helpers';
import { ProductConflictError } from '@/lib/errors';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import type { Product } from '../types';

export interface ProductMutationResult {
  success: boolean;
  product?: IProduct;
  error?: string;
  details?: MutationErrorDetail[];
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
  return formatMutationError(error, fallbackMessage, [ProductConflictError]);
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

    logUnexpectedMutationError(
      result,
      error,
      'Failed to create product',
      'Failed to create product from server action',
    );

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

    logUnexpectedMutationError(
      result,
      error,
      'Failed to update product',
      'Failed to update product from server action',
    );

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
    const result = formatProductMutationError(
      error,
      'Failed to delete product',
    );

    logUnexpectedMutationError(
      result,
      error,
      'Failed to delete product',
      'Failed to delete product from server action',
    );

    return {
      success: false,
      error: result.error,
    };
  }
}
