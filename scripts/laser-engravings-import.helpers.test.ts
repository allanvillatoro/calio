import { describe, expect, it } from 'vitest';
import {
  assertValidLaserEngravings,
  compareLaserEngravings,
  normalizeLaserEngraving,
  type LaserEngravingSeed,
} from './laser-engravings-import.helpers';

const laserEngraving: LaserEngravingSeed = {
  id: 1001,
  slug: ' placa-corazon ',
  name: ' Placa corazon ',
  description: ' Grabado de iniciales ',
  price: 180,
  discount: 0,
  quantity: 12,
  images: ['grabado.webp'],
};

describe('laser engravings import helpers', () => {
  it('normalizes laser engraving seeds for repository input', () => {
    expect(normalizeLaserEngraving(laserEngraving)).toEqual({
      id: 1001,
      slug: 'placa-corazon',
      name: 'Placa corazon',
      description: 'Grabado de iniciales',
      price: 180,
      discount: 0,
      quantity: 12,
      images: ['grabado.webp'],
    });
  });

  it('defaults discount to zero when omitted', () => {
    const normalizedLaserEngraving = normalizeLaserEngraving({
      ...laserEngraving,
      discount: undefined as unknown as number,
    });

    expect(normalizedLaserEngraving.discount).toBe(0);
  });

  it('sorts laser engraving seeds by id and then name', () => {
    const sortedLaserEngravings = [
      {
        ...laserEngraving,
        id: 1002,
        name: 'Barra nombre',
      },
      {
        ...laserEngraving,
        id: 1001,
        name: 'Zeta',
      },
      {
        ...laserEngraving,
        id: 1001,
        name: 'Alfa',
      },
    ].sort(compareLaserEngravings);

    expect(sortedLaserEngravings.map((item) => item.name)).toEqual([
      'Alfa',
      'Zeta',
      'Barra nombre',
    ]);
  });

  it('accepts valid laser engraving seed arrays', () => {
    const data: unknown = [laserEngraving];

    expect(() => assertValidLaserEngravings(data)).not.toThrow();
  });

  it('rejects non-array seed data', () => {
    expect(() => assertValidLaserEngravings({})).toThrow(
      'scripts/laser-engravings-data.json must contain an array of laser engravings',
    );
  });

  it('rejects invalid laser engraving seeds', () => {
    expect(() =>
      assertValidLaserEngravings([
        {
          ...laserEngraving,
          images: 'grabado.webp',
        },
      ]),
    ).toThrow('Invalid laser engraving at index 0');
  });

  it('rejects numeric-only slugs to avoid product detail route ambiguity', () => {
    expect(() =>
      assertValidLaserEngravings([
        {
          ...laserEngraving,
          slug: '123',
        },
      ]),
    ).toThrow('Invalid laser engraving slug at index 0');
  });
});
