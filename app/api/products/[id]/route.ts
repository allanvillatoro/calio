import { NextResponse } from 'next/server';
import { productsRepository } from '@/lib/repositories/drizzle-products-repository';
import type { ProductChanges } from '@/lib/repositories/products-repository.interface';

interface ProductRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function parseProductId(value: string): number | null {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function GET(
  _request: Request,
  context: ProductRouteContext,
) {
  const { id: rawId } = await context.params;
  const id = parseProductId(rawId);

  if (id === null) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const product = await productsRepository.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
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
  const { id: rawId } = await context.params;
  const id = parseProductId(rawId);

  if (id === null) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as ProductChanges;
    const product = await productsRepository.updateById(id, body);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update product';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: ProductRouteContext,
) {
  const { id: rawId } = await context.params;
  const id = parseProductId(rawId);

  if (id === null) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    const deleted = await productsRepository.deleteById(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product', error);

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}
