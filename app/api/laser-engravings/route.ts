import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { LaserEngravingConflictError } from '@/lib/errors';
import { formatZodError } from '@/lib/zod';
import {
  createLaserEngravingBodySchema,
  laserEngravingsQuerySchema,
} from './schemas';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';

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
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to fetch laser engravings', error);

    return NextResponse.json(
      { error: 'Failed to fetch laser engravings' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
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
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    if (error instanceof LaserEngravingConflictError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        {
          status: StatusCodes.CONFLICT,
        },
      );
    }

    console.error('Failed to create laser engraving', error);

    return NextResponse.json(
      { error: 'Failed to create laser engraving' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
