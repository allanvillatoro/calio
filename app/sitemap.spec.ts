import { describe, expect, it, vi } from 'vitest';
import { dynamic } from './sitemap';

vi.mock('@/lib/repositories/products/drizzle-products-repository', () => ({
  productsRepository: {
    findAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('sitemap', () => {
  it('is generated dynamically so CI builds do not require a live database', () => {
    expect(dynamic).toBe('force-dynamic');
  });
});
