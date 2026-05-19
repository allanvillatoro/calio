import {
  Document,
  Image as PdfImage,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import type { CartItem } from '@/lib/stores/cart.store';
import { formatPrice, getImageUrl } from '@/lib/utils';

const DEFAULT_SITE_URL = 'https://caliojoyeria.com';
const IMAGE_LOAD_ERROR = 'No se pudo cargar la imagen para el PDF';
const IMAGE_PREPARE_ERROR = 'No se pudo preparar la imagen para el PDF';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: '#111827',
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 22,
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
  },
  image: {
    height: 72,
    objectFit: 'contain',
    width: 72,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
  },
  price: {
    fontSize: 13,
    fontWeight: 700,
  },
  description: {
    color: '#4b5563',
    lineHeight: 1.4,
  },
  quantity: {
    marginTop: 6,
    fontSize: 12,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#111827',
    borderTopStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    paddingTop: 14,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 700,
  },
});

type PdfCartItem = CartItem & {
  imageSrc?: string;
};

interface CartOrderPdfProps {
  items: PdfCartItem[];
  siteUrl: string;
  subtotal: number;
}

function getProductUrl(siteUrl: string, productId: number) {
  return `${siteUrl.replace(/\/$/, '')}/productos/${productId}`;
}

function CartOrderPdf({ items, siteUrl, subtotal }: CartOrderPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Carrito de compra</Text>

        {items.map(({ product, quantity, imageSrc }) => (
          <View key={product.id} style={styles.item}>
            {product.images[0] && imageSrc ? (
              <PdfImage src={imageSrc} style={styles.image} />
            ) : null}
            <View style={styles.info}>
              <View style={styles.itemHeader}>
                <Link
                  src={getProductUrl(siteUrl, product.id)}
                  style={styles.name}
                >
                  {product.name}
                </Link>
                <Text style={styles.price}>
                  {formatPrice(product.priceWithDiscount)}
                </Text>
              </View>
              <Text style={styles.description}>{product.description}</Text>
              <Text style={styles.quantity}>Cantidad: {quantity}</Text>
            </View>
          </View>
        ))}

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotal}>Subtotal: {formatPrice(subtotal)}</Text>
        </View>
      </Page>
    </Document>
  );
}

function loadImageAsPngDataUrl(src: string): Promise<string> {
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

async function preparePdfItems(items: CartItem[]): Promise<PdfCartItem[]> {
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

export async function createCartOrderPdfBlob(
  items: CartItem[],
  subtotal: number,
) {
  const pdfItems = await preparePdfItems(items);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  return pdf(
    <CartOrderPdf items={pdfItems} siteUrl={siteUrl} subtotal={subtotal} />,
  ).toBlob();
}
