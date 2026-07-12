import { ZodError } from 'zod';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
import { formatZodError } from '@/lib/zod';

export interface MutationErrorDetail {
  path: string;
  message: string;
}

export interface MutationErrorResult {
  success: false;
  error: string;
  details?: MutationErrorDetail[];
}

interface MutationConflictError extends Error {
  details?: MutationErrorDetail[];
}

type MutationConflictErrorConstructor = new (
  ...args: never[]
) => MutationConflictError;

export interface ImageMutationInput {
  images?: string[];
  files?: File[];
}

export async function mergeUploadedImages<TInput extends ImageMutationInput>(
  input: TInput,
): Promise<Omit<TInput, 'files'> & { images?: string[] }> {
  const { files = [], ...itemData } = input;

  if (files.length > 0) {
    const uploadedImages = await uploadProductImagesAction(files);

    return {
      ...itemData,
      images: [...(itemData.images ?? []), ...uploadedImages],
    };
  }

  return itemData;
}

export function formatMutationError(
  error: unknown,
  fallbackMessage: string,
  conflictErrors: MutationConflictErrorConstructor[] = [],
): MutationErrorResult {
  if (error instanceof ZodError) {
    const formattedError = formatZodError(error);

    return {
      success: false,
      error: formattedError.error,
      details: formattedError.details,
    };
  }

  const conflictError = conflictErrors.find(
    (ConflictError) => error instanceof ConflictError,
  );

  if (conflictError && error instanceof conflictError) {
    return {
      success: false,
      error: error.message,
      details: error.details,
    };
  }

  return {
    success: false,
    error: fallbackMessage,
  };
}

export function logUnexpectedMutationError(
  result: MutationErrorResult,
  error: unknown,
  fallbackMessage: string,
  logMessage: string,
) {
  if (result.error === fallbackMessage) {
    console.error(logMessage, error);
  }
}
