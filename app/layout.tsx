import type { Metadata } from 'next';
import { Playfair_Display, Inter, Geist } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CALIO - Joyería | Anillos, Collares y Accesorios en San Pedro Sula',
  description:
    'Descubre CALIO joyería en San Pedro Sula, Honduras. Anillos, collares, aretes y accesorios de acero inoxidable. Joyas para sentirte bien.',
  keywords:
    'joyería san pedro sula, anillos honduras, collares, aretes, accesorios, acero inoxidable, joyería sps, grabados laser',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com',
  ),
  openGraph: {
    title: 'CALIO - Joyería de Diseño en Honduras',
    description: 'Joyas para sentirte bien - San Pedro Sula, Honduras',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com',
    type: 'website',
    locale: 'es_ES',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CALIO Joyería',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CALIO - Joyería',
    description:
      'Descubre nuestra colección de joyería exclusiva en San Pedro Sula',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com',
  },
};

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-playfair', // Crea la variable CSS
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'CALIO Joyería',
    description: 'Tienda de joyería en línea',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://caliojoyeria.com'}/og-image.jpg`,
    telephone: process.env.CONTACT_PHONE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: process.env.NEXT_PUBLIC_STREET_ADDRESS || 'San Pedro Sula',
      addressLocality: 'San Pedro Sula',
      addressRegion: 'Cortés',
      postalCode: process.env.NEXT_PUBLIC_POSTAL_CODE || '',
      addressCountry: 'HN',
    },
    areaServed: {
      '@type': 'City',
      name: 'San Pedro Sula',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '15.5007',
      longitude: '-88.0234',
    },
  };

  return (
    <html
      lang="es"
      className={cn(
        inter.variable,
        playfair.variable,
        'font-sans',
        geist.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
