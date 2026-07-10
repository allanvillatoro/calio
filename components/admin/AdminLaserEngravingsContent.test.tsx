import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { AdminLaserEngravingsContent } from './AdminLaserEngravingsContent';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/lib/hooks/useCatalogFilters', () => ({
  useCatalogFilters: vi.fn(),
}));

vi.mock('@/components/catalog/CatalogSearchBar', () => ({
  CatalogSearchBar: ({
    defaultValue,
    onSearch,
  }: {
    defaultValue?: string;
    onSearch: (query: string) => void;
  }) => (
    <button type="button" onClick={() => onSearch('corazon')}>
      Buscar {defaultValue}
    </button>
  ),
}));

vi.mock('@/components/catalog/ProductsGrid', () => ({
  ProductsGrid: ({
    products,
    onEdit,
    onDelete,
    isAdmin,
    enableCartAction,
  }: {
    products: Array<{
      name: string;
    }>;
    onEdit: (product: never) => void;
    onDelete: (product: never) => void;
    isAdmin: boolean;
    enableCartAction: boolean;
  }) => (
    <div>
      <p>Admin: {String(isAdmin)}</p>
      <p>Carrito: {String(enableCartAction)}</p>
      {products.map((product) => (
        <div key={product.name}>
          <span>{product.name}</span>
          <button type="button" onClick={() => onEdit(product as never)}>
            Editar {product.name}
          </button>
          <button type="button" onClick={() => onDelete(product as never)}>
            Eliminar {product.name}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/admin/LaserEngravingDialog', () => ({
  LaserEngravingDialog: ({
    laserEngraving,
    open,
  }: {
    laserEngraving: { name: string } | null;
    open: boolean;
  }) => (
    <div>
      {open ? `Dialogo ${laserEngraving?.name || 'nuevo grabado'}` : null}
    </div>
  ),
}));

vi.mock('@/components/admin/LaserEngravingDeleteDialog', () => ({
  LaserEngravingDeleteDialog: ({
    laserEngraving,
    open,
  }: {
    laserEngraving: { name: string } | null;
    open: boolean;
  }) => (
    <div>{open ? `Eliminar ${laserEngraving?.name || 'grabado'}` : null}</div>
  ),
}));

const updateURL = vi.fn();
const onPageChange = vi.fn();

describe('AdminLaserEngravingsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCatalogFilters).mockReturnValue({
      selectedCategoriesParam: null,
      selectedCategories: [],
      isAllSelected: true,
      query: '',
      currentPage: 1,
      inStore: undefined,
      onCategorySelectionChange: vi.fn(),
      onPageChange,
      printView: false,
      updateURL,
    });
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 7,
            slug: 'placa-corazon',
            name: 'Placa corazon',
            description: 'Grabado laser',
            price: 180,
            discount: 0,
            priceWithDiscount: 180,
            quantity: 4,
            images: ['placa.jpg'],
          },
        ],
        paging: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    } as never);
  });

  it('renders laser engraving admin controls without cart actions', () => {
    render(<AdminLaserEngravingsContent />);

    expect(screen.getByRole('button', { name: /Agregar/ })).toBeVisible();
    expect(screen.getByText('Placa corazon')).toBeVisible();
    expect(screen.getByText('Admin: true')).toBeVisible();
    expect(screen.getByText('Carrito: false')).toBeVisible();
  });

  it('opens create, edit, and delete dialogs', () => {
    render(<AdminLaserEngravingsContent />);

    fireEvent.click(screen.getByRole('button', { name: /Agregar/ }));
    expect(screen.getByText('Dialogo nuevo grabado')).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Editar Placa corazon' }),
    );
    expect(screen.getByText('Dialogo Placa corazon')).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Placa corazon' }),
    );
    expect(screen.getAllByText('Eliminar Placa corazon')[1]).toBeVisible();
  });

  it('updates URL search params when searching', () => {
    render(<AdminLaserEngravingsContent />);

    fireEvent.click(screen.getByRole('button', { name: /^Buscar/ }));

    expect(updateURL).toHaveBeenCalledWith({
      query: 'corazon',
      pagina: undefined,
    });
  });
});
