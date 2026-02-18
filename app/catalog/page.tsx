import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/products';

export default function CatalogPage() {
  const products = getProducts();
  
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
              <Link href="/catalog" className="text-gray-900 font-semibold">
                Catálogo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Catalog Header */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestra Colección</h1>
        <p className="text-gray-600 mb-8">
          Descubre nuestra exquisita selección de joyería artesanal
        </p>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

