"use client";

import { CompaniesSection } from "./components/companies-section";
import { DecoratorWrapper } from "./components/decorator-wrapper";
import { SlideshowContainer } from "./components/slideshow-container";
import { useIsMobile } from "@/frontend_lib/hooks/use-mobile";

export function BrandPanel() {
  const isMobile = useIsMobile();

  // Don't render anything on mobile to prevent network downloads
  // Also don't render while the hook is still determining the screen size
  if (isMobile === undefined || isMobile === true) {
    return null;
  }

  return (
    <DecoratorWrapper>
      <SlideshowContainer />
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-12">
        <CompaniesSection />
      </div>
    </DecoratorWrapper>
  );
}
