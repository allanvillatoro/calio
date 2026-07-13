import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the empty catalog message', () => {
    render(<EmptyState />);

    expect(
      screen.getByText('No se encontraron productos para esta búsqueda.'),
    ).toBeVisible();
  });
});
