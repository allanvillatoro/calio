import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Calio Jewelry</h1>
          <div className="space-x-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Inicio
            </Link>
            <Link href="/catalogo" className="text-gray-700 hover:text-gray-900">
              Catálogo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Elegancia Atemporal,<br />
            Hecha con Cuidado
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Descubre nuestra exquisita colección de joyería artesanal, 
            donde cada pieza cuenta una historia de belleza y sofisticación.
          </p>
          <Link
            href="/catalogo"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Explorar Colección
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-2">Calidad Premium</h3>
            <p className="text-gray-600">
              Solo los mejores materiales y gemas en cada pieza
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Artesanal</h3>
            <p className="text-gray-600">
              Cada pieza es cuidadosamente elaborada por artesanos expertos
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-2">Regalo Perfecto</h3>
            <p className="text-gray-600">
              Encuentra la pieza perfecta para tus seres queridos
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <p className="text-center text-gray-600">
          © 2026 Calio Jewelry. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

