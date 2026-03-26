import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { formatZodError } from '@/lib/zod';
import { ZodError } from 'zod';
import { productIdParamsSchema, updateProductBodySchema } from '../schemas';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';

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
      return NextResponse.json(
        { error: 'Product not found' },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to fetch product', error);

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PUT(request: Request, context: ProductRouteContext) {
  try {
    const id = await getValidatedProductId(context);
    const body = updateProductBodySchema.parse(await request.json());
    const product = await productsRepository.updateById(id, body);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to update product', error);

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  try {
    const id = await getValidatedProductId(context);
    const deleted = await productsRepository.deleteById(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to delete product', error);

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
