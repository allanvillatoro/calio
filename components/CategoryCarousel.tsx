'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

const categories = [
  {
    name: 'NUEVA COLECCIÓN',
    slug: 'new+in',
    link: '/images/categorias/new in.jpeg',
  },
  { name: 'ARETES', slug: 'aretes', link: '/images/categorias/aretes.jpeg' },
  {
    name: 'COLLARES',
    slug: 'collares',
    link: '/images/categorias/collares.jpeg',
  },
  {
    name: 'PULSERAS',
    slug: 'pulseras',
    link: '/images/categorias/pulseras.jpeg',
  },
  { name: 'ANILLOS', slug: 'anillos', link: '/images/categorias/anillos.jpeg' },
  { name: 'SETS', slug: 'sets', link: '/images/categorias/sets.jpeg' },
  {
    name: 'STUDS & CUFFS',
    slug: 'studs-cuffs',
    link: '/images/categorias/studs.jpeg',
  },
];

export default function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="container mx-auto px-6 py-24">
      <h2 className="serif-title text-3xl md:text-4xl text-center mb-12">
        Explora nuestras piezas
      </h2>

      {/* Wrapper con posición relativa para las flechas */}
      <div className="relative">
        {/* Flecha izquierda */}
        <button
          onClick={() => scroll('left')}
          aria-label="Anterior"
          disabled={!showLeft}
          className={`absolute left-0 top-1/2 z-10 rounded-full border border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 ${
            showLeft
              ? '-translate-x-1/2 -translate-y-1/2 hover:bg-black hover:text-white'
              : '-translate-x-1/2 -translate-y-1/2 pointer-events-none invisible opacity-0'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          onClick={() => scroll('right')}
          aria-label="Siguiente"
          disabled={!showRight}
          className={`absolute right-0 top-1/2 z-10 rounded-full border border-gray-200 bg-white p-2 shadow-lg transition-all duration-200 ${
            showRight
              ? 'translate-x-1/2 -translate-y-1/2 hover:bg-black hover:text-white'
              : 'translate-x-1/2 -translate-y-1/2 pointer-events-none invisible opacity-0'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Carrusel */}
        <div
          ref={scrollRef}
          className="carousel-scroll flex gap-6 overflow-x-auto scroll-smooth pb-4"
        >
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/catalogo?categorias=${item.slug}`}
              className="group block flex-none"
              style={{ width: '280px' }}
            >
              <div className="bg-gray-200 aspect-square flex items-center justify-center text-sm tracking-wide transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-xl">
                <Image
                  src={item.link}
                  alt={item.name}
                  width={600}
                  height={600}
                />
              </div>

              <p className="mt-4 text-center font-medium tracking-wide transition-all duration-300 group-hover:tracking-widest">
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
