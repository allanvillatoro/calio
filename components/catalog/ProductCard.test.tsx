import { fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/lib/stores/cart.store';
import ProductCard from './ProductCard';

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const product: Product = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 20,
  priceWithDiscount: 200,
  quantity: 1,
  images: ['collar-perla.jpg'],
  category: 'collares',
  inStore: true,
};

function renderProductCard({
  isAdmin = false,
  onEdit = vi.fn(),
  onDelete = vi.fn(),
}: {
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
} = {}) {
  render(
    <ProductCard
      product={product}
      isAdmin={isAdmin}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  );

  return {
    onEdit,
    onDelete,
  };
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [] });
  });

  it('renders product details, discount, and product link', () => {
    renderProductCard();

    expect(screen.getByRole('link')).toHaveAttribute('href', '/productos/12');
    expect(screen.getByText('Collar Perla')).toBeVisible();
    expect(screen.getByText('Collar dorado con dije de perla')).toBeVisible();
    expect(screen.getByText('L200')).toBeVisible();
    expect(screen.getByText('L250')).toBeVisible();
    expect(screen.getAllByText('-20%')).toHaveLength(2);
  });

  it('adds a product to the cart from the card action', () => {
    renderProductCard();

    fireEvent.click(
      screen.getByRole('button', { name: 'Agregar Collar Perla al carrito' }),
    );

    expect(useCartStore.getState().items[0]).toEqual({
      product,
      quantity: 1,
    });
    expect(toast.success).toHaveBeenCalledWith('Producto agregado al carrito');
  });

  it('shows admin controls and calls edit/delete handlers', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderProductCard({
      isAdmin: true,
      onEdit,
      onDelete,
    });

    expect(screen.getByText('Stock: 1')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Editar Collar Perla' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Collar Perla' }),
    );

    expect(onEdit).toHaveBeenCalledWith(product);
    expect(onDelete).toHaveBeenCalledWith(product);
  });
});
