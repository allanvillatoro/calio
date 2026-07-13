import 'server-only';
import { LaserEngravingConflictError } from '@/lib/errors';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';

const PUBLIC_SLUG_CONFLICT_MESSAGE =
  'Ya existe una joya publicada con ese slug';

export function getPublicSlugConflictError() {
  return new LaserEngravingConflictError(
    PUBLIC_SLUG_CONFLICT_MESSAGE,
    'PUBLIC_SLUG_ALREADY_EXISTS',
    [
      {
        path: 'slug',
        message: PUBLIC_SLUG_CONFLICT_MESSAGE,
      },
    ],
  );
}

export async function assertLaserEngravingSlugDoesNotConflictWithProduct(
  slug: string,
): Promise<void> {
  const product = await productsRepository.findBySlug(slug);

  if (product) {
    throw getPublicSlugConflictError();
  }
}
