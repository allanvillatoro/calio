import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaginationControls } from './PaginationControls';

describe('PaginationControls', () => {
  it('does not render when there is only one page', () => {
    const { container } = render(
      <PaginationControls
        currentPage={1}
        totalPages={1}
        totalProducts={8}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders page controls and the current page summary', () => {
    render(
      <PaginationControls
        currentPage={2}
        totalPages={3}
        totalProducts={24}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '← Anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '1' })).toBeVisible();
    expect(screen.getByRole('button', { name: '2' })).toHaveClass(
      'bg-gray-900',
      'text-white',
    );
    expect(screen.getByRole('button', { name: '3' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeEnabled();
    expect(screen.getByText('Página 2 de 3 (24 productos)')).toBeVisible();
  });

  it('calls onPageChange for previous, next, and specific page actions', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={2}
        totalPages={4}
        totalProducts={32}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '← Anterior' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 4);
  });

  it('disables previous on the first page and next on the last page', () => {
    const onFirstPageChange = vi.fn();
    const { rerender } = render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        totalProducts={24}
        onPageChange={onFirstPageChange}
      />,
    );

    const previousButton = screen.getByRole('button', { name: '← Anterior' });
    expect(previousButton).toBeDisabled();
    fireEvent.click(previousButton);
    expect(onFirstPageChange).not.toHaveBeenCalled();

    const onLastPageChange = vi.fn();
    rerender(
      <PaginationControls
        currentPage={3}
        totalPages={3}
        totalProducts={24}
        onPageChange={onLastPageChange}
      />,
    );

    const nextButton = screen.getByRole('button', { name: 'Siguiente →' });
    expect(nextButton).toBeDisabled();
    fireEvent.click(nextButton);
    expect(onLastPageChange).not.toHaveBeenCalled();
  });
});
