'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIES, type Product } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { getProductsByQuery } from '@/lib/actions/get-products-by-query.action';
import { FiltersSection } from '@/components/catalog/FiltersSection';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { ProductDialog } from '../admin/ProductDialog';
import { DeleteDialog } from '../admin/DeleteDialog';
import { Button } from '../ui/button';
import { EMPTY_PRODUCT } from '@/lib/constants/product';

interface Props {
  isAdmin?: boolean;
}

export default function CatalogContent({ isAdmin = false }: Props) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // TODO: Detect here from the gloabl state if the user is admin, instead of passing it as a prop from the admin page.

  const {
    selectedCategories,
    selectedCategoriesParam,
    currentPage,
    inStore,
    isAllSelected,
    onCategorySelectionChange,
    onPageChange,
    printView,
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
        instore: inStore ?? null,
        page: currentPage,
      },
    ],
    queryFn: () =>
      getProductsByQuery({
        category: normalizedCategory ?? undefined,
        instore: inStore,
        page: currentPage,
      }),
    staleTime: 1000 * 60 * 15,
  });

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
          <ProductsGrid
            products={productsResponse?.data ?? []}
            totalProducts={productsResponse?.paging.totalItems ?? 0}
            currentPage={currentPage}
            totalPages={productsResponse?.paging.totalPages ?? 1}
            isLoading={isLoading}
            onPageChange={onPageChange}
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
