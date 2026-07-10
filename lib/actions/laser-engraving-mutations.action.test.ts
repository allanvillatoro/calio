import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadProductImagesAction } from '@/lib/actions/cloudinary-upload.action';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import { LaserEngravingConflictError } from '@/lib/errors';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import type { LaserEngravingChanges } from '@/lib/repositories/laser-engravings/laser-engravings-repository.interface';
import { assertLaserEngravingSlugDoesNotConflictWithProduct } from '@/lib/slug-conflicts';
import {
  createLaserEngravingAction,
  deleteLaserEngravingAction,
  updateLaserEngravingAction,
} from './laser-engraving-mutations.action';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthenticatedUserFromCookies: vi.fn(),
}));

vi.mock('@/lib/actions/cloudinary-upload.action', () => ({
  uploadProductImagesAction: vi.fn(),
}));

vi.mock(
  '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository',
  () => ({
    laserEngravingsRepository: {
      save: vi.fn(),
      updateById: vi.fn(),
      findById: vi.fn(),
      deleteById: vi.fn(),
    },
  }),
);

vi.mock('@/lib/slug-conflicts', () => ({
  assertLaserEngravingSlugDoesNotConflictWithProduct: vi.fn(),
}));

const authenticatedUser = {
  id: 'user-1',
  email: 'admin@example.test',
};

const validLaserEngravingInput = {
  slug: 'placa-corazon',
  name: 'Placa corazon',
  description: 'Placa para grabado laser personalizada',
  price: 180,
  discount: 0,
  quantity: 8,
  images: ['placa-corazon.jpg'],
} satisfies LaserEngravingChanges;

const persistedLaserEngraving: ILaserEngraving = {
  id: 25,
  slug: validLaserEngravingInput.slug,
  name: validLaserEngravingInput.name,
  description: validLaserEngravingInput.description,
  price: validLaserEngravingInput.price,
  discount: validLaserEngravingInput.discount,
  priceWithDiscount: validLaserEngravingInput.price,
  quantity: validLaserEngravingInput.quantity,
  images: validLaserEngravingInput.images,
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
};

function authenticate() {
  vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(
    authenticatedUser,
  );
}

function createImageFile(name: string) {
  return new File(['image'], name, {
    type: 'image/jpeg',
  });
}

describe('createLaserEngravingAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).mockResolvedValue(undefined);
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const result = await createLaserEngravingAction(validLaserEngravingInput);

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(laserEngravingsRepository.save).not.toHaveBeenCalled();
    expect(uploadProductImagesAction).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('uploads new files, saves the laser engraving, and revalidates laser engraving paths', async () => {
    authenticate();
    const files = [createImageFile('new-image.jpg')];
    vi.mocked(uploadProductImagesAction).mockResolvedValue(['uploaded.jpg']);
    vi.mocked(laserEngravingsRepository.save).mockResolvedValue(
      persistedLaserEngraving,
    );

    const result = await createLaserEngravingAction({
      ...validLaserEngravingInput,
      files,
    });

    expect(uploadProductImagesAction).toHaveBeenCalledWith(files);
    expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).toHaveBeenCalledWith('placa-corazon');
    expect(laserEngravingsRepository.save).toHaveBeenCalledWith({
      ...validLaserEngravingInput,
      images: ['placa-corazon.jpg', 'uploaded.jpg'],
    });
    expect(revalidatePath).toHaveBeenCalledWith('/grabados');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/grabados');
    expect(revalidatePath).toHaveBeenCalledWith('/productos/placa-corazon');
    expect(result).toEqual({
      success: true,
      laserEngraving: persistedLaserEngraving,
    });
  });

  it('creates a laser engraving without uploading images when no files are provided', async () => {
    authenticate();
    vi.mocked(laserEngravingsRepository.save).mockResolvedValue(
      persistedLaserEngraving,
    );

    const result = await createLaserEngravingAction(validLaserEngravingInput);

    expect(uploadProductImagesAction).not.toHaveBeenCalled();
    expect(laserEngravingsRepository.save).toHaveBeenCalledWith(
      validLaserEngravingInput,
    );
    expect(result).toEqual({
      success: true,
      laserEngraving: persistedLaserEngraving,
    });
  });

  it('returns validation details when laser engraving input is invalid', async () => {
    authenticate();

    const result = await createLaserEngravingAction({
      ...validLaserEngravingInput,
      images: [],
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'images',
        }),
      ]),
    );
    expect(laserEngravingsRepository.save).not.toHaveBeenCalled();
  });

  it('returns validation details when creating with a numeric-only slug', async () => {
    authenticate();

    const result = await createLaserEngravingAction({
      ...validLaserEngravingInput,
      slug: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'slug',
          message: 'Slug cannot contain only numbers',
        }),
      ]),
    );
    expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).not.toHaveBeenCalled();
    expect(laserEngravingsRepository.save).not.toHaveBeenCalled();
  });

  it('returns conflict details when the repository rejects a duplicate slug', async () => {
    authenticate();
    const conflict = new LaserEngravingConflictError(
      'Ya existe un grabado laser con ese slug',
      'LASER_ENGRAVING_SLUG_ALREADY_EXISTS',
      [
        {
          path: 'slug',
          message: 'Ya existe un grabado laser con ese slug',
        },
      ],
    );
    vi.mocked(laserEngravingsRepository.save).mockRejectedValue(conflict);

    const result = await createLaserEngravingAction(validLaserEngravingInput);

    expect(result).toEqual({
      success: false,
      error: 'Ya existe un grabado laser con ese slug',
      details: conflict.details,
    });
  });

  it('returns conflict details when a product already uses the public slug', async () => {
    authenticate();
    const conflict = new LaserEngravingConflictError(
      'Ya existe una joya publicada con ese slug',
      'PUBLIC_SLUG_ALREADY_EXISTS',
      [
        {
          path: 'slug',
          message: 'Ya existe una joya publicada con ese slug',
        },
      ],
    );
    vi.mocked(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).mockRejectedValue(conflict);

    const result = await createLaserEngravingAction(validLaserEngravingInput);

    expect(result).toEqual({
      success: false,
      error: 'Ya existe una joya publicada con ese slug',
      details: conflict.details,
    });
    expect(laserEngravingsRepository.save).not.toHaveBeenCalled();
  });

  it('returns a generic create error when saving fails unexpectedly', async () => {
    authenticate();
    vi.mocked(laserEngravingsRepository.save).mockRejectedValue(
      new Error('DB down'),
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const result = await createLaserEngravingAction(validLaserEngravingInput);

    expect(result).toEqual({
      success: false,
      error: 'Failed to create laser engraving',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to create laser engraving from server action',
      expect.any(Error),
    );

    consoleError.mockRestore();
  });
});

