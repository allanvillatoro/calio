import { describe, expect, it } from 'vitest';
import { isPostgresUniqueViolation } from './database-errors';

describe('isPostgresUniqueViolation', () => {
  it('returns true for direct matching unique violations', () => {
    expect(
      isPostgresUniqueViolation(
        {
          code: '23505',
          constraint: 'products_name_unique',
        },
        'products_name_unique',
      ),
    ).toBe(true);
  });

  it('returns true for nested matching unique violations', () => {
    expect(
      isPostgresUniqueViolation(
        {
          error: {
            code: '23505',
            constraint: 'products_name_unique',
          },
        },
        'products_name_unique',
      ),
    ).toBe(true);
  });

  it('returns true for matching original database errors', () => {
    expect(
      isPostgresUniqueViolation(
        {
          originalError: {
            code: '23505',
            constraint: 'products_name_unique',
          },
        },
        'products_name_unique',
      ),
    ).toBe(true);
  });

  it('returns false for non-matching database errors', () => {
    expect(
      isPostgresUniqueViolation(
        {
          code: '23505',
          constraint: 'products_slug_unique',
          cause: {
            code: '23503',
            constraint: 'products_name_unique',
          },
        },
        'products_name_unique',
      ),
    ).toBe(false);
  });

  it('returns false for non-object errors', () => {
    expect(isPostgresUniqueViolation('boom', 'products_name_unique')).toBe(
      false,
    );
  });
});
