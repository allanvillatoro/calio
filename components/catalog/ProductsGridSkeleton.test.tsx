import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductsGridSkeleton } from './ProductsGridSkeleton';

describe('ProductsGridSkeleton', () => {
  it('renders eight loading placeholders', () => {
    render(<ProductsGridSkeleton />);

    expect(screen.getAllByTestId('products-grid-skeleton-item')).toHaveLength(
      8,
    );
  });
});
