import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
import { ProductConflictError } from '@/lib/errors';
import {
  formatMutationError,
  logUnexpectedMutationError,
  mergeUploadedImages,
} from './mutation-action.helpers';

vi.mock('@/lib/actions/cloudinary-upload.action', () => ({
  uploadProductImagesAction: vi.fn(),
}));

function createImageFile(name: string) {
  return new File(['image'], name, {
    type: 'image/jpeg',
  });
}

describe('mergeUploadedImages', () => {
  it('returns existing data unchanged when no files are provided', async () => {
    const input = {
      name: 'Collar',
      images: ['collar.jpg'],
    };

    await expect(mergeUploadedImages(input)).resolves.toEqual(input);
    expect(uploadProductImagesAction).not.toHaveBeenCalled();
  });

  it('uploads files and appends uploaded image names to existing images', async () => {
    const files = [createImageFile('new-image.jpg')];
    vi.mocked(uploadProductImagesAction).mockResolvedValue(['uploaded.jpg']);

    await expect(
      mergeUploadedImages({
        name: 'Collar',
        images: ['collar.jpg'],
        files,
      }),
    ).resolves.toEqual({
      name: 'Collar',
      images: ['collar.jpg', 'uploaded.jpg'],
    });
    expect(uploadProductImagesAction).toHaveBeenCalledWith(files);
  });

  it('uses uploaded image names when no existing images are provided', async () => {
    const files = [createImageFile('only-upload.jpg')];
    vi.mocked(uploadProductImagesAction).mockResolvedValue(['only-upload.jpg']);

    await expect(
      mergeUploadedImages({
        name: 'Collar',
        files,
      }),
    ).resolves.toEqual({
      name: 'Collar',
      images: ['only-upload.jpg'],
    });
  });
});

describe('formatMutationError', () => {
  it('formats Zod errors with validation details', () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const parsed = schema.safeParse({
      name: '',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(formatMutationError(parsed.error, 'Fallback')).toEqual({
      success: false,
      error: 'Validation failed',
      details: [
        expect.objectContaining({
          path: 'name',
        }),
      ],
    });
  });

  it('formats configured conflict errors with details', () => {
    const conflict = new ProductConflictError(
      'Product already exists',
      'PRODUCT_NAME_ALREADY_EXISTS',
      [
        {
          path: 'name',
          message: 'Product already exists',
        },
      ],
    );

    expect(
      formatMutationError(conflict, 'Fallback', [ProductConflictError]),
    ).toEqual({
      success: false,
      error: 'Product already exists',
      details: conflict.details,
    });
  });

  it('returns the fallback for unexpected errors', () => {
    expect(formatMutationError(new Error('DB down'), 'Fallback')).toEqual({
      success: false,
      error: 'Fallback',
    });
  });
});

describe('logUnexpectedMutationError', () => {
  it('logs only fallback errors', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const error = new Error('DB down');

    logUnexpectedMutationError(
      {
        success: false,
        error: 'Fallback',
      },
      error,
      'Fallback',
      'Operation failed',
    );
    logUnexpectedMutationError(
      {
        success: false,
        error: 'Validation failed',
      },
      error,
      'Fallback',
      'Operation failed',
    );

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith('Operation failed', error);

    consoleError.mockRestore();
  });
});
