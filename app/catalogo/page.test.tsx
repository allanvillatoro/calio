import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CatalogPage, { metadata } from './page';

vi.mock('@/components/catalog/CatalogContent', () => ({
  default: () => <div>Catálogo de joyas</div>,
}));

describe('CatalogPage', () => {
  it('defines SEO metadata for the jewelry catalog', () => {
    expect(metadata).toMatchObject({
      title: 'Catálogo de Joyas | CALIO Joyería',
      description:
        'Explora nuestra colección completa de joyería. Grabados láser, anillos, collares, aretes y accesorios de diseño exclusivo.',
      openGraph: {
        title: 'Catálogo | CALIO Joyería',
        description: 'Descubre nuestros diseños de joyería',
        type: 'website',
      },
      alternates: {
        canonical: 'https://caliojoyeria.com/catalogo',
      },
    });
  });

  it('renders the jewelry catalog content', () => {
    render(<CatalogPage />);

    expect(screen.getByText('Catálogo de joyas')).toBeVisible();
  });
});
