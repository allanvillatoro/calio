import Link from 'next/link';
import type { Metadata } from 'next';
import CategoryCarousel from '@/components/CategoryCarousel';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'CALIO - Joyería de diseño en San Pedro Sula, Honduras',
  description:
    'CALIO Joyería de San Pedro Sula, Honduras. Anillos, collares y accesorios exclusivos de acero inoxidable. Joyas para contar tu historia.',
  openGraph: {
    title: 'CALIO - Joyería en San Pedro Sula',
    description: 'Joyas para sentirte bien - Honduras',
  },
};
export default function Home() {
  const phoneNumber = process.env.CONTACT_PHONE || '';
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
              &quot;Me encanta cómo quedó el grabado. A él también le va
              encantar. Gracias a ti.&quot;
            </p>
            <p className="font-semibold tracking-wide">— Evelyn (Villanueva)</p>
          </div>

          {/* Testimonios secundarios */}
          <div className="grid md:grid-cols-2 gap-10 text-left">
            <div className="border-l-2 border-black pl-6">
              <p className="italic mb-3">
                &quot;Están super bellos. Me encanta su joyería&quot;
              </p>
              <p className="font-medium text-sm">— Lilliam (Ocotepeque)</p>
            </div>

            <div className="border-l-2 border-black pl-6">
              <p className="italic mb-3">
                &quot;Me gustaron muchísimo las cadenitas, la atención y el
                empaquetado. Muchísimas gracias por todo.&quot;
              </p>
              <p className="font-medium text-sm">— Siluat (San Pedro Sula)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CÓMO COMPRAR ================= */}
      <section className="bg-gray-50 py-12">
        <div className="container m-auto px-6">
          <h2 className="serif-title text-3xl md:text-4xl text-center mb-10">
            Cómo comprar
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-center">
            {/* Visita nuestro punto de venta */}
            <div>
              <h3 className="serif-title text-2xl mb-4">
                Visita nuestro punto de venta
              </h3>
              <p className="text-gray-600 mb-4">
                Estamos dentro de By Love Floristería y Café, Edificio Galería
                504, Bulevar UNAH-VS, San Pedro Sula, Honduras
              </p>
              <div className="w-full aspect-video overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.1519167232336!2d-88.03774432465555!3d15.52998468507405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f665b3833f26d43%3A0x70b634b17896fcb7!2sGaleria%20504!5e0!3m2!1sen!2shn!4v1773327812239!5m2!1sen!2shn"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Compra en línea */}
            <div className="flex flex-col h-full">
              <h3 className="serif-title text-2xl mb-6">Compra en línea</h3>

              <div className="grid grid-cols-2 gap-6 text-center flex-1 place-content-center">
                {[
                  'Elige tu pieza',
                  'Escríbenos por WhatsApp',
                  'Confirmamos diseño y pago',
                  'Recibe tu pedido en casa',
                ].map((step, index) => (
                  <div
                    key={index}
                    className="transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="text-5xl font-semibold mb-3 serif-title">
                      0{index + 1}
                    </div>
                    <p className="font-medium tracking-wide text-base md:text-lg">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
