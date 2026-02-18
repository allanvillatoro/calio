import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Category } from "@/lib/types";

const PRODUCTS_PER_PAGE = 20;

interface UseCatalogFiltersReturn {
  selectedCategories: Category[];
  currentPage: number;
  totalPages: number;
  validPage: number;
  isAllSelected: boolean;
  updateURL: (updates: Partial<{ categorias: string | undefined; pagina: string | undefined }>) => void;
}

export function useCatalogFilters(
  filteredProductsLength: number,
  categories: Category[]
): UseCatalogFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get selected categories from URL
  const selectedCategories = useMemo(() => {
    const categoriesParam = searchParams.get("categorias");
    if (!categoriesParam) return [];
    return categoriesParam
      .split(",")
      .filter((cat): cat is Category => categories.includes(cat as Category));
  }, [searchParams, categories]);

  // Get current page from URL
  const currentPage = useMemo(() => {
    const page = searchParams.get("pagina");
    return page ? Math.max(1, parseInt(page, 10)) : 1;
  }, [searchParams]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProductsLength / PRODUCTS_PER_PAGE);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  const isAllSelected = selectedCategories.length === 0;

  // Generic URL update function
  const updateURL = (updates: Partial<{ categorias: string | undefined; pagina: string | undefined }>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Only update categorias if explicitly provided in updates
    if ("categorias" in updates) {
      if (updates.categorias === undefined) {
        params.delete("categorias");
      } else {
        params.set("categorias", updates.categorias);
      }
    }

    // Only update pagina if explicitly provided in updates
    if ("pagina" in updates) {
      if (updates.pagina === undefined) {
        params.delete("pagina");
      } else {
        params.set("pagina", updates.pagina);
      }
    }

    router.push(`/catalogo?${params.toString()}`);
  };

  return {
    selectedCategories,
    currentPage,
    totalPages,
    validPage,
    isAllSelected,
    updateURL,
  };
}
