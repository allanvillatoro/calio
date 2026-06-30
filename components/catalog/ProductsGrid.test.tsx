import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import { ProductsGrid } from './ProductsGrid';

vi.mock('@/components/catalog/ProductCard', () => ({
  default: ({
    product,
    isAdmin,
    onEdit,
    onDelete,
  }: {
    product: Product;
    isAdmin: boolean;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
  }) => (
    <article>
      <span>{product.name}</span>
      <span>admin:{String(isAdmin)}</span>
      <button type="button" onClick={() => onEdit(product)}>
        Editar {product.name}
      </button>
      <button type="button" onClick={() => onDelete(product)}>
        Eliminar {product.name}
      </button>
    </article>
  ),
}));

vi.mock('./PaginationControls', () => ({
  PaginationControls: ({
    currentPage,
    totalPages,
    totalProducts,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    onPageChange: (page: number) => void;
  }) => (
    <div>
      <span>
        pagination:{currentPage}/{totalPages}:{totalProducts}
      </span>
      <button type="button" onClick={() => onPageChange(2)}>
        Ir a página 2
      </button>
    </div>
  ),
}));

vi.mock('./EmptyState', () => ({
  EmptyState: () => <div>No hay productos</div>,
}));

vi.mock('./ProductsGridSkeleton', () => ({
  ProductsGridSkeleton: () => <div>Cargando productos</div>,
}));

const products: Product[] = [
  {
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
  },
  {
    id: 18,
    name: 'Anillo Luna',
    description: 'Anillo plateado ajustable',
    price: 180,
    discount: 10,
    priceWithDiscount: 162,
    quantity: 3,
    images: ['anillo-luna.jpg'],
    category: 'anillos',
    inStore: false,
  },
];

function renderProductsGrid(
  overrides: Partial<React.ComponentProps<typeof ProductsGrid>> = {},
) {
  const props: React.ComponentProps<typeof ProductsGrid> = {
    products,
    totalProducts: 16,
    currentPage: 1,
    totalPages: 2,
    isLoading: false,
    onPageChange: vi.fn(),
    isAdmin: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };

  render(<ProductsGrid {...props} />);

  return props;
}

describe('ProductsGrid', () => {
  it('renders the loading skeleton while products are loading', () => {
    renderProductsGrid({
      isLoading: true,
      products: [],
    });

    expect(screen.getByText('Cargando productos')).toBeVisible();
    expect(screen.queryByText('No hay productos')).not.toBeInTheDocument();
    expect(screen.queryByText('pagination:1/2:16')).not.toBeInTheDocument();
  });

  it('renders the empty state when there are no products', () => {
    renderProductsGrid({
      products: [],
      totalProducts: 0,
      totalPages: 0,
    });

    expect(screen.getByText('No hay productos')).toBeVisible();
    expect(screen.queryByText('Cargando productos')).not.toBeInTheDocument();
    expect(screen.queryByText(/pagination:/)).not.toBeInTheDocument();
  });

  it('renders product cards and pagination details', () => {
    renderProductsGrid({
      currentPage: 2,
      totalPages: 4,
      totalProducts: 32,
      isAdmin: true,
    });

    expect(screen.getByText('Collar Perla')).toBeVisible();
    expect(screen.getByText('Anillo Luna')).toBeVisible();
    expect(screen.getAllByText('admin:true')).toHaveLength(2);
    expect(screen.getByText('pagination:2/4:32')).toBeVisible();
  });

  it('delegates product and pagination actions to the provided handlers', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onPageChange = vi.fn();
    renderProductsGrid({
      onEdit,
      onDelete,
      onPageChange,
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Editar Collar Perla' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Anillo Luna' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ir a página 2' }));

    expect(onEdit).toHaveBeenCalledWith(products[0]);
    expect(onDelete).toHaveBeenCalledWith(products[1]);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
