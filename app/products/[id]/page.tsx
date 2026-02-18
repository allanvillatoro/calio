import Link from 'next/link';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Calio Jewelry
            </Link>
            <div className="space-x-6">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Inicio
              </Link>
              <Link href="/catalog" className="text-gray-700 hover:text-gray-900">
                Catálogo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/catalog"
          className="text-gray-600 hover:text-gray-900 mb-6 inline-block"
        >
          ← Volver al Catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative w-full h-96 md:h-[600px] bg-white rounded-lg overflow-hidden shadow-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700">
                  Disponibilidad:
                </span>
                <span className={`text-lg font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} en stock` : 'Agotado'}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Descripción
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="pt-6">
              <button
                disabled={product.quantity === 0}
                className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors ${
                  product.quantity > 0
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.quantity > 0 ? 'Agregar al Carrito' : 'Agotado'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

