'use client';

import { useQuery } from '@tanstack/react-query';
import { getLaserEngravingsByQuery } from '@/lib/actions/get-laser-engravings-by-query.action';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { CatalogItem } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';

function mapLaserEngravingToCatalogItem(
  laserEngraving: ILaserEngraving,
): CatalogItem {
  return {
    id: `laser-engraving:${laserEngraving.id}`,
    sourceId: String(laserEngraving.id),
    slug: laserEngraving.slug,
    kind: 'laser-engraving',
    name: laserEngraving.name,
    description: laserEngraving.description,
    price: laserEngraving.price,
    discount: laserEngraving.discount,
    priceWithDiscount: laserEngraving.priceWithDiscount,
    quantity: laserEngraving.quantity,
    images: laserEngraving.images,
  };
}

export default function LaserEngravingsCatalogContent() {
  const { query, currentPage, onPageChange, updateURL } = useCatalogFilters(
    [],
    {
      basePath: '/grabados',
    },
  );

  const { isLoading, data: laserEngravingsResponse } = useQuery({
    queryKey: [
      'laser-engravings',
      {
        query: query?.toLowerCase() ?? null,
        page: currentPage,
      },
    ],
    queryFn: () =>
      getLaserEngravingsByQuery({
        query,
        page: currentPage,
      }),
    staleTime: 1000 * 60 * 15,
  });

  const handleSearch = (searchQuery: string) => {
    updateURL({
      query: searchQuery || undefined,
      pagina: undefined,
    });
  };

  const catalogItems =
    laserEngravingsResponse?.data.map(mapLaserEngravingToCatalogItem) ?? [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold text-center pb-6">
        {query ? `Resultados para "${query}"` : 'Explora nuestros grabados'}
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <CatalogSearchBar defaultValue={query} onSearch={handleSearch} />
          <ProductsGrid
            products={catalogItems}
            totalProducts={laserEngravingsResponse?.paging.totalItems ?? 0}
            currentPage={currentPage}
            totalPages={laserEngravingsResponse?.paging.totalPages ?? 1}
            isLoading={isLoading}
            onPageChange={onPageChange}
            isAdmin={false}
            onEdit={() => undefined}
            onDelete={() => undefined}
            enableCartAction
          />
        </div>
      </div>
    </div>
  );
}
