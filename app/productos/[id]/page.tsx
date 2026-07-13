import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import ImageCarousel from '@/components/product/ImageCarousel';
import BackButton from '@/components/product/BackButton';
import AddToCartButton from '@/components/product/AddToCartButton';
import { SOCIAL_LINKS } from '@/lib/constants/social-links';
import {
  getAbsoluteProductUrl,
  getCartItem,
  getItemCategory,
  getProductDetailItem,
} from './product-detail.helpers';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const detailItem = await getProductDetailItem(id);

  if (!detailItem) {
    return {
      title: 'Producto no encontrado | CALIO',
    };
  }

  const { item } = detailItem;
  const productUrl = getAbsoluteProductUrl(detailItem);
  const category = getItemCategory(detailItem);

  return {
    title: `${item.name} | CALIO Joyería`,
    description: item.description,
    keywords: `${item.name}, ${category}, joyas, joyería, grabados laser, acero inoxidable, san pedro sula`,
    openGraph: {
      title: item.name,
      description: item.description,
      type: 'website',
      url: productUrl,
      images: [
        {
          url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_pad,w_1200,h_630/${item.images[0] || 'default.jpg'}`,
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  const detailItem = await getProductDetailItem(id);

  if (!detailItem) {
    notFound();
  }

  const { item } = detailItem;
  const productUrl = getAbsoluteProductUrl(detailItem);
  const phoneNumber = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';
  const itemLabel =
    detailItem.kind === 'laser-engraving' ? 'grabado' : 'producto';
  const message = `Hola, quiero solicitar este ${itemLabel}: ${item.name} - ${productUrl}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const hasDiscount = item.discount > 0;
  const cartProduct = getCartItem(detailItem);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Detail */}
      <div className="container mx-auto px-4 py-4">
        <BackButton />
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Carousel */}
          <ImageCarousel images={item.images} />

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {item.name}
              </h1>
              <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(item.priceWithDiscount)}
                </p>
                {hasDiscount && (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(item.price)}
                    </span>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold tracking-wide text-rose-700">
                      {item.discount}% OFF
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">
                Envío local o nacional por un costo adicional
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Descripción
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-6">
              {item.quantity > 0 ? (
                <div className="grid gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                    Solicitar por WhatsApp
                  </a>
                  <a
                    href={SOCIAL_LINKS.instagram.dmHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-semibold transition-colors bg-pink-600 text-white hover:bg-pink-700"
                  >
                    <FaInstagram className="w-6 h-6" />
                    Solicitar por Instagram
                  </a>
                  <AddToCartButton product={cartProduct} />
                </div>
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
