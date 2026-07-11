import ProductCard from '@/components/catalog/ProductCard';
import type { CatalogItem, Product } from '@/lib/types';
import { PaginationControls } from './PaginationControls';
import { EmptyState } from './EmptyState';
import { ProductsGridSkeleton } from './ProductsGridSkeleton';

type ProductsGridItem = Product | CatalogItem;

interface ProductsGridProps<TItem extends ProductsGridItem = Product> {
  products: TItem[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  isAdmin: boolean;
  onEdit: (item: TItem | null) => void;
  onDelete: (item: TItem | null) => void;
  enableCartAction?: boolean;
}

export function ProductsGrid<TItem extends ProductsGridItem = Product>({
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
}: ProductsGridProps<TItem>) {
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
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            isAdmin={isAdmin}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
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
