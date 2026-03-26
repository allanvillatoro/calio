import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { extractBearerToken, verifyAuthToken } from '@/lib/auth';
import { formatZodError } from '@/lib/zod';
import { ZodError } from 'zod';
import { createProductBodySchema, productsQuerySchema } from './schemas';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const token = extractBearerToken(request.headers.get('authorization'));
    const authenticatedUser = token ? await verifyAuthToken(token) : null;
    const parsedQuery = productsQuerySchema.parse({
      category: searchParams
        .getAll('category')
        .flatMap((category) => category.split(','))
        .map((category) => category.trim())
        .filter(Boolean),
      instore: searchParams.get('instore') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    const products = await productsRepository.findAll({
      categories: parsedQuery.category,
      inStore: parsedQuery.instore,
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      includeOutOfStock: Boolean(authenticatedUser),
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
