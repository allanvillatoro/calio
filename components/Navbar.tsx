"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCollection = pathname === "/catalogo";

  const logoContent = (
    <span className="text-2xl font-bold text-gray-900">CALIO Joyería</span>
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
          <div className="space-x-6">
            <Link
              href="/"
              className={`${
                isHome
                  ? "text-gray-900 font-semibold"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/catalogo?categorias=new+in"
              className={`${
                isCollection
                  ? "text-gray-900 font-semibold"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Colección
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
