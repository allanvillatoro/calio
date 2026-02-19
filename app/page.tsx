import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CALIO - Joyería Fina de Diseño en San Pedro Sula, Honduras",
  description:
    "CALIO Joyería de San Pedro Sula, Honduras. Anillos, collares y accesorios exclusivos de plata y oro. Joyas finas para contar tu historia.",
  openGraph: {
    title: "CALIO - Joyería Fina en San Pedro Sula",
    description: "Joyas para sentirte bien - Honduras",
  },
};

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Everything is silver & gold
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            La joyería es una extensión de lo que somos. Una herramienta para
            contar nuestra historia.
          </p>
          <Link
            href="/catalogo"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Explorar Colección
          </Link>
        </div>
      </section>

      {/* Features Section */}
    </div>
  );
}
