import { describe, expect, it } from 'vitest';
import { LaserEngravingConflictError } from '@/lib/errors';
import {
  getLaserEngravingConflictError,
  isLaserEngravingSlugUniqueViolation,
} from './laser-engravings-repository.errors';

describe('isLaserEngravingSlugUniqueViolation', () => {
  it('returns true for direct slug unique violations', () => {
    const error = {
      code: '23505',
      constraint: 'laser_engravings_slug_unique',
    };

    expect(isLaserEngravingSlugUniqueViolation(error)).toBe(true);
  });

  it('returns true for nested slug unique violations', () => {
    const error = {
      cause: {
        code: '23505',
        constraint: 'laser_engravings_slug_unique',
      },
    };

    expect(isLaserEngravingSlugUniqueViolation(error)).toBe(true);
  });

  it('returns false for non-matching database errors', () => {
    const error = {
      code: '23505',
      constraint: 'other_constraint',
      originalError: {
        code: '23503',
        constraint: 'laser_engravings_slug_unique',
      },
    };

    expect(isLaserEngravingSlugUniqueViolation(error)).toBe(false);
  });

  it('returns false for non-object errors', () => {
    expect(isLaserEngravingSlugUniqueViolation('boom')).toBe(false);
  });
});

describe('getLaserEngravingConflictError', () => {
  it('returns a field-level conflict error for duplicate slugs', () => {
    const error = getLaserEngravingConflictError();

    expect(error).toBeInstanceOf(LaserEngravingConflictError);
    expect(error.message).toBe('Ya existe un grabado láser con ese slug');
    expect(error.code).toBe('LASER_ENGRAVING_SLUG_ALREADY_EXISTS');
    expect(error.details).toEqual([
      {
        path: 'slug',
        message: 'Ya existe un grabado láser con ese slug',
      },
    ]);
  });
});
