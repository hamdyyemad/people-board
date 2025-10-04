import { companies } from "../data/companies";
import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

interface CompaniesSectionProps {
  translations: Record<string, string>;
}

export function CompaniesSection({ translations }: CompaniesSectionProps) {
  const t = (key: string) => translations[key] || key;
  const isRTL = useLocaleStore((state) => state.isRTL);

  return (
    <div className="pt-8 space-y-4">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }

          .animate-scroll-rtl {
            animation: scroll-rtl 20s linear infinite;
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @keyframes scroll-rtl {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(50%);
            }
          }
        `,
        }}
      />

      <div
        className={`flex items-center ${
          isRTL ? "space-x-reverse space-x-4" : "space-x-4"
        }`}
      >
        <p className="text-xs font-semibold tracking-wider uppercase text-white/80">
          {t("trustedByCompanies")}
        </p>
        <div
          className={`flex-1 h-px ${
            isRTL
              ? "bg-gradient-to-l from-white/20 to-transparent"
              : "bg-gradient-to-r from-white/20 to-transparent"
          }`}
        ></div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className={`flex ${
            isRTL
              ? "animate-scroll-rtl space-x-reverse space-x-8"
              : "animate-scroll space-x-8"
          } opacity-70`}
        >
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
