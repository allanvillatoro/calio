export interface ProductStoreAvailability {
  quantity: number;
  inStoreSps?: boolean;
  inStorePro?: boolean;
}

export function getProductStoreAvailabilityError({
  quantity,
  inStoreSps = false,
  inStorePro = false,
}: ProductStoreAvailability): string | null {
  if (quantity === 0 && (inStoreSps || inStorePro)) {
    return 'Un producto sin existencias no puede estar disponible en tiendas';
  }

  if (quantity === 1 && inStoreSps && inStorePro) {
    return 'Con una sola unidad, el producto solo puede estar disponible en una tienda';
  }

  return null;
}
