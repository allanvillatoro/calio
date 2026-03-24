import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { productsRepository } from '@/lib/repositories/drizzle-products-repository';
import { ZodError } from 'zod';
import {
  createProductBodySchema,
  formatZodError,
  productsQuerySchema,
} from './schemas';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const parsedQuery = productsQuerySchema.parse({
      category: searchParams
        .getAll('category')
        .flatMap((category) => category.split(','))
        .map((category) => category.trim())
        .filter(Boolean),
      inStore: searchParams.get('inStore') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    const products = await productsRepository.findAll({
      categories: parsedQuery.category,
      inStore: parsedQuery.inStore,
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to fetch products', error);

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = createProductBodySchema.parse(await request.json());
    const product = await productsRepository.save(body);

    return NextResponse.json(product, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to create product', error);

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
