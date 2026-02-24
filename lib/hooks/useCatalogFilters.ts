import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Category, Product } from "@/lib/types";

const PRODUCTS_PER_PAGE = 20;

interface UseCatalogFiltersReturn {
  selectedCategories: Category[];
  categoryFilteredProducts: Product[];
  currentPage: number;
  totalPages: number;
  isAllSelected: boolean;
  updateURL: (updates: Partial<{ categorias: string | undefined; pagina: string | undefined }>) => void;
}

export function useCatalogFilters(
  allProducts: Product[],
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

  // Get current page from URL (raw, before validation)
  const rawPage = useMemo(() => {
    const page = searchParams.get("pagina");
    return page ? Math.max(1, parseInt(page, 10)) : 1;
  }, [searchParams]);

  // Apply category filter
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return allProducts;
    return allProducts.filter((product) =>
      selectedCategories.includes(product.category)
    );
  }, [allProducts, selectedCategories]);

  // Calculate pagination based on filtered products
  const totalPages = Math.ceil(categoryFilteredProducts.length / PRODUCTS_PER_PAGE);
  const currentPage = Math.min(rawPage, Math.max(1, totalPages));

  const isAllSelected = selectedCategories.length === 0;

  // Generic URL update function
  const updateURL = (updates: Partial<{ categorias: string | undefined; pagina: string | undefined }>) => {
    const params = new URLSearchParams(searchParams.toString());

    if ("categorias" in updates) {
      if (updates.categorias === undefined) {
        params.delete("categorias");
      } else {
        params.set("categorias", updates.categorias);
      }
    }

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
    categoryFilteredProducts,
    currentPage,
    totalPages,
    isAllSelected,
    updateURL,
  };
}