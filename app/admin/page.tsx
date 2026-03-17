'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="serif-title text-3xl md:text-4xl text-center mb-2">
        Panel Administrativo
      </h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto py-12">
        <Link href="/catalogo">
          <div className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all p-8 cursor-pointer group">
            <h2 className="text-xl font-semibold text-white mb-2">
              Administrar catálogo
            </h2>
            <p className="text-gray-300 text-sm">
              Agregar, editar o eliminar productos del catálogo en línea.
            </p>
          </div>
        </Link>

        <Link href="/catalogo?entienda=true&modoprint=true">
          <div className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all p-8 cursor-pointer group">
            <h2 className="text-xl font-semibold text-white mb-2">
              Ver artículos en tienda física
            </h2>
            <p className="text-gray-300 text-sm">
              Consulta los productos disponibles en el punto de venta.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
