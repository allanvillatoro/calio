import { Suspense } from 'react';
import type { Metadata } from 'next';
import LaserEngravingsCatalogContent from '@/components/catalog/LaserEngravingsCatalogContent';

export const metadata: Metadata = {
  title: 'Catálogo de Grabados Láser | CALIO Joyería',
  description: 'Explora nuestros grabados láser para personalizar joyas CALIO.',
  openGraph: {
    title: 'Grabados Láser | CALIO Joyería',
    description: 'Explora muestras de grabado láser para personalizar joyas',
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com'}/grabados`,
  },
};

export default function LaserEngravingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={<div className="text-center py-12">Cargando grabados...</div>}
      >
        <LaserEngravingsCatalogContent />
      </Suspense>
    </div>
  );
}
