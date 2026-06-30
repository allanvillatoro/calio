import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/lib/stores/cart.store';
import {
  loadImageAsPngDataUrl,
  prepareLogoSrc,
  preparePdfItems,
} from './order-pdf-image.helpers';

vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...(actual as object),
    getImageUrl: vi.fn((filename: string) => `https://cdn.test/${filename}`),
  };
});

type ImageBehavior = 'load' | 'error' | 'empty';

let imageBehavior: ImageBehavior = 'load';
const drawImage = vi.fn();
const getContext = vi.fn(() => ({
  drawImage,
}));
const toDataURL = vi.fn(() => 'data:image/png;base64,converted');

class FakeImage {
  crossOrigin = '';
  naturalWidth = 100;
  naturalHeight = 80;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    if (imageBehavior === 'error') {
      queueMicrotask(() => this.onerror?.());
      return;
    }

    if (imageBehavior === 'empty') {
      this.naturalWidth = 0;
      this.naturalHeight = 0;
    }

    queueMicrotask(() => this.onload?.());
  }
}

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product: {
      id: 1,
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
    quantity: 2,
    ...overrides,
  };
}

describe('order PDF image helpers', () => {
  beforeEach(() => {
    imageBehavior = 'load';
    vi.clearAllMocks();
    vi.stubGlobal('Image', FakeImage);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext,
          toDataURL,
        } as unknown as HTMLCanvasElement;
      }

      return document.createElement(tagName);
    });
  });

  it('loads an image into a PNG data URL', async () => {
    const dataUrl = await loadImageAsPngDataUrl('https://cdn.test/image.jpg');

    expect(dataUrl).toBe('data:image/png;base64,converted');
    expect(getContext).toHaveBeenCalledWith('2d');
    expect(drawImage).toHaveBeenCalledWith(expect.any(FakeImage), 0, 0);
    expect(toDataURL).toHaveBeenCalledWith('image/png');
  });

  it('rejects when the image cannot be loaded', async () => {
    imageBehavior = 'error';

    await expect(
      loadImageAsPngDataUrl('https://cdn.test/missing.jpg'),
    ).rejects.toThrow('No se pudo cargar la imagen para el PDF');
  });

  it('rejects when the image has no natural dimensions', async () => {
    imageBehavior = 'empty';

    await expect(
      loadImageAsPngDataUrl('https://cdn.test/empty.jpg'),
    ).rejects.toThrow('No se pudo preparar la imagen para el PDF');
  });

  it('adds imageSrc to cart items with images', async () => {
    const item = createCartItem();

    const [preparedItem] = await preparePdfItems([item]);

    expect(preparedItem).toEqual({
      ...item,
      imageSrc: 'data:image/png;base64,converted',
    });
  });

  it('keeps cart items without images unchanged', async () => {
    const item = createCartItem({
      product: {
        ...createCartItem().product,
        images: [],
      },
    });

    const [preparedItem] = await preparePdfItems([item]);

    expect(preparedItem).toBe(item);
  });

  it('keeps cart items unchanged when image preparation fails', async () => {
    imageBehavior = 'error';
    const item = createCartItem();

    const [preparedItem] = await preparePdfItems([item]);

    expect(preparedItem).toBe(item);
  });

  it('prepares the logo source when the logo image loads', async () => {
    const logoSrc = await prepareLogoSrc();

    expect(logoSrc).toBe('data:image/png;base64,converted');
  });

  it('returns undefined when the logo image cannot be prepared', async () => {
    imageBehavior = 'error';

    const logoSrc = await prepareLogoSrc();

    expect(logoSrc).toBeUndefined();
  });
});
