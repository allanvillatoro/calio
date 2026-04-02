'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import {
  createProductBodySchema,
  productIdParamsSchema,
  updateProductBodySchema,
} from '@/app/api/products/schemas';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import { formatZodError } from '@/lib/zod';

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

function revalidateProductPaths(productId: number) {
  revalidatePath('/catalogo');
  revalidatePath(`/productos/${productId}`);
}

async function ensureAuthenticatedUser() {
  const authenticatedUser = await getAuthenticatedUserFromCookies();

  if (!authenticatedUser) {
    return {
      success: false as const,
      error: 'Unauthorized',
    };
  }

  return {
    success: true as const,
    user: authenticatedUser,
  };
}

export async function createProductAction(
  input: unknown,
): Promise<ProductMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const parsedBody = createProductBodySchema.parse(input);
    const product = await productsRepository.save(parsedBody);

    revalidateProductPaths(product.id);

    return {
      success: true,
      product,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);

      return {
        success: false,
        error: formattedError.error,
        details: formattedError.details,
      };
    }

    console.error('Failed to create product from server action', error);

    return {
      success: false,
      error: 'Failed to create product',
    };
  }
}

export async function updateProductAction(
  id: number,
  input: unknown,
): Promise<ProductMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const validatedId = productIdParamsSchema.parse({ id }).id;
    const parsedBody = updateProductBodySchema.parse(input);
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
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);

      return {
        success: false,
        error: formattedError.error,
        details: formattedError.details,
      };
    }

    console.error('Failed to update product from server action', error);

    return {
      success: false,
      error: 'Failed to update product',
    };
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
