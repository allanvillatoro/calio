import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLaserEngravingsByQuery } from '@/lib/actions/get-laser-engravings-by-query.action';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { AdminLaserEngravingsContent } from './AdminLaserEngravingsContent';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/lib/actions/get-laser-engravings-by-query.action', () => ({
  getLaserEngravingsByQuery: vi.fn(),
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
    <div>
      <button type="button" onClick={() => onSearch('corazon')}>
        Buscar {defaultValue}
      </button>
      <button type="button" onClick={() => onSearch('')}>
        Limpiar búsqueda
      </button>
    </div>
  ),
}));

vi.mock('@/components/catalog/ProductsGrid', () => ({
  ProductsGrid: ({
    products,
    totalProducts,
    currentPage,
    totalPages,
    isLoading,
    onEdit,
    onDelete,
    isAdmin,
    enableCartAction,
    onPageChange,
  }: {
    products: Array<{
      id: string;
      sourceId: string;
      slug?: string | null;
      kind: string;
      name: string;
      description: string;
      price: number;
      discount: number;
      priceWithDiscount: number;
      quantity: number;
      images: string[];
    }>;
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    onEdit: (product?: never) => void;
    onDelete: (product?: never) => void;
    isAdmin: boolean;
    enableCartAction: boolean;
    onPageChange: (page: number) => void;
  }) => (
    <div>
      <p>Admin: {String(isAdmin)}</p>
      <p>Carrito: {String(enableCartAction)}</p>
      <p>Loading: {String(isLoading)}</p>
      <p>Total: {totalProducts}</p>
      <p>
        Page: {currentPage}/{totalPages}
      </p>
      {products.map((product) => (
        <div key={product.name}>
          <span>
            {product.name}:{product.id}:{product.sourceId}:{product.kind}:
            {product.slug}
          </span>
          <button type="button" onClick={() => onEdit(product as never)}>
            Editar {product.name}
          </button>
          <button type="button" onClick={() => onDelete(product as never)}>
            Eliminar {product.name}
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onEdit(undefined)}>
        Editar nada
      </button>
      <button type="button" onClick={() => onDelete(undefined)}>
        Eliminar nada
      </button>
      <button type="button" onClick={() => onPageChange(3)}>
        Ir página 3
      </button>
    </div>
  ),
}));

vi.mock('@/components/admin/LaserEngravingDialog', () => ({
  LaserEngravingDialog: ({
    laserEngraving,
    open,
    onOpenChange,
  }: {
    laserEngraving: { name: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div>
      {open ? `Dialogo ${laserEngraving?.name || 'nuevo grabado'}` : null}
      <button type="button" onClick={() => onOpenChange(false)}>
        Cerrar diálogo
      </button>
    </div>
  ),
}));

vi.mock('@/components/admin/LaserEngravingDeleteDialog', () => ({
  LaserEngravingDeleteDialog: ({
    laserEngraving,
    open,
    onOpenChange,
  }: {
    laserEngraving: { name: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div>
      {open ? `Eliminar ${laserEngraving?.name || 'grabado'}` : null}
      <button type="button" onClick={() => onOpenChange(false)}>
        Cerrar eliminación
      </button>
    </div>
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
          {
            id: 8,
            slug: null,
            name: 'Placa sin slug',
            description: 'Grabado laser sin slug',
            price: 190,
            discount: 0,
            priceWithDiscount: 190,
            quantity: 2,
            images: ['placa-sin-slug.jpg'],
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
    expect(
      screen.getByText(
        'Placa corazon:laser-engraving:7:7:laser-engraving:placa-corazon',
      ),
    ).toBeVisible();
    expect(screen.getByText('Admin: true')).toBeVisible();
    expect(screen.getByText('Carrito: false')).toBeVisible();
    expect(screen.getByText('Loading: false')).toBeVisible();
    expect(screen.getByText('Total: 1')).toBeVisible();
    expect(screen.getByText('Page: 1/1')).toBeVisible();
    expect(
      screen.getByText('Placa sin slug:laser-engraving:8:8:laser-engraving:'),
    ).toBeVisible();
  });

  it('opens create, edit, and delete dialogs', () => {
    render(<AdminLaserEngravingsContent />);

    fireEvent.click(screen.getByRole('button', { name: /Agregar/ }));
    expect(screen.getByText('Dialogo nuevo grabado')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar diálogo' }));

    fireEvent.click(
      screen.getByRole('button', { name: 'Editar Placa corazon' }),
    );
    expect(screen.getByText('Dialogo Placa corazon')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar diálogo' }));

    fireEvent.click(
      screen.getByRole('button', { name: 'Editar Placa sin slug' }),
    );
    expect(screen.getByText('Dialogo Placa sin slug')).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Placa corazon' }),
    );
    expect(screen.getAllByText('Eliminar Placa corazon')[1]).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar eliminación' }));

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Placa sin slug' }),
    );
    expect(screen.getAllByText('Eliminar Placa sin slug')[1]).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Editar nada' }));
    expect(screen.getByText('Dialogo Placa sin slug')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar nada' }));
    expect(screen.getAllByText('Eliminar Placa sin slug')[1]).toBeVisible();
  });

  it('updates URL search params when searching', () => {
    render(<AdminLaserEngravingsContent />);

    fireEvent.click(screen.getByRole('button', { name: /^Buscar/ }));

    expect(updateURL).toHaveBeenCalledWith({
      query: 'corazon',
      pagina: undefined,
    });
  });

  it('builds the admin query and executes the query function', () => {
    vi.mocked(useCatalogFilters).mockReturnValue({
      selectedCategoriesParam: null,
      selectedCategories: [],
      isAllSelected: true,
      query: undefined,
      currentPage: 4,
      inStore: undefined,
      onCategorySelectionChange: vi.fn(),
      onPageChange,
      printView: false,
      updateURL,
    });

    render(<AdminLaserEngravingsContent />);

    expect(useCatalogFilters).toHaveBeenCalledWith([], {
      basePath: '/admin/grabados',
    });
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'laser-engravings',
          {
            query: null,
            page: 4,
            admin: true,
          },
        ],
        queryFn: expect.any(Function),
      }),
    );

    const queryFn = vi.mocked(useQuery).mock.calls[0][0].queryFn;
    queryFn?.({} as never);

    expect(getLaserEngravingsByQuery).toHaveBeenCalledWith({
      query: undefined,
      page: 4,
    });
  });

  it('clears query params when searching with an empty value and delegates pagination', () => {
    vi.mocked(useCatalogFilters).mockReturnValue({
      selectedCategoriesParam: null,
      selectedCategories: [],
      isAllSelected: true,
      query: '',
      currentPage: 2,
      inStore: undefined,
      onCategorySelectionChange: vi.fn(),
      onPageChange,
      printView: false,
      updateURL,
    });

    vi.mocked(useQuery).mockReturnValue({
      isLoading: true,
      data: undefined,
    } as never);

    render(<AdminLaserEngravingsContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ir página 3' }));

    expect(updateURL).toHaveBeenCalledWith({
      query: undefined,
      pagina: undefined,
    });
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByText('Loading: true')).toBeVisible();
    expect(screen.getByText('Total: 0')).toBeVisible();
    expect(screen.getByText('Page: 2/1')).toBeVisible();
  });
});
