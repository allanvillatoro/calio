'use server';

import { revalidatePath } from 'next/cache';
import {
  createLaserEngravingBodySchema,
  laserEngravingIdParamsSchema,
  updateLaserEngravingBodySchema,
} from '@/app/api/laser-engravings/schemas';
import { ensureAuthenticatedUser } from '@/lib/actions/authenticated-action.helpers';
import {
  formatMutationError,
  logUnexpectedMutationError,
  mergeUploadedImages,
  type MutationErrorDetail,
} from '@/lib/actions/mutation-action.helpers';
import { LaserEngravingConflictError } from '@/lib/errors';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import type { LaserEngravingChanges } from '@/lib/repositories/laser-engravings/laser-engravings-repository.interface';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';

export interface LaserEngravingMutationResult {
  success: boolean;
  laserEngraving?: ILaserEngraving;
  error?: string;
  details?: MutationErrorDetail[];
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

function formatLaserEngravingMutationError(
  error: unknown,
  fallbackMessage: string,
) {
  return formatMutationError(error, fallbackMessage, [
    LaserEngravingConflictError,
  ]);
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

    logUnexpectedMutationError(
      result,
      error,
      'Failed to create laser engraving',
      'Failed to create laser engraving from server action',
    );

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

    logUnexpectedMutationError(
      result,
      error,
      'Failed to update laser engraving',
      'Failed to update laser engraving from server action',
    );

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
    const result = formatLaserEngravingMutationError(
      error,
      'Failed to delete laser engraving',
    );

    logUnexpectedMutationError(
      result,
      error,
      'Failed to delete laser engraving',
      'Failed to delete laser engraving from server action',
    );

    return {
      success: false,
      error: result.error,
    };
  }
}
