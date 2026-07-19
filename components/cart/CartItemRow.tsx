import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/lib/stores/cart.store';
import { getWebAvailableQuantity } from '@/lib/products/online-availability';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItem;
  onDecrement: (cartId: string) => void;
  onIncrement: (cartId: string) => void;
  onRemove: (cartId: string) => void;
}

export function CartItemRow({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemRowProps) {
  const { product, quantity } = item;
  const canIncrease = quantity < getWebAvailableQuantity(product);
  const productHref = `/productos/${product.slug || product.sourceId}`;

  return (
    <div className="grid grid-cols-[96px_1fr_auto] gap-4 p-4 sm:grid-cols-[120px_1fr_120px] sm:items-start md:gap-6 md:p-6">
      <Link
        href={productHref}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-white"
        aria-label={`Ver ${product.name}`}
      >
        <Image
          src={getImageUrl(product.images[0])}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 96px, 120px"
        />
      </Link>

      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <Link
            href={productHref}
            className="block text-base font-semibold leading-snug text-gray-900 hover:text-gray-700 sm:text-lg"
          >
            {product.name}
          </Link>
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>
        </div>

        <div className="inline-flex h-10 items-center overflow-hidden rounded-full border-2 border-gray-900 bg-white">
          {quantity > 1 ? (
            <button
              type="button"
              className="flex size-10 items-center justify-center text-gray-900 transition-colors hover:bg-gray-100"
              onClick={() => onDecrement(product.cartId)}
              aria-label={`Reducir cantidad de ${product.name}`}
            >
              <Minus className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              className="flex size-10 items-center justify-center text-gray-900 transition-colors hover:bg-gray-100"
              onClick={() => onRemove(product.cartId)}
              aria-label={`Eliminar ${product.name} del carrito`}
            >
              <Trash2 className="size-4" />
            </button>
          )}

          <span className="flex min-w-10 items-center justify-center px-2 text-base font-semibold text-gray-900">
            {quantity}
          </span>

          <button
            type="button"
            className="flex size-10 items-center justify-center text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
            onClick={() => onIncrement(product.cartId)}
            disabled={!canIncrease}
            aria-label={`Aumentar cantidad de ${product.name}`}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <p className="text-right text-lg font-bold text-gray-900 sm:text-xl">
        {formatPrice(product.priceWithDiscount)}
      </p>
    </div>
  );
}
