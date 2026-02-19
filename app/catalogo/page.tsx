import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogContent from "@/components/CatalogContent";

export const metadata: Metadata = {
  title: "Catálogo de Joyas | CALIO Joyería",
  description:
    "Explora nuestra colección completa de joyería fina. Anillos, collares, aretes y accesorios de diseño exclusivo.",
  openGraph: {
    title: "Catálogo | CALIO Joyería",
    description: "Descubre nuestros diseños de joyería fina",
    type: "website",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com"}/catalogo`,
  },
};

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="text-center py-12">Cargando colección...</div>
        }
      >
        <CatalogContent />
      </Suspense>
    </div>
  );
}
