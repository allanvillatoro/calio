import { LaserEngravingConflictError } from '@/lib/errors';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const LASER_ENGRAVING_SLUG_UNIQUE_CONSTRAINT = 'laser_engravings_slug_unique';
const LASER_ENGRAVING_SLUG_UNIQUE_MESSAGE =
  'Ya existe un grabado láser con ese slug';

interface DatabaseError {
  code?: string;
  constraint?: string;
  cause?: unknown;
  error?: unknown;
  originalError?: unknown;
}

function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null;
}

function getDatabaseErrorCandidates(error: unknown): DatabaseError[] {
  if (!isDatabaseError(error)) {
    return [];
  }

  return [error, error.cause, error.error, error.originalError].filter(
    isDatabaseError,
  );
}

export function isLaserEngravingSlugUniqueViolation(error: unknown): boolean {
  return getDatabaseErrorCandidates(error).some(
    (candidate) =>
      candidate.code === POSTGRES_UNIQUE_VIOLATION_CODE &&
      candidate.constraint === LASER_ENGRAVING_SLUG_UNIQUE_CONSTRAINT,
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
