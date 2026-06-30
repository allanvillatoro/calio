import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogSearchBar } from './CatalogSearchBar';

describe('CatalogSearchBar', () => {
  it('renders the search input with the default value', () => {
    render(<CatalogSearchBar defaultValue="perla" onSearch={vi.fn()} />);

    expect(
      screen.getByPlaceholderText('Buscar piezas por nombre...'),
    ).toHaveValue('perla');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeVisible();
  });

  it('submits the trimmed query when clicking the search button', () => {
    const onSearch = vi.fn();
    render(<CatalogSearchBar onSearch={onSearch} />);

    fireEvent.change(
      screen.getByPlaceholderText('Buscar piezas por nombre...'),
      {
        target: { value: '  collar perla  ' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('collar perla');
  });

  it('submits the query when pressing Enter', () => {
    const onSearch = vi.fn();
    render(<CatalogSearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Buscar piezas por nombre...');
    fireEvent.change(input, {
      target: { value: 'anillo' },
    });
    fireEvent.keyDown(input, {
      key: 'Enter',
    });

    expect(onSearch).toHaveBeenCalledWith('anillo');
  });

  it('does not submit the query when pressing another key', () => {
    const onSearch = vi.fn();
    render(<CatalogSearchBar onSearch={onSearch} />);

    fireEvent.keyDown(
      screen.getByPlaceholderText('Buscar piezas por nombre...'),
      {
        key: 'Escape',
      },
    );

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('resets the uncontrolled input when the default value changes', () => {
    const { rerender } = render(
      <CatalogSearchBar defaultValue="perla" onSearch={vi.fn()} />,
    );
    const input = screen.getByPlaceholderText('Buscar piezas por nombre...');

    fireEvent.change(input, {
      target: { value: 'texto temporal' },
    });
    expect(input).toHaveValue('texto temporal');

    rerender(<CatalogSearchBar defaultValue="anillo" onSearch={vi.fn()} />);

    expect(
      screen.getByPlaceholderText('Buscar piezas por nombre...'),
    ).toHaveValue('anillo');
  });
});
