'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIES, type Product } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import { CatalogContentShell } from '@/components/catalog/CatalogContentShell';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { ProductDialog } from '../admin/ProductDialog';
import { DeleteDialog } from '../admin/DeleteDialog';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function CatalogContent() {
  //const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
    if (inStore) return 'Productos en Tienda Física';
    return 'Administrar joyería';
  };

  return (
    <CatalogContentShell
      title={getCatalogTitle()}
      showAddButton={isAuthenticated && !printView}
      showSearchBar={!printView}
      searchDefaultValue={query}
      onAdd={() => setEditingProduct(EMPTY_PRODUCT)}
      onSearch={handleSearch}
      dialogs={
        <>
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
        </>
      }
    >
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
    </CatalogContentShell>
  );
}
