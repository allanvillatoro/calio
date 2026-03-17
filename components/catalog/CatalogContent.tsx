'use client';

import { useMemo, useState } from 'react';
import { getProducts } from '@/lib/products';
import { CATEGORIES, type Product, type Category } from '@/lib/types';
import { sortProductsById, calculatePagination } from '@/lib/catalog';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { FiltersSection } from '@/components/catalog/FiltersSection';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { ProductDialog } from '../admin/ProductDialog';
import { DeleteDialog } from '../admin/DeleteDialog';
import { Button } from '../ui/button';
import { EMPTY_PRODUCT } from '@/lib/utils';

interface Props {
  isAdmin?: boolean;
}

export default function CatalogContent({ isAdmin = false }: Props) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // TODO: Detect here from the gloabl state if the user is admin, instead of passing it as a prop from the admin page.

  // TODO: Remove sorting when backend API is available and returns sorted data
  const sortedProducts = useMemo(() => {
    return sortProductsById(getProducts());
  }, []);

  const {
    selectedCategories,
    categoryFilteredProducts,
    currentPage,
    totalPages,
    productsPerPage,
    isAllSelected,
    updateURL,
    printView,
  } = useCatalogFilters(sortedProducts, CATEGORIES);

  // TODO: Remove pagination logic when backend API is available and supports pagination
  // Get paginated slice
  const { startIndex, endIndex } = calculatePagination(
    categoryFilteredProducts.length,
    currentPage,
    productsPerPage,
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
        newCategories.length === 0 ? undefined : newCategories.join(','),
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
      {isAdmin && !printView && (
        <div className="py-4 text-right">
          <Button
            className="w-24"
            onClick={() => setEditingProduct(EMPTY_PRODUCT)}
          >
            Agregar
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8">
        {!printView && (
          <FiltersSection
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            isAllSelected={isAllSelected}
            isOpen={isFiltersOpen}
            onToggleOpen={() => setIsFiltersOpen(!isFiltersOpen)}
            onSelectAll={handleSelectAll}
            onToggleCategory={handleToggleCategory}
          />
        )}

        <div className="flex-1">
          <ProductsGrid
            products={paginatedProducts}
            totalProducts={categoryFilteredProducts.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isAdmin={isAdmin && !printView}
            onEdit={setEditingProduct}
            onDelete={setDeletingProduct}
          />
        </div>
      </div>

      <ProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={() => setEditingProduct(null)}
      />

      <DeleteDialog
        product={deletingProduct}
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      />
    </div>
  );
}
