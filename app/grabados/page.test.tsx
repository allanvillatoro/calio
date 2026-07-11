import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LaserEngravingsPage, { metadata } from './page';

vi.mock('@/components/catalog/LaserEngravingsCatalogContent', () => ({
  default: () => <div>Catálogo de grabados</div>,
}));

describe('LaserEngravingsPage', () => {
  it('defines SEO metadata for the public laser engravings catalog', () => {
    expect(metadata).toMatchObject({
      title: 'Catálogo de Grabados Láser | CALIO Joyería',
      description:
        'Explora nuestros grabados láser para personalizar joyas CALIO.',
      openGraph: {
        title: 'Grabados Láser | CALIO Joyería',
        description:
          'Explora muestras de grabado láser para personalizar joyas',
        type: 'website',
      },
    });
    expect(metadata.alternates?.canonical).toEqual(
      expect.stringMatching(/\/grabados$/),
    );
  });

  it('renders the laser engravings catalog content', () => {
    render(<LaserEngravingsPage />);

    expect(screen.getByText('Catálogo de grabados')).toBeVisible();
  });
});
