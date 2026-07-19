import type { CatalogItemKind } from '@/lib/types';

interface OnlineAvailabilityItem {
  kind: CatalogItemKind;
  quantity: number;
  inStorePro?: boolean;
}

export function getWebAvailableQuantity(product: OnlineAvailabilityItem) {
  const reservedQuantity =
    product.kind === 'product' && product.inStorePro ? 1 : 0;

  return Math.max(0, product.quantity - reservedQuantity);
}
