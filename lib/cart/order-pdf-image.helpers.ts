import type { CartItem } from '@/lib/stores/cart.store';
import { getImageUrl } from '@/lib/utils';
import { LOGO_PATH } from '@/lib/constants/cart-order-pdf';

const IMAGE_LOAD_ERROR = 'No se pudo cargar la imagen para el PDF';
const IMAGE_PREPARE_ERROR = 'No se pudo preparar la imagen para el PDF';

export type PdfCartItem = CartItem & {
  imageSrc?: string;
};

export function loadImageAsPngDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const { naturalWidth, naturalHeight } = image;

      if (!naturalWidth || !naturalHeight) {
        reject(new Error(IMAGE_PREPARE_ERROR));
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error(IMAGE_PREPARE_ERROR));
        return;
      }

      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => {
      reject(new Error(IMAGE_LOAD_ERROR));
    };

    image.src = src;
  });
}

export async function preparePdfItems(
  items: CartItem[],
): Promise<PdfCartItem[]> {
  return Promise.all(
    items.map(async (item) => {
      const mainImage = item.product.images[0];

      if (!mainImage) {
        return item;
      }

      try {
        return {
          ...item,
          imageSrc: await loadImageAsPngDataUrl(getImageUrl(mainImage)),
        };
      } catch {
        return item;
      }
    }),
  );
}

export async function prepareLogoSrc() {
  try {
    return await loadImageAsPngDataUrl(LOGO_PATH);
  } catch {
    return undefined;
  }
}
