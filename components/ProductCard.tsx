import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative w-full h-64">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            <span className="text-sm text-gray-500">
              {product.quantity} en stock
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

