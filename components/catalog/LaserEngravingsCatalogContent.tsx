'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LaserEngravingDeleteDialog } from '@/components/admin/LaserEngravingDeleteDialog';
import { LaserEngravingDialog } from '@/components/admin/LaserEngravingDialog';
import { CatalogContentShell } from '@/components/catalog/CatalogContentShell';
import { getLaserEngravingsByQuery } from '@/lib/actions/get-laser-engravings-by-query.action';
import {
  EMPTY_LASER_ENGRAVING,
  type LaserEngravingFormItem,
} from '@/lib/constants/laser-engraving';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import type { CatalogItem } from '@/lib/types';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import { useAuthStore } from '@/lib/stores/auth.store';
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

function mapCatalogItemToLaserEngraving(
  item: CatalogItem,
): LaserEngravingFormItem {
  return {
    id: Number(item.sourceId),
    slug: item.slug ?? '',
    name: item.name,
    description: item.description,
    price: item.price,
    discount: item.discount,
    priceWithDiscount: item.priceWithDiscount,
    quantity: item.quantity,
    images: item.images,
  };
}

export default function LaserEngravingsCatalogContent() {
  const [editingLaserEngraving, setEditingLaserEngraving] =
    useState<LaserEngravingFormItem | null>(null);
  const [deletingLaserEngraving, setDeletingLaserEngraving] =
    useState<LaserEngravingFormItem | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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
  const catalogTitle = query
    ? `Resultados para "${query}"`
    : isAuthenticated
      ? 'Administrar grabados láser'
      : 'Explora nuestros grabados';

  return (
    <CatalogContentShell
      title={catalogTitle}
      showAddButton={isAuthenticated}
      showSearchBar
      searchDefaultValue={query}
      onAdd={() => setEditingLaserEngraving(EMPTY_LASER_ENGRAVING)}
      onSearch={handleSearch}
      dialogs={
        <>
          <LaserEngravingDialog
            laserEngraving={editingLaserEngraving}
            open={!!editingLaserEngraving}
            onOpenChange={() => setEditingLaserEngraving(null)}
          />

          <LaserEngravingDeleteDialog
            laserEngraving={deletingLaserEngraving}
            open={!!deletingLaserEngraving}
            onOpenChange={() => setDeletingLaserEngraving(null)}
          />
        </>
      }
    >
      <ProductsGrid
        products={catalogItems}
        totalProducts={laserEngravingsResponse?.paging.totalItems ?? 0}
        currentPage={currentPage}
        totalPages={laserEngravingsResponse?.paging.totalPages ?? 1}
        isLoading={isLoading}
        onPageChange={onPageChange}
        isAdmin={isAuthenticated}
        onEdit={(item) => {
          if (!item) return;
          setEditingLaserEngraving(mapCatalogItemToLaserEngraving(item));
        }}
        onDelete={(item) => {
          if (!item) return;
          setDeletingLaserEngraving(mapCatalogItemToLaserEngraving(item));
        }}
        enableCartAction={!isAuthenticated}
      />
    </CatalogContentShell>
  );
}
