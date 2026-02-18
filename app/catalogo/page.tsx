import { Suspense } from 'react';
import CatalogContent from '@/components/CatalogContent';

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="text-center py-12">Cargando catálogo...</div>}>
        <CatalogContent />
      </Suspense>
    </div>
  );
}
