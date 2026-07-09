import { describe, expect, it } from 'vitest';
import {
  createLaserEngravingBodySchema,
  laserEngravingIdParamsSchema,
  laserEngravingsQuerySchema,
  updateLaserEngravingBodySchema,
} from './schemas';

const validLaserEngravingInput = {
  slug: 'grabado-nombre-fecha',
  name: 'Nombre y fecha',
  description: 'Grabado laser con nombre y fecha especial',
  price: 150,
  quantity: 8,
  images: ['grabado-nombre-fecha.jpg'],
  discount: 0,
};

describe('laser engraving body schemas', () => {
  it('accepts a valid laser engraving', () => {
    const result = createLaserEngravingBodySchema.safeParse(
      validLaserEngravingInput,
    );

    expect(result.success).toBe(true);
  });

  it('defaults discount to zero when omitted', () => {
    const inputWithoutDiscount: Partial<typeof validLaserEngravingInput> = {
      ...validLaserEngravingInput,
    };
    delete inputWithoutDiscount.discount;

    const result = createLaserEngravingBodySchema.safeParse(
      inputWithoutDiscount,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount).toBe(0);
    }
  });

  it('rejects slugs outside the public URL format', () => {
    const result = createLaserEngravingBodySchema.safeParse({
      ...validLaserEngravingInput,
      slug: 'Grabado Nombre',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['slug'],
          }),
        ]),
      );
    }
  });

  it('rejects laser engravings without images', () => {
    const result = createLaserEngravingBodySchema.safeParse({
      ...validLaserEngravingInput,
      images: [],
    });

    expect(result.success).toBe(false);
  });

  it('uses the same body rules when updating laser engravings', () => {
    const result = updateLaserEngravingBodySchema.safeParse(
      validLaserEngravingInput,
    );

    expect(result.success).toBe(true);
  });
});

describe('laserEngravingIdParamsSchema', () => {
  it('coerces positive integer ids from strings', () => {
    const result = laserEngravingIdParamsSchema.safeParse({ id: '42' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it('rejects non-positive ids', () => {
    const result = laserEngravingIdParamsSchema.safeParse({ id: '0' });

    expect(result.success).toBe(false);
  });
});

describe('laserEngravingsQuerySchema', () => {
  it('applies pagination defaults when query params are omitted', () => {
    const result = laserEngravingsQuerySchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        page: 1,
        limit: 20,
      });
    }
  });

  it('coerces page and limit from strings', () => {
    const result = laserEngravingsQuerySchema.safeParse({
      page: '3',
      limit: '40',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(40);
    }
  });

  it('ignores unsupported instore query values', () => {
    const result = laserEngravingsQuerySchema.safeParse({ instore: 'true' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('instore');
    }
  });

  it('rejects empty queries after trimming', () => {
    const result = laserEngravingsQuerySchema.safeParse({ query: '   ' });

    expect(result.success).toBe(false);
  });

  it('rejects limits above the public maximum', () => {
    const result = laserEngravingsQuerySchema.safeParse({ limit: '101' });

    expect(result.success).toBe(false);
  });
});
