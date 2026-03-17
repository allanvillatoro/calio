import ProductCard from '@/components/catalog/ProductCard';
import type { Product } from '@/lib/types';
import { PaginationControls } from './PaginationControls';
import { EmptyState } from './EmptyState';

interface ProductsGridProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isAdmin: boolean;
  onEdit: (product: Product | null) => void;
  onDelete: (product: Product | null) => void;
}

export function ProductsGrid({
  products,
  totalProducts,
  currentPage,
  totalPages,
  onPageChange,
  isAdmin,
  onEdit,
  onDelete,
}: ProductsGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isAdmin={isAdmin}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
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
