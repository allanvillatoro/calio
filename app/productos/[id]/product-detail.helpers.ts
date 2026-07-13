import { cache } from 'react';
import { toNumber } from '@/lib/utils';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { IProduct } from '@/lib/interfaces/product';
import type { CartInputItem } from '@/lib/stores/cart.store';
import { laserEngravingsRepository } from '@/lib/repositories/laser-engravings/drizzle-laser-engravings-repository';
import { productsRepository } from '@/lib/repositories/products/drizzle-products-repository';

export type ProductDetailItem =
  | {
      kind: 'product';
      item: IProduct;
    }
  | {
      kind: 'laser-engraving';
      item: ILaserEngraving;
    };

function isNumericId(value: string) {
  return /^\d+$/.test(value);
}

export function getItemPath(detailItem: ProductDetailItem) {
  if (detailItem.kind === 'laser-engraving') {
    return `/productos/${detailItem.item.slug}`;
  }

  return `/productos/${detailItem.item.slug || detailItem.item.id}`;
}

export function getItemCategory(detailItem: ProductDetailItem) {
  return detailItem.kind === 'product'
    ? detailItem.item.category
    : 'grabado laser';
}

export async function resolveProductDetailItem(
  idOrSlug: string,
): Promise<ProductDetailItem | null> {
  if (isNumericId(idOrSlug)) {
    const productById = await productsRepository.findById(toNumber(idOrSlug));

    if (productById) {
      return {
        kind: 'product',
        item: productById,
      };
    }
  }

  const productBySlug = await productsRepository.findBySlug(idOrSlug);

  if (productBySlug) {
    return {
      kind: 'product',
      item: productBySlug,
    };
  }

  const laserEngraving = await laserEngravingsRepository.findBySlug(idOrSlug);

  return laserEngraving
    ? {
        kind: 'laser-engraving',
        item: laserEngraving,
      }
    : null;
}

export const getProductDetailItem = cache(resolveProductDetailItem);

export function getAbsoluteProductUrl(detailItem: ProductDetailItem) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com';

  return `${siteUrl}${getItemPath(detailItem)}`;
}

export function getCartItem(detailItem: ProductDetailItem): CartInputItem {
  if (detailItem.kind === 'product') {
    const { createdAt, updatedAt, ...productForCart } = detailItem.item;
    void createdAt;
    void updatedAt;

    return {
      ...productForCart,
      cartId: `product:${detailItem.item.id}`,
      sourceId: String(detailItem.item.id),
      kind: 'product',
    };
  }

  const { createdAt, updatedAt, ...laserEngravingForCart } = detailItem.item;
  void createdAt;
  void updatedAt;

  return {
    ...laserEngravingForCart,
    id: `laser-engraving:${detailItem.item.id}`,
    sourceId: String(detailItem.item.id),
    kind: 'laser-engraving',
  };
}
