'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isCollection = pathname === '/catalogo';
  const { isAuthenticated, isLoggingOut, logout } = useAuth();

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isLoggingOut) {
      return;
    }
    await logout();
  };

  const logoContent = (
    <span className="text-xl font-bold text-gray-900 sm:text-2xl">
      CALIO Joyería
    </span>
  );

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {isHome ? (
            <h1>{logoContent}</h1>
          ) : (
            <Link href="/">{logoContent}</Link>
          )}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className={`${
                isHome
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/catalogo?categorias=new+in"
              className={`${
                isCollection
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Colección
            </Link>
            {isAuthenticated && (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900"
                aria-disabled={isLoggingOut}
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                {isLoggingOut ? 'Saliendo...' : 'Salir'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
