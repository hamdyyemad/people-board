import { CompaniesSection } from "./components/companies-section";
import { DecoratorWrapper } from "./components/decorator-wrapper";
import { SlideshowContainer } from "./components/slideshow-container";

export function BrandPanel() {
  return (
    <DecoratorWrapper>
      <SlideshowContainer />
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-12">
        <CompaniesSection />
      </div>
    </DecoratorWrapper>
  );
}
