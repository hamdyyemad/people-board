import { useTranslation } from "react-i18next";
import { getLanguageFromSubdomain } from "../utils/subdomain";

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

  return {
    t,
    i18n,
    language,
    isEnglish: language === "en",
    isArabic: language === "ar",
    isRTL: language === "ar",
    isLTR: language === "en",
    changeLanguage: i18n.changeLanguage,
  };
}
