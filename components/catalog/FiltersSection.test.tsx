import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category } from '@/lib/types';
import { FiltersSection } from './FiltersSection';

const categories: Category[] = ['collares', 'anillos', 'rebajas'];

function renderFiltersSection({
  selectedCategories = ['collares'],
  isOpen = false,
  onToggleOpen = vi.fn(),
  onSelectionChange = vi.fn(),
}: {
  selectedCategories?: Category[];
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onSelectionChange?: (categories: Category[]) => void;
} = {}) {
  render(
    <FiltersSection
      categories={categories}
      selectedCategories={selectedCategories}
      isAllSelected={selectedCategories.length === 0}
      isOpen={isOpen}
      onToggleOpen={onToggleOpen}
      onSelectionChange={onSelectionChange}
    />,
  );

  return {
    onToggleOpen,
    onSelectionChange,
  };
}

describe('FiltersSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders categories and selected checkbox state', () => {
    renderFiltersSection();

    expect(screen.getByText('Categorías')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'collares' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'anillos' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'rebajas' })).not.toBeChecked();
  });

  it('toggles mobile filter visibility indicator and content class', () => {
    const { onToggleOpen } = renderFiltersSection({
      isOpen: false,
    });

    expect(screen.getByText('+')).toBeVisible();
    expect(screen.getByText('Categorías').closest('div')).toHaveClass('hidden');

    fireEvent.click(screen.getByRole('button', { name: /Filtros/ }));

    expect(onToggleOpen).toHaveBeenCalled();
  });

  it('shows opened content when filters are open', () => {
    renderFiltersSection({
      isOpen: true,
    });

    expect(screen.getByText('−')).toBeVisible();
    expect(screen.getByText('Categorías').closest('div')).toHaveClass('block');
  });

  it('debounces category selection changes', () => {
    const { onSelectionChange } = renderFiltersSection();

    fireEvent.click(screen.getByRole('checkbox', { name: 'anillos' }));

    expect(screen.getByRole('checkbox', { name: 'anillos' })).toBeChecked();
    expect(onSelectionChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(onSelectionChange).toHaveBeenCalledWith(['collares', 'anillos']);
  });
});
