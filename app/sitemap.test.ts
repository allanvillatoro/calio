import { describe, expect, it, vi } from 'vitest';
import type { IProduct } from '@/lib/interfaces/product';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import sitemap, { dynamic, revalidate } from './sitemap';

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    findAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const product: IProduct = {
  id: 12,
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

describe('sitemap', () => {
  it('is generated dynamically so CI builds do not require a live database', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(revalidate).toBe(86400);
  });

  it('generates static pages and product pages', async () => {
    vi.mocked(productsRepository.findAll).mockResolvedValue({
      data: [product],
      paging: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 500,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const routes = await sitemap();

    expect(productsRepository.findAll).toHaveBeenCalledWith({
      limit: 500,
      includeOutOfStock: true,
    });
    expect(routes).toHaveLength(3);
    const baseUrl = routes[0].url;

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: baseUrl,
          changeFrequency: 'weekly',
          priority: 1,
          lastModified: expect.any(Date),
        }),
        expect.objectContaining({
          url: `${baseUrl}/catalogo`,
          changeFrequency: 'daily',
          priority: 0.9,
          lastModified: expect.any(Date),
        }),
        expect.objectContaining({
          url: `${baseUrl}/productos/12`,
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: expect.any(Date),
        }),
      ]),
    );
  });
});
