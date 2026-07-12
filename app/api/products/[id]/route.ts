import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ProductConflictError } from '@/lib/errors';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import {
  conflictErrorResponse,
  getConflictError,
  internalServerErrorResponse,
  notFoundResponse,
  validationErrorResponse,
} from '../../route-response.helpers';
import { productIdParamsSchema, updateProductBodySchema } from '../schemas';

interface ProductRouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function getValidatedProductId(
  context: ProductRouteContext,
): Promise<number> {
  const params = await context.params;

  return productIdParamsSchema.parse(params).id;
}

export async function GET(_request: Request, context: ProductRouteContext) {
  try {
    const id = await getValidatedProductId(context);
    const product = await productsRepository.findById(id);

    if (!product) {
      return notFoundResponse('Product not found');
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return internalServerErrorResponse('Failed to fetch product', error);
  }
}

export async function PUT(request: Request, context: ProductRouteContext) {
  try {
    const id = await getValidatedProductId(context);
    const body = updateProductBodySchema.parse(await request.json());
    const product = await productsRepository.updateById(id, body);

    if (!product) {
      return notFoundResponse('Product not found');
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    const conflictError = getConflictError(error, [ProductConflictError]);

    if (conflictError) {
      return conflictErrorResponse(conflictError);
    }

    return internalServerErrorResponse('Failed to update product', error);
  }
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  try {
    const id = await getValidatedProductId(context);
    const deleted = await productsRepository.deleteById(id);

    if (!deleted) {
      return notFoundResponse('Product not found');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return internalServerErrorResponse('Failed to delete product', error);
  }
}
