'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { CATEGORIES, type Product } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { ProductDialog } from '../admin/ProductDialog';
import { DeleteDialog } from '../admin/DeleteDialog';
import { Button } from '../ui/button';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CatalogContent() {
  //const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const { isAuthenticated } = useAuth();

  const {
    selectedCategoriesParam,
    query,
    currentPage,
    inStore,
    onPageChange,
    printView,
    updateURL,
  } = useCatalogFilters(CATEGORIES);

  /*const normalizedCategory =
    selectedCategoriesParam
      ?.split(',')
      .map((category) => category.trim())
      .filter(Boolean)
      .sort()
      .join(',') ?? null;*/

  const { isLoading, data: productsResponse } = useQuery({
    queryKey: [
      'products',
      {
        category: selectedCategoriesParam ?? null,
        query: query?.toLowerCase() ?? null,
        instore: inStore ?? null,
        page: currentPage,
      },
    ],
    queryFn: () =>
      getProductsByQuery({
        category: selectedCategoriesParam ?? undefined,
        query,
        instore: inStore,
        page: currentPage,
      }),
    staleTime: 1000 * 60 * 15,
  });

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery) {
      updateURL({ query: undefined, categorias: 'new in', pagina: undefined });
      return;
    }

    updateURL({
      query: searchQuery,
      categorias: undefined,
      pagina: undefined,
    });
  };

  const getCatalogTitle = () => {
    if (selectedCategoriesParam) {
      const upperCategory = selectedCategoriesParam.toUpperCase();
      return upperCategory === 'NEW IN' ? 'NUEVA COLECCIÓN' : upperCategory;
    }
    if (query) return `Resultados para "${query}"`;
    if (inStore) return 'Piezas en Tienda Física';
    return 'Catálogo Completo';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-center pb-6">
        {getCatalogTitle()}
      </h2>
      {isAuthenticated && !printView && (
        <div className="py-4 text-right">
          <Button
            className="w-24"
            onClick={() => setEditingProduct(EMPTY_PRODUCT)}
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8">
        {/*         {!printView && (
          <FiltersSection
            key={selectedCategoriesParam ?? 'all'}
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            isAllSelected={isAllSelected}
            isOpen={isFiltersOpen}
            onToggleOpen={() => setIsFiltersOpen(!isFiltersOpen)}
            onSelectionChange={onCategorySelectionChange}
          />
        )} */}

        <div className="flex-1">
          {!printView && (
            <CatalogSearchBar defaultValue={query} onSearch={handleSearch} />
          )}
          <ProductsGrid
            products={productsResponse?.data ?? []}
            totalProducts={productsResponse?.paging.totalItems ?? 0}
            currentPage={currentPage}
            totalPages={productsResponse?.paging.totalPages ?? 1}
            isLoading={isLoading}
            onPageChange={onPageChange}
            isAdmin={isAuthenticated && !printView}
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
