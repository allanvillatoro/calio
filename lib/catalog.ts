export function calculatePagination(
  filteredProductsLength: number,
  currentPage: number,
  productsPerPage: number,
) {
  const totalPages = Math.ceil(filteredProductsLength / productsPerPage);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (validPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

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
