import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "CALIO - Joyería Fina | Anillos, Collares y Accesorios en San Pedro Sula",
  description:
    "Descubre joyería de lujo en CALIO, San Pedro Sula, Honduras. Anillos, collares, aretes y accesorios de plata y oro. Diseños únicos para contar tu historia.",
  keywords:
    "joyería San Pedro Sula, anillos Honduras, collares, aretes, accesorios, plata, oro, joyería fina, joyería SPS",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com",
  ),
  openGraph: {
    title: "CALIO - Joyería Fina de Diseño en Honduras",
    description: "Joyas para sentirte bien - San Pedro Sula, Honduras",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CALIO Joyería",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CALIO - Joyería Fina",
    description:
      "Descubre nuestra colección de joyería exclusiva en San Pedro Sula",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "CALIO Joyería",
    description: "Tienda de joyería fina en línea",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com",
    image: `${process.env.NEXT_PUBLIC_SITE_URL || "https://caliojoyeria.com"}/og-image.jpg`,
    telephone: process.env.CONTACT_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: process.env.NEXT_PUBLIC_STREET_ADDRESS || "San Pedro Sula",
      addressLocality: "San Pedro Sula",
      addressRegion: "Cortés",
      postalCode: process.env.NEXT_PUBLIC_POSTAL_CODE || "",
      addressCountry: "HN",
    },
    areaServed: {
      "@type": "City",
      name: "San Pedro Sula",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "15.5007",
      longitude: "-88.0234",
    },
  };

  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
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
