import { useTranslation } from "react-i18next";
import { getLanguageFromSubdomain } from "../utils/subdomain";
import { buildSubdomainUrl } from "../utils/subdomain";
import { buildDevSubdomainUrl } from "../utils/dev-subdomain";

export function useAppTranslation() {
  const { t, i18n } = useTranslation("common");

  const language = getLanguageFromSubdomain();

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Translation Debug:", {
      language,
      i18nLanguage: i18n.language,
      isInitialized: i18n.isInitialized,
      hasResources: !!i18n.getResourceBundle(language, "common"),
    });
  }

  // Enhanced changeLanguage function that handles URL changes for Vercel
  const changeLanguage = (newLanguage: "en" | "ar") => {
    if (typeof window === "undefined") return;

    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const hostname = window.location.hostname;

    // Check if we're on Vercel deployment
    const isVercelDeployment = hostname.includes("vercel.app");

    let newUrl: string;

    if (isVercelDeployment) {
      // For Vercel, try subdomain approach
      try {
        newUrl = buildSubdomainUrl(newLanguage, currentPath, currentSearch);
      } catch {
        // Fallback: use query parameter approach for Vercel
        const url = new URL(window.location.href);
        url.searchParams.set("lang", newLanguage);
        newUrl = url.toString();
      }
    } else {
      // For local development
      try {
        newUrl = buildSubdomainUrl(newLanguage, currentPath, currentSearch);
      } catch {
        // Fallback for development without hosts file
        newUrl = buildDevSubdomainUrl(newLanguage, currentPath, currentSearch);
      }
    }

    // Redirect to new URL
    window.location.href = newUrl;
  };

  return {
    t,
    i18n,
    language,
    isEnglish: language === "en",
    isArabic: language === "ar",
    isRTL: language === "ar",
    isLTR: language === "en",
    changeLanguage,
  };
}
