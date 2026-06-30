import { fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore, type CartProduct } from '@/lib/stores/cart.store';
import AddToCartButton from './AddToCartButton';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const product: CartProduct = {
  id: 12,
  name: 'Collar Perla',
  description: 'Collar dorado con dije de perla',
  price: 250,
  discount: 0,
  priceWithDiscount: 250,
  quantity: 1,
  images: ['collar-perla.jpg'],
  category: 'collares',
  inStore: true,
};

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [] });
  });

  it('adds the product to the cart and shows success feedback', () => {
    render(<AddToCartButton product={product} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Agregar Collar Perla al carrito' }),
    );

    expect(useCartStore.getState().items).toEqual([
      {
        product,
        quantity: 1,
      },
    ]);
    expect(toast.success).toHaveBeenCalledWith('Producto agregado al carrito');
  });

  it('shows an error when the product cannot be added', () => {
    useCartStore.getState().addProduct(product);
    render(<AddToCartButton product={product} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Agregar Collar Perla al carrito' }),
    );

    expect(toast.error).toHaveBeenCalledWith(
      'Ya no se puede agregar más de este producto',
    );
  });
});
