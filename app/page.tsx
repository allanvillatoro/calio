import Link from "next/link";
import type { Metadata } from "next";
import CategoryCarousel from "@/components/CategoryCarousel";
import Image from "next/image";

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
  const phoneNumber = process.env.CONTACT_PHONE || "";
  const message = `Hola, quiero un grabado láser personalizado`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-white text-black">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpeg"
            alt="calio"
            fill
            priority
            className="object-cover scale-105 animate-[fadeIn_1.2s_ease-out]"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative container mx-auto px-6 py-32 text-center text-white">
          <h1 className="serif-title text-4xl md:text-6xl font-semibold tracking-wide mb-6 opacity-0 animate-[fadeUp_1s_ease-out_0.3s_forwards]">
            Everything is gold & silver
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-[fadeUp_1s_ease-out_0.6s_forwards]">
            La joyería es una extensión de lo que somos. Cada pieza cuenta una
            historia, la tuya.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 opacity-0 animate-[fadeUp_1s_ease-out_0.9s_forwards]">
            <Link
              href="/catalogo"
              className="bg-white text-black px-8 py-3 font-semibold tracking-wide hover:scale-105 transition-all duration-300"
            >
              Explorar Colección
            </Link>

            <a
              href="#personalizacion"
              className="border border-white px-8 py-3 font-semibold tracking-wide hover:bg-white hover:text-black hover:scale-105 transition-all duration-300"
            >
              Personaliza tu joya
            </a>
          </div>
        </div>
      </section>

      {/* ================= QUÉ OFRECEMOS ================= */}
      <CategoryCarousel />

      {/* ================= PERSONALIZACIÓN ================= */}
      <section id="personalizacion" className="bg-black text-white py-12">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="bg-gray-800 aspect-square flex items-center justify-center text-sm transition-all duration-700 hover:scale-105">
            <Image
              src="/images/grabados.jpeg"
              alt="grabados"
              width={600}
              height={600}
            />
          </div>
          <div>
            <h2 className="serif-title text-3xl md:text-4xl mb-6">
              Personaliza tu joya con grabado láser
            </h2>

            <p className="text-lg leading-relaxed mb-10 text-gray-300">
              Convierte una pieza en un recuerdo eterno. Grabamos nombres,
              fechas, frases o incluso la silueta de tu mascota. Perfecto para
              regalar o guardar un momento especial.
            </p>

            <Link
              href={whatsappUrl}
              className="inline-block bg-white text-black px-8 py-3 font-semibold tracking-wide hover:scale-105 transition-all duration-300"
            >
              Quiero personalizar
            </Link>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIOS ================= */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-serif mb-16 tracking-tight">
            Lo que dicen nuestros clientes
          </h2>

          {/* Testimonio principal */}
          <div className="mb-20">
            <p className="text-2xl md:text-3xl italic font-light leading-relaxed mb-6">
              “Mandé a grabar la silueta de mi perro y quedó hermoso.”
            </p>
            <p className="font-semibold tracking-wide">— María G.</p>
          </div>

          {/* Testimonios secundarios */}
          <div className="grid md:grid-cols-2 gap-10 text-left">
            <div className="border-l-2 border-black pl-6">
              <p className="italic mb-3">
                Están super bellos. Me encanta su joyería”
              </p>
              <p className="font-medium text-sm">— Lilliam (Ocotepeque)</p>
            </div>

            <div className="border-l-2 border-black pl-6">
              <p className="italic mb-3">
                “El regalo perfecto para una fecha especial.”
              </p>
              <p className="font-medium text-sm">— Sofía L.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CÓMO COMPRAR ================= */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <h2 className="serif-title text-3xl md:text-4xl text-center mb-20">
            Cómo comprar
          </h2>

          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              "Elige tu pieza",
              "Escríbenos por WhatsApp",
              "Confirmamos diseño y pago",
              "Recibe tu pedido en casa",
            ].map((step, index) => (
              <div
                key={index}
                className="transition-all duration-500 hover:-translate-y-2"
              >
                <div className="text-5xl font-semibold mb-6 serif-title">
                  0{index + 1}
                </div>
                <p className="font-medium tracking-wide">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ENVÍOS ================= */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="serif-title text-3xl md:text-4xl mb-12">
          Envíos locales y nacionales
        </h2>

        <div className="space-y-5 text-lg">
          <p className="transition-all duration-300 hover:tracking-widest">
            Envíos a toda Honduras por un costo adicional
          </p>
          <p className="transition-all duration-300 hover:tracking-widest">
            Pagos por transferencia con diferentes bancos
          </p>
          <p className="transition-all duration-300 hover:tracking-widest">
            Tiempos estimados de entrega de 24 horas para San Pedro Sula, 1-2
            días hábiles para el resto del país
          </p>
        </div>
      </section>
    </div>
  );
}
