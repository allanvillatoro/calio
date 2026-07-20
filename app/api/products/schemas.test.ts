import { describe, expect, it } from 'vitest';
import {
  createProductBodySchema,
  productIdParamsSchema,
  productsQuerySchema,
  updateProductBodySchema,
} from './schemas';

const validProductInput = {
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  quantity: 5,
  images: ['collar-perla.jpg'],
  category: 'collares',
  discount: 0,
  inStoreSps: true,
  inStorePro: true,
};

describe('product body schemas', () => {
  it('accepts a valid product outside rebajas when discount is zero', () => {
    const result = createProductBodySchema.safeParse(validProductInput);

    expect(result.success).toBe(true);
  });

  it('accepts a rebajas product when discount is between 1 and 99', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      category: 'rebajas',
      discount: 25,
    });

    expect(result.success).toBe(true);
  });

  it('defaults discount to zero when creating a regular product without discount', () => {
    const inputWithoutDiscount = {
      name: validProductInput.name,
      description: validProductInput.description,
      price: validProductInput.price,
      quantity: validProductInput.quantity,
      images: validProductInput.images,
      category: validProductInput.category,
      inStoreSps: validProductInput.inStoreSps,
      inStorePro: validProductInput.inStorePro,
    };

    const result = createProductBodySchema.safeParse(inputWithoutDiscount);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount).toBe(0);
    }
  });

  it('rejects a rebajas product without a positive discount', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      category: 'rebajas',
      discount: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['discount'],
            message:
              'Discount must be between 1 and 99 when category is "rebajas"',
          }),
        ]),
      );
    }
  });

  it('rejects a discount outside rebajas', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      discount: 10,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['discount'],
            message:
              'Discount must be 0 when category is different from "rebajas"',
          }),
        ]),
      );
    }
  });

  it('rejects products without images', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      images: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['images'],
          }),
        ]),
      );
    }
  });

  it('rejects invalid categories', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      category: 'joyas',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['category'],
          }),
        ]),
      );
    }
  });

  it('uses the same body rules when updating products', () => {
    const result = updateProductBodySchema.safeParse({
      ...validProductInput,
      category: 'rebajas',
      discount: 0,
    });

    expect(result.success).toBe(false);
  });

  it('rejects store availability when quantity is zero', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      quantity: 0,
      inStorePro: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ['inStoreSps'] }),
        ]),
      );
    }
  });

  it('rejects both stores when quantity is one', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      quantity: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: ['inStoreSps'] }),
          expect.objectContaining({ path: ['inStorePro'] }),
        ]),
      );
    }
  });

  it('accepts both stores when quantity is at least two', () => {
    const result = createProductBodySchema.safeParse({
      ...validProductInput,
      quantity: 2,
    });

    expect(result.success).toBe(true);
  });
});

describe('productIdParamsSchema', () => {
  it('coerces positive integer ids from strings', () => {
    const result = productIdParamsSchema.safeParse({ id: '42' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it('rejects non-positive ids', () => {
    const result = productIdParamsSchema.safeParse({ id: '0' });

    expect(result.success).toBe(false);
  });
});

describe('productsQuerySchema', () => {
  it('applies pagination defaults when query params are omitted', () => {
    const result = productsQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        page: 1,
        limit: 20,
      });
    }
  });

  it('coerces page and limit from strings', () => {
    const result = productsQuerySchema.safeParse({
      page: '3',
      limit: '40',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(40);
    }
  });

  it('coerces store filters from true and false strings', () => {
    const trueResult = productsQuerySchema.safeParse({ instoresps: 'true' });
    const falseResult = productsQuerySchema.safeParse({ instorepro: 'false' });

    expect(trueResult.success).toBe(true);
    expect(falseResult.success).toBe(true);
    if (trueResult.success && falseResult.success) {
      expect(trueResult.data.instoresps).toBe(true);
      expect(falseResult.data.instorepro).toBe(false);
    }
  });

  it('passes non-string store values through to boolean validation', () => {
    const result = productsQuerySchema.safeParse({ instoresps: 1 });

    expect(result.success).toBe(false);
  });

  it('rejects unsupported store string values', () => {
    const result = productsQuerySchema.safeParse({ instorepro: 'maybe' });

    expect(result.success).toBe(false);
  });

  it('rejects empty queries after trimming', () => {
    const result = productsQuerySchema.safeParse({ query: '   ' });

    expect(result.success).toBe(false);
  });

  it('rejects limits above the public maximum', () => {
    const result = productsQuerySchema.safeParse({ limit: '101' });

    expect(result.success).toBe(false);
  });
});
