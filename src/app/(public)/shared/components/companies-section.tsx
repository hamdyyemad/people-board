import { companies } from "../data/companies";

export function CompaniesSection() {
  return (
    <div className="pt-8 space-y-4">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `,
        }}
      />

      <div className="flex items-center space-x-4">
        <p className="text-xs font-semibold tracking-wider uppercase text-white/80">
          TRUSTED BY 1K+ COMPANIES
        </p>
        <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex animate-scroll space-x-8 opacity-70">
          {/* First set of companies */}
          {companies.map((company, index) => (
            <div
              key={`first-${index}`}
              className="text-white/90 font-semibold text-sm whitespace-nowrap flex-shrink-0"
            >
              {company}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companies.map((company, index) => (
            <div
              key={`second-${index}`}
              className="text-white/90 font-semibold text-sm whitespace-nowrap flex-shrink-0"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
