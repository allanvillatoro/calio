'use client';

import { Suspense } from 'react';
import CatalogContent from '@/components/catalog/CatalogContent';

export default function AdmninPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="text-center py-12">Cargando panel administrativo...</div>
        }
      >
        <CatalogContent isAdmin={true} />
      </Suspense>
    </div>
  );
}
