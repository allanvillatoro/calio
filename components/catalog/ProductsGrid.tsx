import ProductCard from '@/components/catalog/ProductCard';
import type { CatalogItem, Product } from '@/lib/types';
import { PaginationControls } from './PaginationControls';
import { EmptyState } from './EmptyState';
import { ProductsGridSkeleton } from './ProductsGridSkeleton';

type ProductsGridItem = Product | CatalogItem;

interface ProductsGridProps<TProduct extends ProductsGridItem = Product> {
  products: TProduct[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  isAdmin: boolean;
  onEdit: (product: TProduct | null) => void;
  onDelete: (product: TProduct | null) => void;
  enableCartAction?: boolean;
}

export function ProductsGrid<TProduct extends ProductsGridItem = Product>({
  products,
  totalProducts,
  currentPage,
  totalPages,
  isLoading = false,
  onPageChange,
  isAdmin,
  onEdit,
  onDelete,
  enableCartAction = true,
}: ProductsGridProps<TProduct>) {
  if (isLoading) {
    return <ProductsGridSkeleton />;
  }

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
            enableCartAction={enableCartAction}
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
