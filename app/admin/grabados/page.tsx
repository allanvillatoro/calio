import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export default async function AdminLaserEngravingsPage() {
  const authenticatedUser = await getAuthenticatedUserFromCookies();

  if (!authenticatedUser) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Volver al panel
        </Link>

        <h1 className="serif-title mt-6 text-3xl md:text-4xl">
          Administrar grabados laser
        </h1>
        <p className="mt-3 text-gray-600">
          Gestiona las muestras de grabado laser que aparecerán en el catálogo
          público.
        </p>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          El formulario de administración de grabados se agregará en el
          siguiente corte.
        </div>
      </div>
    </div>
  );
}
