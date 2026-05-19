import {
  Document,
  Image as PdfImage,
  Link,
  Page,
  Text,
  View,
} from '@react-pdf/renderer';
import { SOCIAL_PROFILE_LINKS } from '@/lib/constants/social-links';
import { formatPrice } from '@/lib/utils';
import { getProductUrl } from '@/lib/constants/cart-order-pdf';
import type { PdfCartItem } from '@/lib/cart/order-pdf-image.helpers';
import { cartOrderPdfStyles as styles } from './styles';

interface CartOrderPdfDocumentProps {
  items: PdfCartItem[];
  logoSrc?: string;
  siteUrl: string;
  subtotal: number;
}

export function CartOrderPdfDocument({
  items,
  logoSrc,
  siteUrl,
  subtotal,
}: CartOrderPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoSrc ? (
          <View style={styles.logoContainer}>
            <PdfImage src={logoSrc} style={styles.logo} />
          </View>
        ) : null}
        <Text style={styles.title}>Pedido</Text>

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

        <View style={styles.footer}>
          <View style={styles.socialLinks}>
            {SOCIAL_PROFILE_LINKS.map((link) => (
              <Link key={link.href} src={link.href} style={styles.socialLink}>
                {link.label}
              </Link>
            ))}
          </View>
          <Text style={styles.footerText}>
            © 2026 CALIO Joyería. Todos los derechos reservados.
          </Text>
          <Text style={styles.footerText}>San Pedro Sula, Honduras</Text>
        </View>
      </Page>
    </Document>
  );
}
