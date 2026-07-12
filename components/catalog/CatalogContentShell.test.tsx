import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogContentShell } from './CatalogContentShell';

vi.mock('@/components/catalog/CatalogSearchBar', () => ({
  CatalogSearchBar: ({
    defaultValue,
    onSearch,
  }: {
    defaultValue?: string;
    onSearch: (query: string) => void;
  }) => (
    <div>
      <span>search:{defaultValue ?? ''}</span>
      <button type="button" onClick={() => onSearch('perla')}>
        Buscar
      </button>
    </div>
  ),
}));

describe('CatalogContentShell', () => {
  it('renders title, add button, search bar, content, and dialogs', () => {
    const onAdd = vi.fn();
    const onSearch = vi.fn();

    render(
      <CatalogContentShell
        title="Administrar joyería"
        showAddButton
        showSearchBar
        searchDefaultValue="oro"
        onAdd={onAdd}
        onSearch={onSearch}
        dialogs={<div>dialog-content</div>}
      >
        <div>grid-content</div>
      </CatalogContentShell>,
    );

    expect(screen.getByText('Administrar joyería')).toBeVisible();
    expect(screen.getByText('search:oro')).toBeVisible();
    expect(screen.getByText('grid-content')).toBeVisible();
    expect(screen.getByText('dialog-content')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Agregar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('perla');
  });

  it('hides optional add and search controls', () => {
    render(
      <CatalogContentShell
        title="Explora"
        showAddButton={false}
        showSearchBar={false}
        onAdd={vi.fn()}
        onSearch={vi.fn()}
        dialogs={null}
      >
        <div>grid-content</div>
      </CatalogContentShell>,
    );

    expect(
      screen.queryByRole('button', { name: /Agregar/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('search:')).not.toBeInTheDocument();
    expect(screen.getByText('grid-content')).toBeVisible();
  });
});
