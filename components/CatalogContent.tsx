"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import { Category } from "@/lib/types";

const CATEGORIES: Category[] = [
  "aretes",
  "collares",
  "anillos",
  "pulseras",
  "accesorios",
  "sets",
  "earcuffs",
];

export default function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const allProducts = getProducts();

  // Get selected categories from URL
  const selectedCategories = useMemo(() => {
    const categoriesParam = searchParams.get("categorias");
    if (!categoriesParam) return [];
    return categoriesParam
      .split(",")
      .filter((cat): cat is Category => CATEGORIES.includes(cat as Category));
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category),
      );
    }

    // Sort by ID (numeric, descending - mayor a menor)
    filtered = [...filtered].sort((a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      return idB - idA; // Descending order
    });

    return filtered;
  }, [allProducts, selectedCategories]);

  // Handle category toggle
  const toggleCategory = (category: Category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    const params = new URLSearchParams(searchParams.toString());
    if (newCategories.length === 0) {
      params.delete("categorias");
    } else {
      params.set("categorias", newCategories.join(","));
    }

    router.push(`/catalogo?${params.toString()}`);
  };

  // Handle "Todos" toggle
  const selectAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categorias");
    router.push(`/catalogo?${params.toString()}`);
  };

  const isAllSelected = selectedCategories.length === 0;

  return (
    <>
      {/* Navigation */}
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

      {/* Catalog Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nuestra Colección
        </h1>
        <p className="text-gray-600 mb-8">
          Descubre nuestra exquisita selección de joyería artesanal
        </p>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Categorías
              </h2>
              <div className="space-y-3">
                {/* Todos option */}
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={selectAll}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-gray-900 font-medium">
                    Todos
                  </span>
                </label>

                <div className="border-t border-gray-200 my-3"></div>

                {/* Category options */}
                {CATEGORIES.map((category) => {
                  const isChecked = selectedCategories.includes(category);
                  return (
                    <label
                      key={category}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 capitalize">
                        {category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">
                  No se encontraron productos con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
