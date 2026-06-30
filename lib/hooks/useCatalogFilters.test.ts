import { act, renderHook } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CATEGORIES, type Category } from '@/lib/types';
import { useCatalogFilters } from './useCatalogFilters';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const replace = vi.fn();

function setSearchParams(queryString = '') {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(queryString) as never,
  );
}

function getLastReplacedUrl() {
  const [url] = replace.mock.lastCall ?? [];

  return new URL(`http://localhost${url}`);
}

describe('useCatalogFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      replace,
    } as never);
    setSearchParams();
  });

  it('returns default filter state when URL params are absent', () => {
    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    expect(result.current).toMatchObject({
      selectedCategories: [],
      selectedCategoriesParam: undefined,
      query: undefined,
      currentPage: 1,
      inStore: undefined,
      printView: false,
      isAllSelected: true,
    });
  });

  it('reads supported public catalog params from the URL', () => {
    setSearchParams(
      'categorias=anillos,collares&pagina=3&entienda=true&modoprint=true&query=oro',
    );

    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    expect(result.current.selectedCategories).toEqual(['anillos', 'collares']);
    expect(result.current.selectedCategoriesParam).toBe('anillos,collares');
    expect(result.current.currentPage).toBe(3);
    expect(result.current.inStore).toBe(true);
    expect(result.current.printView).toBe(true);
    expect(result.current.query).toBe('oro');
    expect(result.current.isAllSelected).toBe(false);
  });

  it('ignores invalid categories and trims empty queries', () => {
    setSearchParams('categorias=anillos,joyas,collares&query=%20%20%20');

    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    expect(result.current.selectedCategories).toEqual(['anillos', 'collares']);
    expect(result.current.query).toBeUndefined();
  });

  it('falls back to page one for invalid and non-positive pages', () => {
    setSearchParams('pagina=abc');
    const invalidPage = renderHook(() => useCatalogFilters(CATEGORIES));

    expect(invalidPage.result.current.currentPage).toBe(1);

    setSearchParams('pagina=-2');
    const negativePage = renderHook(() => useCatalogFilters(CATEGORIES));

    expect(negativePage.result.current.currentPage).toBe(1);
  });

  it('reads entienda=false as an explicit in-store filter', () => {
    setSearchParams('entienda=false');

    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    expect(result.current.inStore).toBe(false);
  });

  it('updates only requested URL params and preserves the rest', () => {
    setSearchParams('categorias=anillos&pagina=2&entienda=true');
    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    act(() => {
      result.current.updateURL({
        query: 'perla',
        pagina: undefined,
      });
    });

    const nextUrl = getLastReplacedUrl();
    expect(nextUrl.pathname).toBe('/catalogo');
    expect(nextUrl.searchParams.get('categorias')).toBe('anillos');
    expect(nextUrl.searchParams.get('entienda')).toBe('true');
    expect(nextUrl.searchParams.get('query')).toBe('perla');
    expect(nextUrl.searchParams.has('pagina')).toBe(false);
    expect(replace).toHaveBeenCalledWith(expect.any(String), {
      scroll: true,
    });
  });

  it('removes page one from the URL when changing pages', () => {
    setSearchParams('categorias=anillos&pagina=4');
    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    act(() => {
      result.current.onPageChange(1);
    });

    const nextUrl = getLastReplacedUrl();
    expect(nextUrl.searchParams.get('categorias')).toBe('anillos');
    expect(nextUrl.searchParams.has('pagina')).toBe(false);
  });

  it('sets non-first pages in the URL when changing pages', () => {
    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    act(() => {
      result.current.onPageChange(3);
    });

    const nextUrl = getLastReplacedUrl();
    expect(nextUrl.searchParams.get('pagina')).toBe('3');
  });

  it('updates categories and clears page and query filters', () => {
    setSearchParams('pagina=3&query=oro&entienda=true');
    const categories: Category[] = ['aretes', 'collares'];
    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    act(() => {
      result.current.onCategorySelectionChange(categories);
    });

    const nextUrl = getLastReplacedUrl();
    expect(nextUrl.searchParams.get('categorias')).toBe('aretes,collares');
    expect(nextUrl.searchParams.get('entienda')).toBe('true');
    expect(nextUrl.searchParams.has('pagina')).toBe(false);
    expect(nextUrl.searchParams.has('query')).toBe(false);
  });

  it('removes categorias when all categories are selected', () => {
    setSearchParams('categorias=anillos&pagina=2');
    const { result } = renderHook(() => useCatalogFilters(CATEGORIES));

    act(() => {
      result.current.onCategorySelectionChange([]);
    });

    const nextUrl = getLastReplacedUrl();
    expect(nextUrl.searchParams.has('categorias')).toBe(false);
    expect(nextUrl.searchParams.has('pagina')).toBe(false);
  });
});
