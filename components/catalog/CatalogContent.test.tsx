import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { useAuthStore } from '@/lib/stores/auth.store';
import CatalogContent from './CatalogContent';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/lib/actions/get-products-by-query.action', () => ({
  getProductsByQuery: vi.fn(),
}));

vi.mock('@/lib/hooks/useCatalogFilters', () => ({
  useCatalogFilters: vi.fn(),
}));

vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
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
      <span>search:{defaultValue ?? ''}</span>
      <button type="button" onClick={() => onSearch('perla')}>
        Buscar perla
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
    isAdmin,
    onEdit,
    onDelete,
    onPageChange,
  }: {
    products: Product[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    isAdmin: boolean;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onPageChange: (page: number) => void;
  }) => (
    <div>
      <span>grid-loading:{String(isLoading)}</span>
      <span>grid-admin:{String(isAdmin)}</span>
      <span>grid-total:{totalProducts}</span>
      <span>
        grid-page:{currentPage}/{totalPages}
      </span>
      {products.map((product) => (
        <span key={product.id}>{product.name}</span>
      ))}
      <button type="button" onClick={() => onPageChange(2)}>
        Ir página 2
      </button>
      <button type="button" onClick={() => onEdit(products[0])}>
        Editar grid
      </button>
      <button type="button" onClick={() => onDelete(products[0])}>
        Eliminar grid
      </button>
    </div>
  ),
}));

vi.mock('../admin/ProductDialog', () => ({
  ProductDialog: ({
    open,
    product,
    onOpenChange,
  }: {
    open: boolean;
    product: Product | null;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="product-dialog">
      product-dialog:{String(open)}:{product?.name ?? ''}
      <button type="button" onClick={() => onOpenChange(false)}>
        Cerrar producto
      </button>
    </div>
  ),
}));

vi.mock('../admin/DeleteDialog', () => ({
  DeleteDialog: ({
    open,
    product,
    onOpenChange,
  }: {
    open: boolean;
    product: Product | null;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="delete-dialog">
      delete-dialog:{String(open)}:{product?.name ?? ''}
      <button type="button" onClick={() => onOpenChange(false)}>
        Cerrar eliminar
      </button>
    </div>
  ),
}));

const product: Product = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  priceWithDiscount: 250,
  quantity: 5,
  images: ['collar-perla.jpg'],
  category: 'collares',
  inStore: true,
};

const updateURL = vi.fn();
const onPageChange = vi.fn();

function mockCatalogFilters(
  overrides: Partial<ReturnType<typeof useCatalogFilters>> = {},
) {
  vi.mocked(useCatalogFilters).mockReturnValue({
    selectedCategories: [],
    selectedCategoriesParam: undefined,
    query: undefined,
    currentPage: 1,
    inStore: undefined,
    printView: false,
    isAllSelected: true,
    onCategorySelectionChange: vi.fn(),
    onPageChange,
    updateURL,
    ...overrides,
  });
}

function mockAuthStore(isAuthenticated: boolean) {
  vi.mocked(useAuthStore).mockImplementation((selector) =>
    selector({
      isAuthenticated,
      isLoggingIn: false,
      isLoggingOut: false,
      login: vi.fn(),
      logout: vi.fn(),
      syncAuthState: vi.fn(),
    }),
  );
}

describe('CatalogContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogFilters();
    mockAuthStore(false);
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: {
        data: [product],
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

  it('builds the products query from catalog filters and renders products', () => {
    mockCatalogFilters({
      selectedCategoriesParam: 'collares',
      query: 'Perla',
      currentPage: 3,
      inStore: true,
    });

    render(<CatalogContent />);

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'products',
          {
            category: 'collares',
            query: 'perla',
            instore: true,
            page: 3,
          },
        ],
        queryFn: expect.any(Function),
      }),
    );

    const queryFn = vi.mocked(useQuery).mock.calls[0][0].queryFn;
    queryFn?.({} as never);
    expect(getProductsByQuery).toHaveBeenCalledWith({
      category: 'collares',
      query: 'Perla',
      instore: true,
      page: 3,
    });
    expect(screen.getByText('COLLARES')).toBeVisible();
    expect(screen.getByText('Collar Perla')).toBeVisible();
  });

  it('updates URL when searching and clearing search', () => {
    render(<CatalogContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Buscar perla' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(updateURL).toHaveBeenNthCalledWith(1, {
      query: 'perla',
      categorias: undefined,
      pagina: undefined,
    });
    expect(updateURL).toHaveBeenNthCalledWith(2, {
      query: undefined,
      categorias: 'new in',
      pagina: undefined,
    });
  });

  it('shows admin add button and opens dialogs when authenticated', () => {
    mockAuthStore(true);
    render(<CatalogContent />);

    expect(screen.getByText('grid-admin:true')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Agregar/ }));
    expect(screen.getByTestId('product-dialog')).toHaveTextContent(
      'product-dialog:true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar grid' }));
    expect(screen.getByTestId('product-dialog')).toHaveTextContent(
      'product-dialog:true:Collar Perla',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar grid' }));
    expect(screen.getByTestId('delete-dialog')).toHaveTextContent(
      'delete-dialog:true:Collar Perla',
    );
  });

  it('hides admin and search controls in print view', () => {
    mockAuthStore(true);
    mockCatalogFilters({
      printView: true,
    });

    render(<CatalogContent />);

    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument();
    expect(screen.queryByText('search:')).not.toBeInTheDocument();
    expect(screen.getByText('grid-admin:false')).toBeVisible();
  });

  it('delegates pagination changes to catalog filters', () => {
    render(<CatalogContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Ir página 2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
