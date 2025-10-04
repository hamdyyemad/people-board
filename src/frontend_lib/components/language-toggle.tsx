"use client";

import { USFlag, EgyptFlag } from "./flags";
import { cn } from "../utils/utils";
import { buildSubdomainUrl } from "../utils/subdomain";
import { buildDevSubdomainUrl } from "../utils/dev-subdomain";
import { useLocaleStore } from "../stores/locale-store";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function LanguageToggle({
  className,
  size = "md",
  showText = false,
}: LanguageToggleProps) {
  const { locale: currentLanguage } = useLocaleStore();
  const isEnglish = currentLanguage === "en";
  // const isArabic = currentLanguage === "ar";

  const toggleLanguage = () => {
    if (typeof window === "undefined") return;

    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const newLanguage = isEnglish ? "ar" : "en";

    // Try subdomain approach first, fallback to dev approach
    let newUrl: string;
    try {
      newUrl = buildSubdomainUrl(newLanguage, currentPath, currentSearch);
    } catch {
      // Fallback for development without hosts file
      newUrl = buildDevSubdomainUrl(newLanguage, currentPath, currentSearch);
    }

    // Redirect to new URL
    window.location.href = newUrl;
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const flagSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${isEnglish ? "Arabic" : "English"}`}
      title={`Current: ${isEnglish ? "English" : "العربية"} | Click to switch`}
    >
      {isEnglish ? (
        <EgyptFlag size={flagSizes[size]} />
      ) : (
        <USFlag size={flagSizes[size]} />
      )}
      {showText && (
        <span
          className={cn(
            "font-medium text-gray-700 dark:text-gray-300",
            textSizes[size]
          )}
        >
          {isEnglish ? "EN" : "AR"}
        </span>
      )}
    </button>
  );
}
