import Link from "next/link";
import type { Metadata } from "next";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa";
import ImageCarousel from "@/components/ImageCarousel";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: ProductDetailPageProps): Metadata {
  const product = getProductById(params.id);

  if (!product) {
    return {
      title: "Producto no encontrado | CALIO",
    };
  }

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com"}/productos/${product.id}`;

  return {
    title: `${product.name} | CALIO Joyería`,
    description: product.description,
    keywords: `${product.name}, ${product.category}, joyas, joyería`,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      url: productUrl,
      images: [
        {
          url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_pad,w_1200,h_630/${product.images[0] || "default.jpg"}`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id);
  if (!product) {
    notFound();
  }
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/productos/${product.id}`;
  const phoneNumber = process.env.CONTACT_PHONE || "";
  const message = `Hola, quiero solicitar este producto: ${product.name} - ${productUrl}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Detail */}
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/catalogo"
          className="text-gray-600 hover:text-gray-900 mb-6 inline-block"
        >
          ← Volver a Colección
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Carousel */}
          <ImageCarousel images={product.images} />

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {formatPrice(product.price)}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Envío local o nacional por un costo adicional
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Descripción
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="pt-6">
              {product.quantity > 0 ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700"
                >
                  <FaWhatsapp className="w-6 h-6" />
                  Solicitar por WhatsApp
                </a>
              ) : (
                <div className="w-full py-4 px-6 rounded-lg text-lg font-semibold bg-gray-300 text-gray-500 text-center">
                  Agotado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
