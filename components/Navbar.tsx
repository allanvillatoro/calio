'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  isActive: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const isCollection = pathname === '/catalogo';
  const { isAuthenticated, isLoggingOut, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isLoggingOut) {
      return;
    }
    setIsMobileMenuOpen(false);
    await logout();
  };

  const logoContent = (
    <Image
      src="/images/logo.png"
      alt="CALIO Joyería"
      width={267}
      height={141}
      priority
      className="h-16 w-auto shrink-0 sm:h-20"
    />
  );

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Inicio',
      isActive: pathname === '/',
    },
    {
      href: '/catalogo?categorias=new+in',
      label: 'Colección',
      isActive: isCollection,
    },
  ];

  const getNavLinkClassName = (isActive: boolean) =>
    isActive
      ? 'text-gray-900 font-semibold'
      : 'text-gray-700 hover:text-gray-900';

  const renderNavLinks = (onNavigate?: () => void) =>
    navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={getNavLinkClassName(item.isActive)}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    ));

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="relative flex items-center justify-end gap-4">
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 shrink-0"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {logoContent}
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
          <div className="hidden items-center gap-3 sm:gap-6 md:flex">
            {renderNavLinks()}
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
        {isMobileMenuOpen && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:hidden">
            <div className="flex flex-col gap-3">
              {renderNavLinks(() => setIsMobileMenuOpen(false))}
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
        )}
      </div>
    </nav>
  );
}
