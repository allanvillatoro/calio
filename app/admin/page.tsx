import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export default async function AdminPage() {
  const authenticatedUser = await getAuthenticatedUserFromCookies();

  if (!authenticatedUser) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="serif-title text-3xl md:text-4xl text-center mb-2">
        Panel Administrativo
      </h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto py-8">
        <Link href="/catalogo">
          <div className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all p-8 cursor-pointer group">
            <h2 className="text-xl font-semibold text-white mb-2">
              Administrar piezas joyería
            </h2>
            <p className="text-gray-300 text-sm">
              Agregar, editar o eliminar piezas de joyería del catálogo en
              línea.
            </p>
          </div>
        </Link>

        <Link href="/grabados">
          <div className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all p-8 cursor-pointer group">
            <h2 className="text-xl font-semibold text-white mb-2">
              Administrar grabados láser
            </h2>
            <p className="text-gray-300 text-sm">
              Agregar, editar o eliminar muestras de grabado láser.
            </p>
          </div>
        </Link>

        <Link href="/catalogo?tiendasps=true&modoprint=true">
          <div className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all p-8 cursor-pointer group">
            <h2 className="text-xl font-semibold text-white mb-2">
              Ver tienda SPS
            </h2>
            <p className="text-gray-300 text-sm">
              Consulta los productos disponibles en la tienda de San Pedro Sula.
            </p>
          </div>
        </Link>

        <Link href="/catalogo?tiendapro=true&modoprint=true">
          <div className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all p-8 cursor-pointer group">
            <h2 className="text-xl font-semibold text-white mb-2">
              Ver tienda El Progreso
            </h2>
            <p className="text-gray-300 text-sm">
              Consulta los productos disponibles en la tienda de El Progreso.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
