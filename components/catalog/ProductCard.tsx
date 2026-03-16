import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
}

export default function ProductCard({ product, isAdmin }: ProductCardProps) {
  const mainImage = product.images[0];

  return (
    <Link href={`/productos/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative w-full h-64">
          <Image
            src={getImageUrl(mainImage)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
          </div>
        </div>
        {isAdmin && (
          <div className="flex justify-center gap-2 px-4 pb-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log(`Editar producto ${product.id}`);
              }}
              aria-label={`Editar ${product.name}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-900 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log(`Eliminar producto ${product.id}`);
              }}
              aria-label={`Eliminar ${product.name}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
