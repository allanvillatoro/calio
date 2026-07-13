import { describe, expect, it } from 'vitest';
import { ProductConflictError } from '@/lib/errors';
import {
  getProductConflictError,
  isProductNameUniqueViolation,
} from './products-repository.errors';

describe('isProductNameUniqueViolation', () => {
  it('returns true for direct product name unique violations', () => {
    const error = {
      code: '23505',
      constraint: 'products_name_unique',
    };

    expect(isProductNameUniqueViolation(error)).toBe(true);
  });

  it('returns true for nested product name unique violations', () => {
    const error = {
      originalError: {
        code: '23505',
        constraint: 'products_name_unique',
      },
    };

    expect(isProductNameUniqueViolation(error)).toBe(true);
  });

  it('returns false for non-matching database errors', () => {
    const error = {
      code: '23505',
      constraint: 'products_slug_unique',
      cause: {
        code: '23503',
        constraint: 'products_name_unique',
      },
    };

    expect(isProductNameUniqueViolation(error)).toBe(false);
  });

  it('returns false for non-object errors', () => {
    expect(isProductNameUniqueViolation('boom')).toBe(false);
  });
});

describe('getProductConflictError', () => {
  it('returns a field-level conflict error for duplicate product names', () => {
    const error = getProductConflictError();

    expect(error).toBeInstanceOf(ProductConflictError);
    expect(error.message).toBe('Ya existe un producto con ese nombre');
    expect(error.code).toBe('PRODUCT_NAME_ALREADY_EXISTS');
    expect(error.details).toEqual([
      {
        path: 'name',
        message: 'Ya existe un producto con ese nombre',
      },
    ]);
  });
});
