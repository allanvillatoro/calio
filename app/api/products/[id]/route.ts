import { NextResponse } from 'next/server';
import { productsRepository } from '@/lib/repositories/drizzle-products-repository';
import { ZodError } from 'zod';
import {
  formatZodError,
  productIdParamsSchema,
  updateProductBodySchema,
} from '../schemas';

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

export async function GET(
  _request: Request,
  context: ProductRouteContext,
) {
  try {
    const id = await getValidatedProductId(context);
    const product = await productsRepository.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), { status: 400 });
    }

    console.error('Failed to fetch product', error);

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: ProductRouteContext,
) {
  try {
    const id = await getValidatedProductId(context);
    const body = updateProductBodySchema.parse(await request.json());
    const product = await productsRepository.updateById(id, body);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : 'Failed to update product';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: ProductRouteContext,
) {
  try {
    const id = await getValidatedProductId(context);
    const deleted = await productsRepository.deleteById(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), { status: 400 });
    }

    console.error('Failed to delete product', error);

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}
