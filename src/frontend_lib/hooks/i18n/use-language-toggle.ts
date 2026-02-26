"use client";

import { useLocaleStore } from "@/frontend_lib/stores/locale-store";
import { buildSubdomainUrl } from "@/frontend_lib/utils/subdomain";
import { buildDevSubdomainUrl } from "@/frontend_lib/utils/dev-subdomain";

export function useLanguageToggle() {
  const { locale: currentLanguage } = useLocaleStore();
  const isEnglish = currentLanguage === "en";

  const toggleLanguage = () => {
    if (typeof window === "undefined") return;

    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const newLanguage = isEnglish ? "ar" : "en";
    const hostname = window.location.hostname;

    const isVercelDeployment = hostname.includes("vercel.app");

    let newUrl: string;

    if (isVercelDeployment) {
      newUrl = buildSubdomainUrl(newLanguage, currentPath, currentSearch);
    } else {
      try {
        newUrl = buildSubdomainUrl(newLanguage, currentPath, currentSearch);
      } catch {
        newUrl = buildDevSubdomainUrl(newLanguage, currentPath, currentSearch);
      }
    }

    window.location.href = newUrl;
  };

  return {
    currentLanguage,
    isEnglish,
    toggleLanguage,
  };
}
