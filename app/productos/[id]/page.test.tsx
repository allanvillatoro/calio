import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { IProduct } from '@/lib/interfaces/product';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';
import ProductDetailPage, { generateMetadata } from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/components/product/ImageCarousel', () => ({
  default: ({ images }: { images: string[] }) => (
    <div>carousel:{images.join(',')}</div>
  ),
}));

vi.mock('@/components/product/BackButton', () => ({
  default: () => <button type="button">Volver</button>,
}));

vi.mock('@/components/product/AddToCartButton', () => ({
  default: ({
    product,
    label,
  }: {
    product: { name: string; kind: string; sourceId: string };
    label: string;
  }) => (
    <button type="button">
      {label}:{product.kind}:{product.sourceId}:{product.name}
    </button>
  ),
}));

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
  inStoreSps: true,
  inStorePro: false,
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

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsRepository.findById).mockResolvedValue(null);
    vi.mocked(productsRepository.findBySlug).mockResolvedValue(null);
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue(null);
    process.env.NEXT_PUBLIC_SITE_URL = 'https://calio.test';
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'calio-cloud';
  });

  it('returns not found metadata when no item matches', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ id: 'missing' }) }),
    ).resolves.toEqual({
      title: 'Producto no encontrado | CALIO',
    });
  });

  it('builds product metadata with slug fallback to id', async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue({
      ...product,
      slug: null,
      images: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: '12' }),
    });

    expect(metadata).toMatchObject({
      title: 'Collar Perla | CALIO Joyería',
      description: product.description,
      alternates: {
        canonical: 'https://calio.test/productos/12',
      },
      openGraph: {
        url: 'https://calio.test/productos/12',
        images: [
          expect.objectContaining({
            url: 'https://res.cloudinary.com/calio-cloud/image/upload/c_pad,w_1200,h_630/default.jpg',
          }),
        ],
      },
    });
  });

  it('builds laser engraving metadata', async () => {
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue(
      laserEngraving,
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'grabado-nombre-fecha' }),
    });

    expect(metadata).toMatchObject({
      title: 'Nombre y fecha | CALIO Joyería',
      alternates: {
        canonical: 'https://calio.test/productos/grabado-nombre-fecha',
      },
    });
    expect(metadata.keywords).toContain('grabado laser');
  });
});

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsRepository.findById).mockResolvedValue(null);
    vi.mocked(productsRepository.findBySlug).mockResolvedValue(null);
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue(null);
    process.env.NEXT_PUBLIC_SITE_URL = 'https://calio.test';
    process.env.NEXT_PUBLIC_CONTACT_PHONE = '50499999999';
  });

  it('renders product details and cart payloads', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue({
      ...product,
      discount: 10,
      priceWithDiscount: 225,
    });

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'collar-perla' }),
      }),
    );

    expect(screen.getByRole('heading', { name: 'Collar Perla' })).toBeVisible();
    expect(screen.getByText('L225')).toBeVisible();
    expect(screen.getByText('L250')).toBeVisible();
    expect(screen.getByText('10% OFF')).toBeVisible();
    expect(screen.getByText('carousel:collar-perla.jpg')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: ':product:12:Collar Perla',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Solicitar por WhatsApp/ }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('quiero%20solicitar%20este%20producto'),
    );
  });

  it('renders laser engraving details and cart payloads', async () => {
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue(
      laserEngraving,
    );

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'grabado-nombre-fecha' }),
      }),
    );

    expect(
      screen.getByRole('heading', { name: 'Nombre y fecha' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: ':laser-engraving:8:Nombre y fecha',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Solicitar por WhatsApp/ }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('quiero%20solicitar%20este%20grabado'),
    );
  });

  it('uses default public URL and empty contact phone when env vars are absent', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_CONTACT_PHONE;
    vi.mocked(productsRepository.findBySlug).mockResolvedValue(product);

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'collar-perla' }),
      }),
    );

    expect(
      screen.getByRole('link', { name: /Solicitar por WhatsApp/ }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining(
        'https%3A%2F%2Fcaliojoyeria.com%2Fproductos%2Fcollar-perla',
      ),
    );
  });

  it('renders sold out items without request or cart actions', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue({
      ...product,
      quantity: 0,
    });

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'collar-perla' }),
      }),
    );

    expect(screen.getByText('Agotado')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Agregar al carrito/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Solicitar por WhatsApp/ }),
    ).not.toBeInTheDocument();
  });

  it('renders products as sold out when their only unit is in El Progreso', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue({
      ...product,
      quantity: 1,
      inStorePro: true,
    });

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'collar-perla' }),
      }),
    );

    expect(screen.getByText('Agotado')).toBeVisible();
    expect(
      screen.queryByRole('button', {
        name: ':product:12:Collar Perla',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Solicitar por WhatsApp/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Solicitar por Instagram/ }),
    ).not.toBeInTheDocument();
  });

  it('renders El Progreso products when web inventory remains', async () => {
    vi.mocked(productsRepository.findBySlug).mockResolvedValue({
      ...product,
      quantity: 2,
      inStorePro: true,
    });

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'collar-perla' }),
      }),
    );

    expect(screen.queryByText('Agotado')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: ':product:12:Collar Perla',
      }),
    ).toBeVisible();
  });

  it('keeps single-unit laser engravings available online', async () => {
    vi.mocked(laserEngravingsRepository.findBySlug).mockResolvedValue({
      ...laserEngraving,
      quantity: 1,
    });

    render(
      await ProductDetailPage({
        params: Promise.resolve({ id: 'grabado-nombre-fecha' }),
      }),
    );

    expect(screen.queryByText('Agotado')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: ':laser-engraving:8:Nombre y fecha',
      }),
    ).toBeVisible();
  });

  it('calls notFound when no item matches', async () => {
    await expect(
      ProductDetailPage({
        params: Promise.resolve({ id: 'missing' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });
});
