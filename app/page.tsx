import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Everything is silver & gold
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            La joyería es una extensión de lo que somos. Una herramienta para contar nuestra historia.
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

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <p className="text-center text-gray-600">
          © 2026 CALIO Joyería. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
