import { LaserEngravingConflictError } from '@/lib/errors';
import { isPostgresUniqueViolation } from '@/lib/repositories/database-errors';

const LASER_ENGRAVING_SLUG_UNIQUE_CONSTRAINT = 'laser_engravings_slug_unique';
const LASER_ENGRAVING_SLUG_UNIQUE_MESSAGE =
  'Ya existe un grabado láser con ese slug';

export function isLaserEngravingSlugUniqueViolation(error: unknown): boolean {
  return isPostgresUniqueViolation(
    error,
    LASER_ENGRAVING_SLUG_UNIQUE_CONSTRAINT,
  );
}

export function getLaserEngravingConflictError() {
  return new LaserEngravingConflictError(
    LASER_ENGRAVING_SLUG_UNIQUE_MESSAGE,
    'LASER_ENGRAVING_SLUG_ALREADY_EXISTS',
    [
      {
        path: 'slug',
        message: LASER_ENGRAVING_SLUG_UNIQUE_MESSAGE,
      },
    ],
  );
}
