import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { PRODUCTS_PER_PAGE, type Category, type Product } from '@/lib/types';

interface UseCatalogFiltersReturn {
  selectedCategories: Category[];
  categoryFilteredProducts: Product[];
  currentPage: number;
  totalPages: number;
  productsPerPage: number;
  printView: boolean;
  isAllSelected: boolean;
  updateURL: (
    updates: Partial<{
      categorias: string | undefined;
      pagina: string | undefined;
      entienda: string | undefined;
      modoprint: string | undefined;
    }>,
  ) => void;
}

export function useCatalogFilters(
  allProducts: Product[],
  categories: Category[],
): UseCatalogFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get selected categories from URL
  const selectedCategories = useMemo(() => {
    const categoriesParam = searchParams.get('categorias');
    if (!categoriesParam) return [];
    return categoriesParam
      .split(',')
      .filter((cat): cat is Category => categories.includes(cat as Category));
  }, [searchParams, categories]);

  // Get current page from URL (raw, before validation)
  const rawPage = useMemo(() => {
    const page = searchParams.get('pagina');
    return page ? Math.max(1, parseInt(page, 10)) : 1;
  }, [searchParams]);

  // Get entienda param from URL
  const inStoreParam = useMemo(() => {
    const inStore = searchParams.get('entienda');
    return inStore === 'true' || false;
  }, [searchParams]);

  // Get modoprint param from URL
  const printView = useMemo(() => {
    const print = searchParams.get('modoprint');
    return print === 'true' || false;
  }, [searchParams]);

  // TODO: Remove this when data comes from the backend
  // Apply category filter
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategories.length === 0)
      return inStoreParam ? allProducts.filter((p) => p.inStore) : allProducts;

    const filteredCategoryProducts = allProducts.filter((product) =>
      selectedCategories.includes(product.category),
    );

    return inStoreParam
      ? filteredCategoryProducts.filter((p) => p.inStore)
      : filteredCategoryProducts;
  }, [allProducts, selectedCategories, inStoreParam]);

  // Calculate pagination based on filtered products
  const productsPerPage = PRODUCTS_PER_PAGE;

  const totalPages = Math.ceil(
    categoryFilteredProducts.length / productsPerPage,
  );
  const currentPage = Math.min(rawPage, Math.max(1, totalPages));

  const isAllSelected = selectedCategories.length === 0;

  // Generic URL update function
  const updateURL = (
    updates: Partial<{
      categorias: string | undefined;
      pagina: string | undefined;
      entienda: string | undefined;
      modoprint: string | undefined;
    }>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if ('categorias' in updates) {
      if (updates.categorias === undefined) {
        params.delete('categorias');
      } else {
        params.set('categorias', updates.categorias);
      }
    }

    if ('pagina' in updates) {
      if (updates.pagina === undefined) {
        params.delete('pagina');
      } else {
        params.set('pagina', updates.pagina);
      }
    }

    if ('entienda' in updates) {
      if (updates.entienda === undefined) {
        params.delete('entienda');
      } else {
        params.set('entienda', updates.entienda);
      }
    }

    if ('modoprint' in updates) {
      if (updates.modoprint === undefined) {
        params.delete('modoprint');
      } else {
        params.set('modoprint', updates.modoprint);
      }
    }

    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  };

  return {
    selectedCategories,
    categoryFilteredProducts,
    currentPage,
    totalPages,
    productsPerPage,
    printView,
    isAllSelected,
    updateURL,
  };
}
