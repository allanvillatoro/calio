import { NextResponse } from 'next/server';
import { productsRepository } from '@/lib/repositories/drizzle-products-repository';
import type { ProductChanges } from '@/lib/repositories/products-repository.interface';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const products = await productsRepository.findAll(searchParams);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products', error);

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductChanges;
    const product = await productsRepository.save(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create product';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
