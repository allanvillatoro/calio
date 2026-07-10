import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { LaserEngravingChanges } from '@/lib/repositories/laser-engravings/laser-engravings-repository.interface';

export type LaserEngravingSeed = Omit<
  ILaserEngraving,
  'createdAt' | 'updatedAt' | 'priceWithDiscount'
> & {
  createdAt?: string;
  updatedAt?: string;
  priceWithDiscount?: number;
};

export function compareLaserEngravings(
  a: LaserEngravingSeed,
  b: LaserEngravingSeed,
): number {
  if (a.id !== b.id) {
    return a.id - b.id;
  }

  return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
}

export function normalizeLaserEngraving(
  laserEngraving: LaserEngravingSeed,
): LaserEngravingChanges {
  return {
    id: laserEngraving.id,
    slug: laserEngraving.slug.trim(),
    name: laserEngraving.name.trim(),
    description: laserEngraving.description.trim(),
    price: laserEngraving.price,
    discount: laserEngraving.discount ?? 0,
    quantity: laserEngraving.quantity,
    images: laserEngraving.images,
  };
}

export function assertValidLaserEngravings(
  data: unknown,
): asserts data is LaserEngravingSeed[] {
  if (!Array.isArray(data)) {
    throw new Error(
      'scripts/laser-engravings-data.json must contain an array of laser engravings',
    );
  }

  for (let index = 0; index < data.length; index += 1) {
    const laserEngraving = data[index];

    if (
      typeof laserEngraving !== 'object' ||
      laserEngraving === null ||
      typeof laserEngraving.id !== 'number' ||
      typeof laserEngraving.slug !== 'string' ||
      typeof laserEngraving.name !== 'string' ||
      typeof laserEngraving.description !== 'string' ||
      typeof laserEngraving.price !== 'number' ||
      typeof laserEngraving.quantity !== 'number' ||
      !Array.isArray(laserEngraving.images)
    ) {
      throw new Error(`Invalid laser engraving at index ${index}`);
    }
  }
}
