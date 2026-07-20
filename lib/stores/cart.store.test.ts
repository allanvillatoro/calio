import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore, type CartItem, type CartProduct } from './cart.store';

function createCartProduct(overrides: Partial<CartProduct> = {}): CartProduct {
  return {
    id: 1,
    cartId: 'product:1',
    sourceId: '1',
    kind: 'product',
    name: 'Anillo Aurora',
    description: 'Anillo ajustable con detalle dorado',
    price: 250,
    discount: 0,
    priceWithDiscount: 250,
    quantity: 3,
    images: ['anillo-aurora.jpg'],
    category: 'anillos',
    inStoreSps: true,
    inStorePro: false,
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

  it('increments only the matching item when multiple cart entries exist', () => {
    const firstProduct = createCartProduct({
      id: 1,
      quantity: 3,
    });
    const secondProduct = createCartProduct({
      id: 2,
      cartId: 'product:2',
      sourceId: '2',
      name: 'Collar Perla',
      quantity: 3,
      category: 'collares',
    });

    useCartStore.getState().addItem(firstProduct);
    useCartStore.getState().addItem(secondProduct);
    const incremented = useCartStore.getState().addItem(firstProduct);

    expect(incremented).toBe(true);
    expect(useCartStore.getState().items).toEqual([
      {
        product: firstProduct,
        quantity: 2,
      },
      {
        product: secondProduct,
        quantity: 1,
      },
    ]);
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

  it('reserves one El Progreso unit from the web cart', () => {
    const product = createCartProduct({
      quantity: 2,
      inStorePro: true,
    });

    const added = useCartStore.getState().addProduct(product);
    const incremented = useCartStore.getState().incrementProduct(product.id);

    expect(added).toBe(true);
    expect(incremented).toBe(false);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('does not add a product when its only unit is reserved for El Progreso', () => {
    const product = createCartProduct({
      quantity: 1,
      inStorePro: true,
    });

    const added = useCartStore.getState().addProduct(product);

    expect(added).toBe(false);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('does not reserve physical-store units from laser engravings', () => {
    const laserEngraving = createCartProduct({
      cartId: 'laser-engraving:1',
      kind: 'laser-engraving',
      quantity: 2,
      inStorePro: true,
    });

    useCartStore.getState().addItem(laserEngraving);
    const incremented = useCartStore
      .getState()
      .incrementItem(laserEngraving.cartId);

    expect(incremented).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
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

  it('decrements only the matching item when multiple cart entries exist', () => {
    const firstProduct = createCartProduct({
      id: 1,
      quantity: 3,
    });
    const secondProduct = createCartProduct({
      id: 2,
      cartId: 'product:2',
      sourceId: '2',
      name: 'Collar Perla',
      quantity: 3,
      category: 'collares',
    });

    useCartStore.getState().addItem(firstProduct);
    useCartStore.getState().addItem(firstProduct);
    useCartStore.getState().addItem(secondProduct);
    useCartStore.getState().addItem(secondProduct);
    const decremented = useCartStore.getState().decrementItem('product:1');

    expect(decremented).toBe(true);
    expect(useCartStore.getState().items).toEqual([
      {
        product: firstProduct,
        quantity: 1,
      },
      {
        product: secondProduct,
        quantity: 2,
      },
    ]);
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
      cartId: 'product:2',
      sourceId: '2',
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
    const secondProduct = createCartProduct({
      id: 2,
      cartId: 'product:2',
      sourceId: '2',
      quantity: 2,
    });

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

  it('keeps products and laser engravings with the same source id as separate cart items', () => {
    const product = createCartProduct({ id: 1 });
    const laserEngraving = {
      id: 'laser-engraving:1',
      sourceId: '1',
      slug: 'grabado-nombre-fecha',
      kind: 'laser-engraving' as const,
      name: 'Nombre y fecha',
      description: 'Grabado laser con nombre y fecha especial',
      price: 150,
      discount: 0,
      priceWithDiscount: 150,
      quantity: 2,
      images: ['grabado-nombre-fecha.jpg'],
    };

    useCartStore.getState().addProduct(product);
    useCartStore.getState().addProduct(laserEngraving);

    expect(useCartStore.getState().items).toHaveLength(2);
    expect(
      useCartStore.getState().items.map((item) => item.product.cartId),
    ).toEqual(['product:1', 'laser-engraving:1']);
  });

  it('adds plain product inputs using product cart ids', () => {
    const product = {
      id: 9,
      slug: 'anillo-luna',
      name: 'Anillo Luna',
      description: 'Anillo plateado',
      price: 220,
      discount: 0,
      priceWithDiscount: 220,
      quantity: 2,
      images: ['anillo-luna.jpg'],
      category: 'anillos' as const,
      inStoreSps: false,
      inStorePro: false,
    };

    const added = useCartStore.getState().addItem(product);

    expect(added).toBe(true);
    expect(useCartStore.getState().items[0].product).toMatchObject({
      cartId: 'product:9',
      sourceId: '9',
      kind: 'product',
    });
  });

  it('decrements and removes items by cart id for non-product cart entries', () => {
    const laserEngraving = createCartProduct({
      id: 1,
      cartId: 'laser-engraving:1',
      kind: 'laser-engraving',
      quantity: 3,
      category: undefined,
    });

    useCartStore.getState().addItem(laserEngraving);
    useCartStore.getState().addItem(laserEngraving);

    expect(useCartStore.getState().decrementItem('laser-engraving:1')).toBe(
      true,
    );
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    useCartStore.getState().removeItem('laser-engraving:1');

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('returns false when decrementing a missing item by cart id', () => {
    expect(useCartStore.getState().decrementItem('missing')).toBe(false);
  });

  it('normalizes persisted legacy items during migration', async () => {
    const legacyProduct = {
      id: 3,
      name: 'Pulsera Legacy',
      description: 'Pulsera dorada',
      price: 120,
      discount: 0,
      priceWithDiscount: 120,
      quantity: 2,
      images: ['pulsera.jpg'],
      category: 'pulseras',
      inStoreSps: false,
      inStorePro: false,
    };
    window.localStorage.setItem(
      'calio-cart',
      JSON.stringify({
        state: {
          items: [
            {
              product: legacyProduct,
              quantity: 1,
            },
          ] as unknown as CartItem[],
        },
        version: 0,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items[0].product).toMatchObject({
      cartId: 'product:3',
      sourceId: '3',
      kind: 'product',
    });
  });

  it('defaults to an empty cart when migrating persisted state without items', async () => {
    window.localStorage.setItem(
      'calio-cart',
      JSON.stringify({
        state: {},
        version: 0,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items).toEqual([]);
  });
});
