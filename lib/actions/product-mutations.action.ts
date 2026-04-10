'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import {
  createProductBodySchema,
  productIdParamsSchema,
  updateProductBodySchema,
} from '@/app/api/products/schemas';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
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
  input: Partial<Product> & { files?: File[] },
): Promise<ProductMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const { files = [], ...productData } = input;
    if (files.length > 0) {
      const uploadedImages = await uploadProductImagesAction(files);
      productData.images = [...(productData.images ?? []), ...uploadedImages];
    }

    const parsedBody = createProductBodySchema.parse(productData);
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
  input: Partial<Product> & { files?: File[] },
): Promise<ProductMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const validatedId = productIdParamsSchema.parse({ id }).id;

    const { files = [], ...productData } = input;
    if (files.length > 0) {
      const uploadedImages = await uploadProductImagesAction(files);
      productData.images = [...(productData.images ?? []), ...uploadedImages];
    }

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
