import type { MetadataRoute } from 'next';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/catalogo`,
      changeFrequency: 'daily',
      priority: 0.9,
      lastModified: new Date(),
    },
  ];

  const { data: products } = await productsRepository.findAll({
    limit: 500,
    includeOutOfStock: true,
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/productos/${product.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    lastModified: new Date(),
  }));

  return [...staticPages, ...productPages];
}
