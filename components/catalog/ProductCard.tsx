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
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
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
