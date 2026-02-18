export const PRODUCTS_PER_PAGE = 20;

export function calculatePagination(
  filteredProductsLength: number,
  currentPage: number
) {
  const totalPages = Math.ceil(filteredProductsLength / PRODUCTS_PER_PAGE);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (validPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;

  return {
    totalPages,
    validPage,
    startIndex,
    endIndex,
    range: { start: startIndex, end: endIndex },
  };
}

export function sortProductsById<T extends { id: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const idA = parseInt(a.id, 10);
    const idB = parseInt(b.id, 10);
    return idB - idA;
  });
}
