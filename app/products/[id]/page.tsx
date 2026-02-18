import Link from 'next/link';
import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import ImageCarousel from '@/components/ImageCarousel';

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
              <Link href="/catalogo" className="text-gray-700 hover:text-gray-900">
                Catálogo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/catalogo"
          className="text-gray-600 hover:text-gray-900 mb-6 inline-block"
        >
          ← Volver al Catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Carousel */}
          <ImageCarousel images={product.images} />

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

