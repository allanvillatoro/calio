import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { LaserEngravingConflictError } from '@/lib/errors';
import {
  createLaserEngravingBodySchema,
  laserEngravingsQuerySchema,
} from './schemas';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';
import {
  conflictErrorResponse,
  getConflictError,
  internalServerErrorResponse,
  validationErrorResponse,
} from '../route-response.helpers';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const authenticatedUser = await getAuthenticatedUserFromCookies();
    const parsedQuery = laserEngravingsQuerySchema.parse({
      query: searchParams.get('query') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    const laserEngravings = await laserEngravingsRepository.findAll({
      query: parsedQuery.query,
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      includeOutOfStock: Boolean(authenticatedUser),
    });

    return NextResponse.json(laserEngravings);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return internalServerErrorResponse(
      'Failed to fetch laser engravings',
      error,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = createLaserEngravingBodySchema.parse(await request.json());
    await assertLaserEngravingSlugDoesNotConflictWithProduct(body.slug);
    const laserEngraving = await laserEngravingsRepository.save(body);

    return NextResponse.json(laserEngraving, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    const conflictError = getConflictError(error, [
      LaserEngravingConflictError,
    ]);

    if (conflictError) {
      return conflictErrorResponse(conflictError);
    }

    return internalServerErrorResponse(
      'Failed to create laser engraving',
      error,
    );
  }
}
