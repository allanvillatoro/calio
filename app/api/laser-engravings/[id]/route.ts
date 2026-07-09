import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { LaserEngravingConflictError } from '@/lib/errors';
import { formatZodError } from '@/lib/zod';
import {
  laserEngravingIdParamsSchema,
  updateLaserEngravingBodySchema,
} from '../schemas';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';

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
      return NextResponse.json(
        { error: 'Laser engraving not found' },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    return NextResponse.json(laserEngraving);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(formatZodError(error), {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    console.error('Failed to fetch laser engraving', error);

    return NextResponse.json(
      { error: 'Failed to fetch laser engraving' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
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
    const laserEngraving = await laserEngravingsRepository.updateById(id, body);

    if (!laserEngraving) {
      return NextResponse.json(
        { error: 'Laser engraving not found' },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    return NextResponse.json(laserEngraving);
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

    console.error('Failed to update laser engraving', error);

    return NextResponse.json(
      { error: 'Failed to update laser engraving' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
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
      return NextResponse.json(
        { error: 'Laser engraving not found' },
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

    console.error('Failed to delete laser engraving', error);

    return NextResponse.json(
      { error: 'Failed to delete laser engraving' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
