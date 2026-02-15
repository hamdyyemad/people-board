"use client";

import Image from "next/image";
import { useSlideshow } from "@/frontend_lib/hooks/animation/use-slideshow";
import { getSlideshowData } from "@/frontend_lib/data/slideshow-data";
import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

interface SlideshowContainerProps {
  translations: Record<string, string>;
}

export function SlideshowContainer({ translations }: SlideshowContainerProps) {
  const t = (key: string) => translations[key] || key;
  const slideshowData = getSlideshowData(t);

  const { currentSlide, animationKey } = useSlideshow({
    slideDuration: 8000, // 8 seconds per slide
    totalSlides: slideshowData.length,
  });

  return (
    <div className="flex items-center justify-center p-12 relative overflow-hidden w-full h-full">
      {/* Background Image Slider */}
      <ImageSlider currentSlide={currentSlide} translations={translations} />

      <div className="max-w-lg w-full text-white relative z-10">
        <AnimatedContent
          currentSlide={currentSlide}
          animationKey={animationKey}
          slideshowData={slideshowData}
        />
      </div>
    </div>
  );
}

function ImageSlider({
  currentSlide,
  translations,
}: {
  currentSlide: number;
  translations: Record<string, string>;
}) {
  const t = (key: string) => translations[key] || key;
  const slideshowData = getSlideshowData(t);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative w-full h-full">
        {slideshowData.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1500 ease-in-out ${index === currentSlide
              ? "opacity-30 scale-100"
              : "opacity-0 scale-105"
              }`}
          >
            <Image
              src={slide.image.src}
              alt={slide.image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d4d4d]/70 to-[#0a5c5c]/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedContent({
  currentSlide,
  animationKey,
  slideshowData,
}: {
  currentSlide: number;
  animationKey: number;
  slideshowData: Array<{
    heading: string;
    testimonial: {
      text: string;
      author: string;
      role: string;
      initials: string;
    };
    image: {
      src: string;
      alt: string;
    };
  }>;
}) {
  const currentSlideData = slideshowData[currentSlide];
  const isRTL = useLocaleStore((state) => state.isRTL);

  return (
    <div className="space-y-6" key={animationKey}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .fade-in-up-delay-1 {
            animation: fadeInUp 0.8s ease-out 0.2s forwards;
            opacity: 0;
          }
          
          .fade-in-up-delay-2 {
            animation: fadeInUp 0.8s ease-out 0.4s forwards;
            opacity: 0;
          }
          
          .fade-in-up-delay-3 {
            animation: fadeInUp 0.8s ease-out 0.6s forwards;
            opacity: 0;
          }
        `,
        }}
      />

      {/* Main Heading */}
      <div className={`fade-in-up ${isRTL ? "text-right" : "text-left"}`}>
        <h1 className="text-5xl font-normal leading-tight">
          {currentSlideData.heading}
        </h1>
      </div>

      {/* Testimonial */}
      <div className="space-y-6">
        <div
          className={`relative fade-in-up-delay-1 ${isRTL ? "text-right" : "text-left"
            }`}
        >
          <svg
            className={`absolute -top-6 w-12 h-12 text-white/40 ${isRTL ? "-right-6" : "-left-6"
              }`}
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
          </svg>
          <p className={`text-lg leading-relaxed ${isRTL ? "pr-8" : "pl-8"}`}>
            &quot;{currentSlideData.testimonial.text}&quot;
          </p>
        </div>

        {/* Testimonial Author */}
        <div
          className={`flex items-center ${isRTL ? "space-x-reverse space-x-3 pr-8" : "space-x-3 pl-8"
            } fade-in-up-delay-2`}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {currentSlideData.testimonial.initials}
          </div>
          <div
            className={`fade-in-up-delay-3 ${isRTL ? "text-right" : "text-left"
              }`}
          >
            <p className="font-medium">{currentSlideData.testimonial.author}</p>
            <p className="text-sm text-white/80">
              {currentSlideData.testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
