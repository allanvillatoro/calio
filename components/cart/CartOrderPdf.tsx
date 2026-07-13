import { pdf } from '@react-pdf/renderer';
import type { CartItem } from '@/lib/stores/cart.store';
import { CartOrderPdfDocument } from './pdf/CartOrderPdfDocument';
import { DEFAULT_SITE_URL } from './pdf/cart-order-pdf.constants';
import { prepareLogoSrc, preparePdfItems } from './pdf/order-pdf-image.helpers';

export async function createCartOrderPdfBlob(
  items: CartItem[],
  subtotal: number,
) {
  const [pdfItems, logoSrc] = await Promise.all([
    preparePdfItems(items),
    prepareLogoSrc(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  return pdf(
    <CartOrderPdfDocument
      items={pdfItems}
      logoSrc={logoSrc}
      siteUrl={siteUrl}
      subtotal={subtotal}
    />,
  ).toBlob();
}
