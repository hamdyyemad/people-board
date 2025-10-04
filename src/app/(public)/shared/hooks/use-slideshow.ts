import { useState, useEffect } from "react";

interface UseSlideshowOptions {
  slideDuration?: number; // Duration in milliseconds
  totalSlides: number;
}

interface UseSlideshowReturn {
  currentSlide: number;
  animationKey: number;
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  isPlaying: boolean;
  pause: () => void;
  play: () => void;
}

export function useSlideshow({
  slideDuration = 8000,
  totalSlides,
}: UseSlideshowOptions): UseSlideshowReturn {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
      setAnimationKey((prev) => prev + 1); // Trigger animation restart
    }, slideDuration);

    return () => clearInterval(interval);
  }, [slideDuration, totalSlides, isPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setAnimationKey((prev) => prev + 1);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setAnimationKey((prev) => prev + 1);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
      setAnimationKey((prev) => prev + 1);
    }
  };

  const pause = () => setIsPlaying(false);
  const play = () => setIsPlaying(true);

  return {
    currentSlide,
    animationKey,
    nextSlide,
    previousSlide,
    goToSlide,
    isPlaying,
    pause,
    play,
  };
}
