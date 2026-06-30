import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore, type CartProduct } from './cart.store';

function createCartProduct(overrides: Partial<CartProduct> = {}): CartProduct {
  return {
    id: 1,
    name: 'Anillo Aurora',
    description: 'Anillo ajustable con detalle dorado',
    price: 250,
    discount: 0,
    priceWithDiscount: 250,
    quantity: 3,
    images: ['anillo-aurora.jpg'],
    category: 'anillos',
    inStore: true,
    ...overrides,
  };
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    window.localStorage.clear();
  });

  it('adds an available product to the cart', () => {
    const product = createCartProduct();

    const added = useCartStore.getState().addProduct(product);

    expect(added).toBe(true);
    expect(useCartStore.getState().items).toEqual([
      {
        product,
        quantity: 1,
      },
    ]);
  });

  it('returns false when adding an out-of-stock product', () => {
    const product = createCartProduct({
      quantity: 0,
    });

    const added = useCartStore.getState().addProduct(product);

    expect(added).toBe(false);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('increments an existing product while stock is available', () => {
    const product = createCartProduct({
      quantity: 2,
    });

    useCartStore.getState().addProduct(product);
    const incremented = useCartStore.getState().incrementProduct(product.id);

    expect(incremented).toBe(true);
    expect(useCartStore.getState().items[0]).toEqual({
      product,
      quantity: 2,
    });
  });

  it('returns false when incrementing beyond available quantity', () => {
    const product = createCartProduct({
      quantity: 1,
    });

    useCartStore.getState().addProduct(product);
    const incremented = useCartStore.getState().incrementProduct(product.id);

    expect(incremented).toBe(false);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('returns false when incrementing a missing product', () => {
    const incremented = useCartStore.getState().incrementProduct(999);

    expect(incremented).toBe(false);
  });

  it('decrements a product quantity above one', () => {
    const product = createCartProduct({
      quantity: 2,
    });

    useCartStore.getState().addProduct(product);
    useCartStore.getState().addProduct(product);
    const decremented = useCartStore.getState().decrementProduct(product.id);

    expect(decremented).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('returns false when decrementing a product at quantity one', () => {
    const product = createCartProduct();

    useCartStore.getState().addProduct(product);
    const decremented = useCartStore.getState().decrementProduct(product.id);

    expect(decremented).toBe(false);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('removes products by id', () => {
    const firstProduct = createCartProduct({ id: 1 });
    const secondProduct = createCartProduct({
      id: 2,
      name: 'Collar Perla',
      category: 'collares',
    });

    useCartStore.getState().addProduct(firstProduct);
    useCartStore.getState().addProduct(secondProduct);
    useCartStore.getState().removeProduct(firstProduct.id);

    expect(useCartStore.getState().items).toEqual([
      {
        product: secondProduct,
        quantity: 1,
      },
    ]);
  });

  it('clears all cart items', () => {
    useCartStore.getState().addProduct(createCartProduct({ id: 1 }));
    useCartStore.getState().addProduct(createCartProduct({ id: 2 }));

    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('returns the total quantity of cart items', () => {
    const firstProduct = createCartProduct({ id: 1, quantity: 3 });
    const secondProduct = createCartProduct({ id: 2, quantity: 2 });

    useCartStore.getState().addProduct(firstProduct);
    useCartStore.getState().addProduct(firstProduct);
    useCartStore.getState().addProduct(secondProduct);

    expect(useCartStore.getState().getTotalItems()).toBe(3);
  });

  it('persists cart state under the calio-cart key', () => {
    const product = createCartProduct();

    useCartStore.getState().addProduct(product);

    const persistedCart = window.localStorage.getItem('calio-cart');
    expect(persistedCart).not.toBeNull();
    expect(JSON.parse(persistedCart ?? '{}')).toMatchObject({
      state: {
        items: [
          {
            product,
            quantity: 1,
          },
        ],
      },
    });
  });
});
