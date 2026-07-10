import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLaserEngravingsByQuery } from '@/lib/actions/get-laser-engravings-by-query.action';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { CatalogItem } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import LaserEngravingsCatalogContent from './LaserEngravingsCatalogContent';

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
      <span>search:{defaultValue ?? ''}</span>
      <button type="button" onClick={() => onSearch('fecha')}>
        Buscar fecha
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
    enableCartAction,
    onPageChange,
    onEdit,
    onDelete,
  }: {
    products: CatalogItem[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    isAdmin: boolean;
    enableCartAction?: boolean;
    onPageChange: (page: number) => void;
    onEdit: (product?: CatalogItem) => void;
    onDelete: (product?: CatalogItem) => void;
  }) => (
    <div>
      <span>grid-loading:{String(isLoading)}</span>
      <span>grid-admin:{String(isAdmin)}</span>
      <span>grid-cart:{String(enableCartAction)}</span>
      <span>grid-total:{totalProducts}</span>
      <span>
        grid-page:{currentPage}/{totalPages}
      </span>
      {products.map((product) => (
        <span key={product.id}>
          {product.name}:{product.kind}:{product.slug}
        </span>
      ))}
      <button type="button" onClick={() => onPageChange(2)}>
        Ir página 2
      </button>
      <button type="button" onClick={() => onEdit(products[0])}>
        Editar primer grabado
      </button>
      <button type="button" onClick={() => onDelete(products[0])}>
        Eliminar primer grabado
      </button>
    </div>
  ),
}));

const laserEngraving: ILaserEngraving = {
  id: 12,
  slug: 'grabado-nombre-fecha',
  name: 'Nombre y fecha',
  description: 'Grabado laser con nombre y fecha especial',
  price: 150,
  discount: 0,
  priceWithDiscount: 150,
  quantity: 8,
  images: ['grabado-nombre-fecha.jpg'],
  createdAt: new Date('2026-01-15T12:00:00.000Z'),
  updatedAt: new Date('2026-01-16T12:00:00.000Z'),
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

describe('LaserEngravingsCatalogContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogFilters();
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false,
      data: {
        data: [laserEngraving],
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

  it('builds the laser engravings query from catalog filters and renders items', () => {
    mockCatalogFilters({
      query: 'Fecha',
      currentPage: 3,
    });

    render(<LaserEngravingsCatalogContent />);

    expect(useCatalogFilters).toHaveBeenCalledWith([], {
      basePath: '/grabados',
    });
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: [
          'laser-engravings',
          {
            query: 'fecha',
            page: 3,
          },
        ],
        queryFn: expect.any(Function),
      }),
    );

    const queryFn = vi.mocked(useQuery).mock.calls[0][0].queryFn;
    queryFn?.({} as never);
    expect(getLaserEngravingsByQuery).toHaveBeenCalledWith({
      query: 'Fecha',
      page: 3,
    });
    expect(screen.getByText('Resultados para "Fecha"')).toBeVisible();
    expect(
      screen.getByText('Nombre y fecha:laser-engraving:grabado-nombre-fecha'),
    ).toBeVisible();
  });

  it('renders the default laser engravings title', () => {
    render(<LaserEngravingsCatalogContent />);

    expect(screen.getByText('Explora nuestros grabados')).toBeVisible();
  });

  it('updates URL when searching and clearing search', () => {
    render(<LaserEngravingsCatalogContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Buscar fecha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(updateURL).toHaveBeenNthCalledWith(1, {
      query: 'fecha',
      pagina: undefined,
    });
    expect(updateURL).toHaveBeenNthCalledWith(2, {
      query: undefined,
      pagina: undefined,
    });
  });

  it('passes pagination and enables cart actions for laser engravings', () => {
    render(<LaserEngravingsCatalogContent />);

    expect(screen.getByText('grid-admin:false')).toBeVisible();
    expect(screen.getByText('grid-cart:true')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Ir página 2' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Editar primer grabado' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar primer grabado' }),
    );

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('passes loading state and fallback paging while items are unavailable', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: true,
      data: undefined,
    } as never);

    render(<LaserEngravingsCatalogContent />);

    expect(screen.getByText('grid-loading:true')).toBeVisible();
    expect(screen.getByText('grid-total:0')).toBeVisible();
    expect(screen.getByText('grid-page:1/1')).toBeVisible();
  });
});
