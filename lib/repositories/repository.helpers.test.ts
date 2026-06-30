import { describe, expect, it } from 'vitest';
import { omitUndefined, requireField } from './repository.helpers';

describe('repository helpers', () => {
  it('omits only undefined values from objects', () => {
    expect(
      omitUndefined({
        name: 'Collar Perla',
        description: undefined,
        discount: 0,
        inStore: false,
        metadata: null,
      }),
    ).toEqual({
      name: 'Collar Perla',
      discount: 0,
      inStore: false,
      metadata: null,
    });
  });

  it('returns required fields and trims strings when requested', () => {
    const value = requireField(
      {
        name: '  Collar Perla  ',
      },
      'name',
      {
        trimString: true,
      },
    );

    expect(value).toBe('Collar Perla');
  });

  it('allows empty strings by default', () => {
    expect(requireField({ name: '' }, 'name')).toBe('');
  });

  it('throws for empty strings when they are not allowed', () => {
    expect(() =>
      requireField({ name: '   ' }, 'name', {
        allowEmptyString: false,
        trimString: true,
        label: 'product.name',
      }),
    ).toThrow('Missing required field: product.name');
  });

  it('throws for null and undefined values', () => {
    expect(() => requireField({ name: null }, 'name')).toThrow(
      'Missing required field: name',
    );
    expect(() => requireField({ name: undefined }, 'name')).toThrow(
      'Missing required field: name',
    );
  });
});
