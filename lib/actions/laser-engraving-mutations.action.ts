'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import {
  createLaserEngravingBodySchema,
  laserEngravingIdParamsSchema,
  updateLaserEngravingBodySchema,
} from '@/app/api/laser-engravings/schemas';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
import { LaserEngravingConflictError } from '@/lib/errors';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import type { LaserEngravingChanges } from '@/lib/repositories/laser-engravings/laser-engravings-repository.interface';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';
import { formatZodError } from '@/lib/zod';

interface LaserEngravingMutationErrorDetail {
  path: string;
  message: string;
}

export interface LaserEngravingMutationResult {
  success: boolean;
  laserEngraving?: ILaserEngraving;
  error?: string;
  details?: LaserEngravingMutationErrorDetail[];
}

export interface LaserEngravingDeleteResult {
  success: boolean;
  error?: string;
}

type LaserEngravingMutationInput = LaserEngravingChanges & { files?: File[] };

function revalidateLaserEngravingPaths(laserEngraving: ILaserEngraving) {
  revalidatePath('/grabados');
  revalidatePath(`/productos/${laserEngraving.slug}`);
}

async function ensureAuthenticatedUser() {
  const authenticatedUser = await getAuthenticatedUserFromCookies();

  if (!authenticatedUser) {
    return {
      success: false as const,
      error: 'Unauthorized',
    };
  }

  return {
    success: true as const,
    user: authenticatedUser,
  };
}

function formatLaserEngravingMutationError(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ZodError) {
    const formattedError = formatZodError(error);

    return {
      success: false as const,
      error: formattedError.error,
      details: formattedError.details,
    };
  }

  if (error instanceof LaserEngravingConflictError) {
    return {
      success: false as const,
      error: error.message,
      details: error.details,
    };
  }

  return {
    success: false as const,
    error: fallbackMessage,
  };
}

async function mergeUploadedImages(input: LaserEngravingMutationInput) {
  const { files = [], ...laserEngravingData } = input;

  if (files.length > 0) {
    const uploadedImages = await uploadProductImagesAction(files);
    laserEngravingData.images = [
      ...(laserEngravingData.images ?? []),
      ...uploadedImages,
    ];
  }

  return laserEngravingData;
}

export async function createLaserEngravingAction(
  input: LaserEngravingMutationInput,
): Promise<LaserEngravingMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const laserEngravingData = await mergeUploadedImages(input);
    const parsedBody = createLaserEngravingBodySchema.parse(laserEngravingData);
    await assertLaserEngravingSlugDoesNotConflictWithProduct(parsedBody.slug);
    const laserEngraving = await laserEngravingsRepository.save(parsedBody);

    revalidateLaserEngravingPaths(laserEngraving);

    return {
      success: true,
      laserEngraving,
    };
  } catch (error) {
    const result = formatLaserEngravingMutationError(
      error,
      'Failed to create laser engraving',
    );

    if (result.error === 'Failed to create laser engraving') {
      console.error(
        'Failed to create laser engraving from server action',
        error,
      );
    }

    return result;
  }
}

export async function updateLaserEngravingAction(
  id: number,
  input: LaserEngravingMutationInput,
): Promise<LaserEngravingMutationResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const validatedId = laserEngravingIdParamsSchema.parse({ id }).id;
    const laserEngravingData = await mergeUploadedImages(input);
    const parsedBody = updateLaserEngravingBodySchema.parse(laserEngravingData);
    await assertLaserEngravingSlugDoesNotConflictWithProduct(parsedBody.slug);
    const laserEngraving = await laserEngravingsRepository.updateById(
      validatedId,
      parsedBody,
    );

    if (!laserEngraving) {
      return {
        success: false,
        error: 'Laser engraving not found',
      };
    }

    revalidateLaserEngravingPaths(laserEngraving);

    return {
      success: true,
      laserEngraving,
    };
  } catch (error) {
    const result = formatLaserEngravingMutationError(
      error,
      'Failed to update laser engraving',
    );

    if (result.error === 'Failed to update laser engraving') {
      console.error(
        'Failed to update laser engraving from server action',
        error,
      );
    }

    return result;
  }
}

export async function deleteLaserEngravingAction(
  id: number,
): Promise<LaserEngravingDeleteResult> {
  try {
    const authResult = await ensureAuthenticatedUser();

    if (!authResult.success) {
      return authResult;
    }

    const validatedId = laserEngravingIdParamsSchema.parse({ id }).id;
    const laserEngraving =
      await laserEngravingsRepository.findById(validatedId);

    if (!laserEngraving) {
      return {
        success: false,
        error: 'Laser engraving not found',
      };
    }

    const deleted = await laserEngravingsRepository.deleteById(validatedId);

    if (!deleted) {
      return {
        success: false,
        error: 'Laser engraving not found',
      };
    }

    revalidateLaserEngravingPaths(laserEngraving);

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedError = formatZodError(error);

      return {
        success: false,
        error: formattedError.error,
      };
    }

    console.error('Failed to delete laser engraving from server action', error);

    return {
      success: false,
      error: 'Failed to delete laser engraving',
    };
  }
}
