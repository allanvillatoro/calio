import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assertLaserEngravingSlugDoesNotConflictWithProduct,
  getPublicSlugConflictError,
} from './slug-conflicts';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    findBySlug: vi.fn(),
  },
}));

describe('slug conflicts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not throw when no product uses the slug', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue(null);

    await expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct('placa-corazon'),
    ).resolves.toBeUndefined();
  });

  it('throws field-level conflict details when a product already uses the slug', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue({
      id: 12,
      slug: 'placa-corazon',
      name: 'Placa corazon',
      description: 'Joya con slug existente',
      price: 180,
      discount: 0,
      priceWithDiscount: 180,
      quantity: 1,
      images: ['placa.jpg'],
      category: 'collares',
      inStore: false,
      createdAt: new Date('2026-01-15T12:00:00.000Z'),
      updatedAt: new Date('2026-01-16T12:00:00.000Z'),
    });

    await expect(
      assertLaserEngravingSlugDoesNotConflictWithProduct('placa-corazon'),
    ).rejects.toEqual(getPublicSlugConflictError());
  });
});
