'use client';

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Main Image Display */}
      <div className="relative w-full h-96 md:h-[600px] bg-white rounded-lg overflow-hidden shadow-lg">
        <CldImage
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          width="800"
          height="800"
          crop={{
            type: 'auto',
            source: true,
          }}
          className="h-full w-full object-cover"
          preload={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation Arrows - Only show if more than one image */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
              aria-label="Imagen anterior"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
              aria-label="Imagen siguiente"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if more than one image */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <CldImage
                src={imageUrl}
                alt={`Miniatura ${index + 1}`}
                width="100"
                height="100"
                crop={{
                  type: 'auto',
                  source: true,
                }}
                className="h-full w-full object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