describe('updateLaserEngravingAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).mockResolvedValue(undefined);
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const result = await updateLaserEngravingAction(
      25,
      validLaserEngravingInput,
    );

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
  });

  it('updates a laser engraving and revalidates returned laser engraving paths', async () => {
    authenticate();
    vi.mocked(laserEngravingsRepository.updateById).mockResolvedValue(
      persistedLaserEngraving,
    );

    const result = await updateLaserEngravingAction(
      25,
      validLaserEngravingInput,
    );

    expect(laserEngravingsRepository.updateById).toHaveBeenCalledWith(
      25,
      validLaserEngravingInput,
    );
    expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).toHaveBeenCalledWith('placa-corazon');
    expect(revalidatePath).toHaveBeenCalledWith('/grabados');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/grabados');
    expect(revalidatePath).toHaveBeenCalledWith('/productos/placa-corazon');
    expect(result).toEqual({
      success: true,
      laserEngraving: persistedLaserEngraving,
    });
  });

  it('returns laser engraving not found when the repository cannot update it', async () => {
    authenticate();
    vi.mocked(laserEngravingsRepository.updateById).mockResolvedValue(null);

    const result = await updateLaserEngravingAction(
      25,
      validLaserEngravingInput,
    );

    expect(result).toEqual({
      success: false,
      error: 'Laser engraving not found',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns validation details when the laser engraving id is invalid', async () => {
    authenticate();

    const result = await updateLaserEngravingAction(
      0,
      validLaserEngravingInput,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
  });

  it('returns validation details when updating with a numeric-only slug', async () => {
    authenticate();

    const result = await updateLaserEngravingAction(25, {
      ...validLaserEngravingInput,
      slug: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation failed');
    expect(result.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'slug',
          message: 'Slug cannot contain only numbers',
        }),
      ]),
    );
    expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).not.toHaveBeenCalled();
    expect(laserEngravingsRepository.updateById).not.toHaveBeenCalled();
  });
});

describe('deleteLaserEngravingAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      assertLaserEngravingSlugDoesNotConflictWithProduct,
    ).mockResolvedValue(undefined);
  });

  it('returns unauthorized when no authenticated user exists', async () => {
    vi.mocked(getAuthenticatedUserFromCookies).mockResolvedValue(null);

    const result = await deleteLaserEngravingAction(25);

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(laserEngravingsRepository.findById).not.toHaveBeenCalled();
    expect(laserEngravingsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('deletes an existing laser engraving and revalidates laser engraving paths', async () => {
    authenticate();
    vi.mocked(laserEngravingsRepository.findById).mockResolvedValue(
      persistedLaserEngraving,
    );
    vi.mocked(laserEngravingsRepository.deleteById).mockResolvedValue(true);

    const result = await deleteLaserEngravingAction(25);

    expect(laserEngravingsRepository.findById).toHaveBeenCalledWith(25);
    expect(laserEngravingsRepository.deleteById).toHaveBeenCalledWith(25);
    expect(revalidatePath).toHaveBeenCalledWith('/grabados');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/grabados');
    expect(revalidatePath).toHaveBeenCalledWith('/productos/placa-corazon');
    expect(result).toEqual({
      success: true,
    });
  });

  it('returns laser engraving not found when it does not exist', async () => {
    authenticate();
    vi.mocked(laserEngravingsRepository.findById).mockResolvedValue(null);

    const result = await deleteLaserEngravingAction(25);

    expect(result).toEqual({
      success: false,
      error: 'Laser engraving not found',
    });
    expect(laserEngravingsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('returns validation failed when the laser engraving id is invalid', async () => {
    authenticate();

    const result = await deleteLaserEngravingAction(0);

    expect(result).toEqual({
      success: false,
      error: 'Validation failed',
    });
    expect(laserEngravingsRepository.findById).not.toHaveBeenCalled();
    expect(laserEngravingsRepository.deleteById).not.toHaveBeenCalled();
  });
});
