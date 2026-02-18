import Link from "next/link";

export function CatalogNavbar() {
  return (
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
            <Link href="/catalogo" className="text-gray-900 font-semibold">
              Catálogo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
