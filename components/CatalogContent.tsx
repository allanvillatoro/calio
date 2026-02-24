"use client";

import { useMemo, useState } from "react";
import { getProducts } from "@/lib/products";
import { Category } from "@/lib/types";
import { sortProductsById, calculatePagination } from "@/lib/catalog";
import { useCatalogFilters } from "@/lib/hooks/useCatalogFilters";
import { FiltersSection } from "@/components/catalog/FiltersSection";
import { ProductsGrid } from "@/components/catalog/ProductsGrid";

const CATEGORIES: Category[] = [
  "aretes",
  "collares",
  "pulseras",
  "anillos",
  "sets",
  "piercings-cuffs",
  "accesorios",
];

export default function CatalogContent() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const sortedProducts = useMemo(() => {
    return sortProductsById(getProducts());
  }, []);

  const {
    selectedCategories,
    categoryFilteredProducts,
    currentPage,
    totalPages,
    isAllSelected,
    updateURL,
  } = useCatalogFilters(sortedProducts, CATEGORIES);

  // Get paginated slice
  const { startIndex, endIndex } = calculatePagination(
    categoryFilteredProducts.length,
    currentPage,
  );
  const paginatedProducts = categoryFilteredProducts.slice(
    startIndex,
    endIndex,
  );

  const handleToggleCategory = (category: Category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    updateURL({
      categorias:
        newCategories.length === 0 ? undefined : newCategories.join(","),
      pagina: undefined,
    });
  };

  const handleSelectAll = () => {
    updateURL({ categorias: undefined, pagina: undefined });
  };

  const handlePageChange = (page: number) => {
    updateURL({ pagina: page === 1 ? undefined : page.toString() });
  };

  return (
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
