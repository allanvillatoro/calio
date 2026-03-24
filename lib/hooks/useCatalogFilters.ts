import { useSearchParams, useRouter } from 'next/navigation';
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
  const categoriesParam = searchParams.get('categorias');
  const selectedCategories = !categoriesParam
    ? []
    : categoriesParam
        .split(',')
        .filter((cat): cat is Category => categories.includes(cat as Category));

  // Get current page from URL (raw, before validation)
  const page = searchParams.get('pagina');
  const rawPage = page ? Math.max(1, parseInt(page, 10)) : 1;

  const inStore = searchParams.get('entienda') === 'true';
  const printView = searchParams.get('modoprint') === 'true';

  // TODO: Remove this when data comes from the backend
  // Apply category filter
  const categoryFilteredProducts =
    selectedCategories.length === 0
      ? inStore
        ? allProducts.filter((p) => p.inStore)
        : allProducts
      : allProducts.filter(
          (product) =>
            selectedCategories.includes(product.category) &&
            (!inStore || product.inStore),
        );

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
