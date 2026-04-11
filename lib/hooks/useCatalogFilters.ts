import { useSearchParams, useRouter } from 'next/navigation';
import type { Category } from '@/lib/types';

interface UseCatalogFiltersReturn {
  selectedCategories: Category[];
  selectedCategoriesParam: string | undefined;
  query: string | undefined;
  currentPage: number;
  inStore: boolean | undefined;
  printView: boolean;
  isAllSelected: boolean;
  onCategorySelectionChange: (categories: Category[]) => void;
  onPageChange: (page: number) => void;
  updateURL: (updates: CatalogFilterUpdates) => void;
}

type CatalogFilterKey =
  | 'categorias'
  | 'pagina'
  | 'entienda'
  | 'modoprint'
  | 'query';

type CatalogFilterUpdates = Partial<
  Record<CatalogFilterKey, string | undefined>
>;

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
  const query = searchParams.get('query')?.trim() || undefined;

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
  const updateURL = (updates: CatalogFilterUpdates) => {
    const params = new URLSearchParams(searchParams.toString());
    const keys: CatalogFilterKey[] = [
      'categorias',
      'pagina',
      'entienda',
      'modoprint',
      'query',
    ];

    for (const key of keys) {
      if (key in updates) {
        const value = updates[key];
        if (value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
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
      query: undefined,
    });
  };

  return {
    selectedCategories,
    selectedCategoriesParam:
      selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
    query,
    currentPage: rawPage,
    inStore,
    printView,
    isAllSelected,
    onCategorySelectionChange,
    onPageChange,
    updateURL,
  };
}
