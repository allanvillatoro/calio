import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  sellableItemBodyShape,
  sellableItemIdParamsSchema,
  sellableItemsQuerySchema,
} from './sellable-item-schemas';

const sellableItemBodySchema = z.object(sellableItemBodyShape);

describe('sellable item body schema shape', () => {
  it('accepts shared sellable item fields and defaults discount to zero', () => {
    const result = sellableItemBodySchema.safeParse({
      name: 'Collar',
      description: 'Collar dorado',
      price: 250,
      quantity: 5,
      images: ['collar.jpg'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount).toBe(0);
    }
  });

  it('rejects empty image lists', () => {
    const result = sellableItemBodySchema.safeParse({
      name: 'Collar',
      description: 'Collar dorado',
      price: 250,
      quantity: 5,
      images: [],
    });

    expect(result.success).toBe(false);
  });
});

describe('sellableItemIdParamsSchema', () => {
  it('coerces positive integer ids from strings', () => {
    const result = sellableItemIdParamsSchema.safeParse({
      id: '12',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(12);
    }
  });

  it('rejects invalid ids', () => {
    expect(sellableItemIdParamsSchema.safeParse({ id: '0' }).success).toBe(
      false,
    );
  });
});

describe('sellableItemsQuerySchema', () => {
  it('applies default pagination and trims valid queries', () => {
    const result = sellableItemsQuerySchema.safeParse({
      query: ' collar ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        query: 'collar',
        page: 1,
        limit: 20,
      });
    }
  });

  it('rejects empty queries and oversized limits', () => {
    expect(
      sellableItemsQuerySchema.safeParse({
        query: '   ',
      }).success,
    ).toBe(false);
    expect(
      sellableItemsQuerySchema.safeParse({
        limit: '101',
      }).success,
    ).toBe(false);
  });
});
