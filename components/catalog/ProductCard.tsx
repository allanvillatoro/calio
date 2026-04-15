import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Button } from '../ui/button';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({
  product,
  isAdmin,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const mainImage = product.images[0];
  const hasDiscount = product.discount > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <Link href={`/productos/${product.id}`}>
        <div className="relative w-full aspect-square bg-white">
          <Image
            src={getImageUrl(mainImage)}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {hasDiscount && (
            <div className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
              -{product.discount}%
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-2xl font-bold text-gray-900 leading-none">
                {formatPrice(product.priceWithDiscount)}
              </span>
              <div className="mt-1 h-5">
                {hasDiscount ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="font-semibold uppercase tracking-wide text-rose-600">
                      {product.discount}% OFF
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            {isAdmin && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                Stock: {product.quantity}
              </span>
            )}
          </div>
        </div>
      </Link>
      {isAdmin && (
        <div className="flex justify-center gap-2 px-4 pb-4">
          <Button
            className="w-16 bg-gray-700 text-white hover:bg-gray-900"
            onClick={() => onEdit(product)}
            aria-label={`Editar ${product.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            className="w-16 bg-red-500 text-white hover:bg-red-600"
            onClick={() => onDelete(product)}
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
