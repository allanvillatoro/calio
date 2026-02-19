"use client";

import { useMemo, useState } from "react";
import { getProducts } from "@/lib/products";
import { Category } from "@/lib/types";
import { sortProductsById, calculatePagination } from "@/lib/catalog";
import { useCatalogFilters } from "@/lib/hooks/useCatalogFilters";
import { CatalogNavbar } from "@/components/catalog/CatalogNavbar";
import { FiltersSection } from "@/components/catalog/FiltersSection";
import { ProductsGrid } from "@/components/catalog/ProductsGrid";

const CATEGORIES: Category[] = [
  "aretes",
  "collares",
  "pulseras",
  "anillos",
  "sets",
  "piercings/earcuffs",
  "accesorios",
];

export default function CatalogContent() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const allProducts = getProducts();

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = allProducts;
    const sorted = sortProductsById(filtered);
    return sorted;
  }, [allProducts]);

  // Get URL filters and pagination
  const {
    selectedCategories,
    currentPage,
    totalPages,
    validPage,
    isAllSelected,
    updateURL,
  } = useCatalogFilters(filteredProducts.length, CATEGORIES);

  // Apply category filter
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return filteredProducts;
    return filteredProducts.filter((product) =>
      selectedCategories.includes(product.category),
    );
  }, [filteredProducts, selectedCategories]);

  // Get paginated products
  const { validPage: displayPage, startIndex, endIndex } = calculatePagination(
    categoryFilteredProducts.length,
    currentPage,
  );
  const paginatedProducts = categoryFilteredProducts.slice(startIndex, endIndex);

  // Handle category toggle
  const handleToggleCategory = (category: Category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    const categoriesParam = newCategories.length === 0 ? undefined : newCategories.join(",");
    updateURL({ categorias: categoriesParam, pagina: undefined });
  };

  // Handle select all
  const handleSelectAll = () => {
    updateURL({ categorias: undefined, pagina: undefined });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const pagina = page === 1 ? undefined : page.toString();
    updateURL({ pagina });
  };

  return (
    <>
      <CatalogNavbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <FiltersSection
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            isAllSelected={isAllSelected}
            isOpen={isFiltersOpen}
            onToggleOpen={() => setIsFiltersOpen(!isFiltersOpen)}
            onSelectAll={handleSelectAll}
            onToggleCategory={handleToggleCategory}
          />

          <div className="flex-1">
            <ProductsGrid
              products={paginatedProducts}
              totalProducts={categoryFilteredProducts.length}
              currentPage={displayPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
