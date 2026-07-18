import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { ProductConflictError } from '@/lib/errors';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import {
  conflictErrorResponse,
  getConflictError,
  internalServerErrorResponse,
  validationErrorResponse,
} from '../route-response.helpers';
import { createProductBodySchema, productsQuerySchema } from './schemas';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const authenticatedUser = await getAuthenticatedUserFromCookies();
    const parsedQuery = productsQuerySchema.parse({
      category: searchParams
        .getAll('category')
        .flatMap((category) => category.split(','))
        .map((category) => category.trim())
        .filter(Boolean),
      query: searchParams.get('query') ?? undefined,
      instoresps: searchParams.get('instoresps') ?? undefined,
      instorepro: searchParams.get('instorepro') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    const products = await productsRepository.findAll({
      categories: parsedQuery.category,
      query: parsedQuery.query,
      inStoreSps: parsedQuery.instoresps,
      inStorePro: parsedQuery.instorepro,
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      includeOutOfStock: Boolean(authenticatedUser),
    });

    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return internalServerErrorResponse('Failed to fetch products', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createProductBodySchema.parse(await request.json());
    const product = await productsRepository.save(body);

    return NextResponse.json(product, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    const conflictError = getConflictError(error, [ProductConflictError]);

    if (conflictError) {
      return conflictErrorResponse(conflictError);
    }

    return internalServerErrorResponse('Failed to create product', error);
  }
}
