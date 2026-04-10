'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { CATEGORIES, type Product } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import { FiltersSection } from '@/components/catalog/FiltersSection';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { ProductDialog } from '../admin/ProductDialog';
import { DeleteDialog } from '../admin/DeleteDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { EMPTY_PRODUCT } from '@/lib/constants/product';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CatalogContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const { isAuthenticated } = useAuth();

  const {
    selectedCategories,
    selectedCategoriesParam,
    query,
    currentPage,
    inStore,
    isAllSelected,
    onCategorySelectionChange,
    onPageChange,
    printView,
    updateURL,
  } = useCatalogFilters(CATEGORIES);

  const normalizedCategory =
    selectedCategoriesParam
      ?.split(',')
      .map((category) => category.trim())
      .filter(Boolean)
      .sort()
      .join(',') ?? null;

  const { isLoading, data: productsResponse } = useQuery({
    queryKey: [
      'products',
      {
        category: normalizedCategory,
        query: query ?? null,
        instore: inStore ?? null,
        page: currentPage,
      },
    ],
    queryFn: () =>
      getProductsByQuery({
        category: normalizedCategory ?? undefined,
        query,
        instore: inStore,
        page: currentPage,
      }),
    staleTime: 1000 * 60 * 15,
  });

  const submitSearch = () => {
    const query = inputRef.current?.value?.trim();

    if (!query) {
      updateURL({ query: undefined, categorias: 'new in' });
      return;
    }

    updateURL({
      query,
      categorias: undefined,
      pagina: undefined,
    });
  };

  const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    submitSearch();
  };

  return (
    <div className="container mx-auto px-4 py-12">
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
        {!printView && (
          <FiltersSection
            key={selectedCategoriesParam ?? 'all'}
            categories={CATEGORIES}
            selectedCategories={selectedCategories}
            isAllSelected={isAllSelected}
            isOpen={isFiltersOpen}
            onToggleOpen={() => setIsFiltersOpen(!isFiltersOpen)}
            onSelectionChange={onCategorySelectionChange}
          />
        )}

        <div className="flex-1">
          <div className="mb-8 flex justify-end">
            <div className="flex w-full max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  ref={inputRef}
                  defaultValue={query}
                  onKeyDown={handleSearch}
                  type="text"
                  placeholder="Buscar piezas..."
                  className="h-11 rounded-lg border-gray-300 bg-white pl-10 pr-4 shadow-sm focus-visible:border-gray-900 focus-visible:ring-gray-900/15"
                />
              </div>
              <Button type="button" size="lg" onClick={submitSearch}>
                Buscar
              </Button>
            </div>
          </div>
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
