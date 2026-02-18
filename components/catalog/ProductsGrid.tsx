import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { PaginationControls } from "./PaginationControls";
import { EmptyState } from "./EmptyState";

interface ProductsGridProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProductsGrid({
  products,
  totalProducts,
  currentPage,
  totalPages,
  onPageChange,
}: ProductsGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalProducts={totalProducts}
        onPageChange={onPageChange}
      />
    </div>
  );
}
