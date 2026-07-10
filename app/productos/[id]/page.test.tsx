import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { IProduct } from '@/lib/interfaces/product';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import { resolveProductDetailItem } from './page';

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    findById: vi.fn(),
    findBySlug: vi.fn(),
  },
}));

vi.mock(
  '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository',
  () => ({
    laserEngravingsRepository: {
      findBySlug: vi.fn(),
    },
  }),
);

const product: IProduct = {
  id: 12,
  slug: 'collar-perla',
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  priceWithDiscount: 250,
  quantity: 5,
  images: ['collar-perla.jpg'],
  category: 'collares',
  inStore: true,
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
};

const laserEngraving: ILaserEngraving = {
  id: 8,
  slug: 'grabado-nombre-fecha',
  name: 'Nombre y fecha',
  description: 'Grabado laser con nombre y fecha especial',
  price: 150,
  discount: 0,
  priceWithDiscount: 150,
  quantity: 4,
  images: ['grabado-nombre-fecha.jpg'],
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
};

describe('resolveProductDetailItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsRepository.findById).mockResolvedValue(null);
    vi.mocked(productsRepository.findBySlug).mockResolvedValue(null);
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue(null);
  });

  it('resolves numeric product ids before trying slug lookups', async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(product);

    await expect(resolveProductDetailItem('12')).resolves.toEqual({
      kind: 'product',
      item: product,
    });
    expect(productsRepository.findById).toHaveBeenCalledWith(12);
    expect(productsRepository.findBySlug).not.toHaveBeenCalled();
    expect(laserEngravingsRepository.findBySlug).not.toHaveBeenCalled();
  });

  it('resolves products by slug for SEO-friendly product URLs', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue(product);

    await expect(resolveProductDetailItem('collar-perla')).resolves.toEqual({
      kind: 'product',
      item: product,
    });
    expect(productsRepository.findById).not.toHaveBeenCalled();
    expect(productsRepository.findBySlug).toHaveBeenCalledWith('collar-perla');
    expect(laserEngravingsRepository.findBySlug).not.toHaveBeenCalled();
  });

  it('falls back to laser engravings by slug', async () => {
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue(
      laserEngraving,
    );

    await expect(
      resolveProductDetailItem('grabado-nombre-fecha'),
    ).resolves.toEqual({
      kind: 'laser-engraving',
      item: laserEngraving,
    });
    expect(productsRepository.findBySlug).toHaveBeenCalledWith(
      'grabado-nombre-fecha',
    );
    expect(laserEngravingsRepository.findBySlug).toHaveBeenCalledWith(
      'grabado-nombre-fecha',
    );
  });

  it('returns null when neither products nor laser engravings match', async () => {
    await expect(resolveProductDetailItem('no-existe')).resolves.toBeNull();
  });
});
