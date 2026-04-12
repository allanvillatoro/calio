'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  category?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoggingOut, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeCategory = searchParams.get('categorias');

  const handleLogout = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isLoggingOut) {
      return;
    }
    setIsMenuOpen(false);
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
      label: 'INICIO',
    },
    {
      href: '/catalogo?categorias=new+in',
      label: 'NUEVA COLECCIÓN',
      category: 'new in',
    },
    {
      href: '/catalogo?categorias=aretes',
      label: 'ARETES',
      category: 'aretes',
    },
    {
      href: '/catalogo?categorias=collares',
      label: 'COLLARES',
      category: 'collares',
    },
    {
      href: '/catalogo?categorias=pulseras',
      label: 'PULSERAS',
      category: 'pulseras',
    },
    {
      href: '/catalogo?categorias=anillos',
      label: 'ANILLOS',
      category: 'anillos',
    },
    {
      href: '/catalogo?categorias=sets',
      label: 'SETS',
      category: 'sets',
    },
    {
      href: '/catalogo?categorias=studs-cuffs',
      label: 'STUDS/CUFFS',
      category: 'studs-cuffs',
    },
    {
      href: '/catalogo?categorias=accesorios',
      label: 'ACCESORIOS',
      category: 'accesorios',
    },
  ];

  const isNavItemActive = ({ href, category }: NavItem) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === '/catalogo' && activeCategory === category;
  };

  const getNavLinkClassName = (isActive: boolean) =>
    isActive
      ? 'rounded-lg bg-gray-900 px-3 py-0.5 font-semibold leading-tight text-white'
      : 'rounded-lg px-3 py-0.5 leading-tight text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900';

  const renderNavLinks = (onNavigate?: () => void) =>
    navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={getNavLinkClassName(isNavItemActive(item))}
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
            onClick={() => setIsMenuOpen(false)}
          >
            {logoContent}
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
        {isMenuOpen && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-0.5">
              {renderNavLinks(() => setIsMenuOpen(false))}
              {isAuthenticated && (
                <>
                  <Link
                    href="/admin"
                    className={getNavLinkClassName(pathname === '/admin')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ADMIN
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-0.5 leading-tight text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    aria-disabled={isLoggingOut}
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    {isLoggingOut ? 'Saliendo...' : 'SALIR'}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
