'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { LaserEngravingDeleteDialog } from '@/components/admin/LaserEngravingDeleteDialog';
import { LaserEngravingDialog } from '@/components/admin/LaserEngravingDialog';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { Button } from '@/components/ui/button';
import { getLaserEngravingsByQuery } from '@/lib/actions/get-laser-engravings-by-query.action';
import {
  EMPTY_LASER_ENGRAVING,
  type LaserEngravingFormItem,
} from '@/lib/constants/laser-engraving';
import type { ILaserEngraving } from '@/lib/interfaces/laser-engraving';
import { useCatalogFilters } from '@/lib/hooks/useCatalogFilters';
import type { CatalogItem } from '@/lib/types';

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

export function AdminLaserEngravingsContent() {
  const [editingLaserEngraving, setEditingLaserEngraving] =
    useState<LaserEngravingFormItem | null>(null);
  const [deletingLaserEngraving, setDeletingLaserEngraving] =
    useState<LaserEngravingFormItem | null>(null);
  const { query, currentPage, onPageChange, updateURL } = useCatalogFilters(
    [],
    {
      basePath: '/admin/grabados',
    },
  );

  const { isLoading, data: laserEngravingsResponse } = useQuery({
    queryKey: [
      'laser-engravings',
      {
        query: query?.toLowerCase() ?? null,
        page: currentPage,
        admin: true,
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
    <>
      <div className="py-4 text-right">
        <Button
          className="w-24"
          onClick={() => setEditingLaserEngraving(EMPTY_LASER_ENGRAVING)}
        >
          <Plus className="size-4" />
          Agregar
        </Button>
      </div>

      <CatalogSearchBar defaultValue={query} onSearch={handleSearch} />
      <ProductsGrid
        products={catalogItems}
        totalProducts={laserEngravingsResponse?.paging.totalItems ?? 0}
        currentPage={currentPage}
        totalPages={laserEngravingsResponse?.paging.totalPages ?? 1}
        isLoading={isLoading}
        onPageChange={onPageChange}
        isAdmin
        onEdit={(item) => {
          if (!item) return;
          setEditingLaserEngraving(mapCatalogItemToLaserEngraving(item));
        }}
        onDelete={(item) => {
          if (!item) return;
          setDeletingLaserEngraving(mapCatalogItemToLaserEngraving(item));
        }}
        enableCartAction={false}
      />

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
  );
}
