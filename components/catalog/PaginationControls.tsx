const BUTTON_STYLES =
  "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalProducts,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      {/* Pagination Buttons */}
      <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`${BUTTON_STYLES} px-4 py-2`}
        >
          ← Anterior
        </button>

        <div className="flex gap-1 flex-wrap justify-center">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg ${
                page === currentPage
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`${BUTTON_STYLES} px-4 py-2`}
        >
          Siguiente →
        </button>
      </div>

      {/* Page Info */}
      <div className="text-center text-gray-600 text-sm mt-4">
        Página {currentPage} de {totalPages} ({totalProducts} productos)
      </div>
    </>
  );
}
