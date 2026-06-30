import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/lib/stores/cart.store';
import { CartItemRow } from './CartItemRow';

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => {
    delete props.fill;
    delete props.unoptimized;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={src} {...props} />
    );
  },
}));

const item: CartItem = {
  product: {
    id: 12,
    name: 'Collar Perla',
    description: 'Collar dorado con dije de perla',
    price: 250,
    discount: 0,
    priceWithDiscount: 250,
    quantity: 3,
    images: ['collar-perla.jpg'],
    category: 'collares',
    inStore: true,
  },
  quantity: 2,
};

function renderCartItemRow(overrides: Partial<CartItem> = {}) {
  const onDecrement = vi.fn();
  const onIncrement = vi.fn();
  const onRemove = vi.fn();

  render(
    <CartItemRow
      item={{
        ...item,
        ...overrides,
      }}
      onDecrement={onDecrement}
      onIncrement={onIncrement}
      onRemove={onRemove}
    />,
  );

  return {
    onDecrement,
    onIncrement,
    onRemove,
  };
}

describe('CartItemRow', () => {
  it('renders product details and unit price', () => {
    renderCartItemRow();

    expect(
      screen.getByRole('link', { name: 'Ver Collar Perla' }),
    ).toHaveAttribute('href', '/productos/12');
    expect(screen.getByText('Collar Perla')).toBeVisible();
    expect(screen.getByText('Collar dorado con dije de perla')).toBeVisible();
    expect(screen.getByText('L250')).toBeVisible();
  });

  it('decrements when quantity is above one', () => {
    const { onDecrement, onRemove } = renderCartItemRow();

    fireEvent.click(
      screen.getByRole('button', { name: 'Reducir cantidad de Collar Perla' }),
    );

    expect(onDecrement).toHaveBeenCalledWith(12);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('removes the product when quantity is one', () => {
    const { onDecrement, onRemove } = renderCartItemRow({
      quantity: 1,
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Collar Perla del carrito' }),
    );

    expect(onRemove).toHaveBeenCalledWith(12);
    expect(onDecrement).not.toHaveBeenCalled();
  });

  it('disables increment when cart quantity reaches available stock', () => {
    const { onIncrement } = renderCartItemRow({
      quantity: 3,
    });
    const incrementButton = screen.getByRole('button', {
      name: 'Aumentar cantidad de Collar Perla',
    });

    expect(incrementButton).toBeDisabled();
    fireEvent.click(incrementButton);

    expect(onIncrement).not.toHaveBeenCalled();
  });

  it('increments when cart quantity is below available stock', () => {
    const { onIncrement } = renderCartItemRow({
      quantity: 2,
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Aumentar cantidad de Collar Perla' }),
    );

    expect(onIncrement).toHaveBeenCalledWith(12);
  });
});
