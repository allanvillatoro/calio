import { useSearchParams, useRouter } from 'next/navigation';
import type { Category } from '@/lib/types';

interface UseCatalogFiltersReturn {
  selectedCategories: Category[];
  selectedCategoriesParam: string | undefined;
  currentPage: number;
  inStore: boolean | undefined;
  printView: boolean;
  isAllSelected: boolean;
  onCategorySelectionChange: (categories: Category[]) => void;
  onPageChange: (page: number) => void;
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
  const parsedPage = page ? Number.parseInt(page, 10) : Number.NaN;
  const rawPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const inStoreParam = searchParams.get('entienda');
  const inStore =
    inStoreParam === 'true'
      ? true
      : inStoreParam === 'false'
        ? false
        : undefined;
  const printView = searchParams.get('modoprint') === 'true';

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

    router.replace(`/catalogo?${params.toString()}`, { scroll: true });
  };

  const onPageChange = (nextPage: number) => {
    updateURL({ pagina: nextPage === 1 ? undefined : nextPage.toString() });
  };

  const onCategorySelectionChange = (categories: Category[]) => {
    updateURL({
      categorias: categories.length === 0 ? undefined : categories.join(','),
      pagina: undefined,
    });
  };

  return {
    selectedCategories,
    selectedCategoriesParam:
      selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
    currentPage: rawPage,
    inStore,
    printView,
    isAllSelected,
    onCategorySelectionChange,
    onPageChange,
    updateURL,
  };
}
