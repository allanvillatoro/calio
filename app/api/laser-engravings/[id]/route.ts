import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { LaserEngravingConflictError } from '@/lib/errors';
import {
  laserEngravingIdParamsSchema,
  updateLaserEngravingBodySchema,
} from '../schemas';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';
import {
  conflictErrorResponse,
  getConflictError,
  internalServerErrorResponse,
  notFoundResponse,
  validationErrorResponse,
} from '../../route-response.helpers';

interface LaserEngravingRouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function getValidatedLaserEngravingId(
  context: LaserEngravingRouteContext,
): Promise<number> {
  const params = await context.params;

  return laserEngravingIdParamsSchema.parse(params).id;
}

export async function GET(
  _request: Request,
  context: LaserEngravingRouteContext,
) {
  try {
    const id = await getValidatedLaserEngravingId(context);
    const laserEngraving = await laserEngravingsRepository.findById(id);

    if (!laserEngraving) {
      return notFoundResponse('Laser engraving not found');
    }

    return NextResponse.json(laserEngraving);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return internalServerErrorResponse(
      'Failed to fetch laser engraving',
      error,
    );
  }
}

export async function PUT(
  request: Request,
  context: LaserEngravingRouteContext,
) {
  try {
    const id = await getValidatedLaserEngravingId(context);
    const body = updateLaserEngravingBodySchema.parse(await request.json());
    await assertLaserEngravingSlugDoesNotConflictWithProduct(body.slug);
    const laserEngraving = await laserEngravingsRepository.updateById(id, body);

    if (!laserEngraving) {
      return notFoundResponse('Laser engraving not found');
    }

    return NextResponse.json(laserEngraving);
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
      'Failed to update laser engraving',
      error,
    );
  }
}

export async function DELETE(
  _request: Request,
  context: LaserEngravingRouteContext,
) {
  try {
    const id = await getValidatedLaserEngravingId(context);
    const deleted = await laserEngravingsRepository.deleteById(id);

    if (!deleted) {
      return notFoundResponse('Laser engraving not found');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    return internalServerErrorResponse(
      'Failed to delete laser engraving',
      error,
    );
  }
}
