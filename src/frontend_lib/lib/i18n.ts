import { headers } from "next/headers";
import { cache } from "react";

type Locale = "en" | "ar";

// Cache the translation loading to avoid multiple reads
export const getTranslations = cache(
  async (): Promise<Record<string, string>> => {
    const headersList = await headers();
    const locale = (headersList.get("x-locale") || "en") as Locale;

    try {
      // Dynamically import only the needed language file
      const translations = await import(`../../locales/${locale}/common.json`);
      return translations.default;
    } catch (error) {
      console.error(`Failed to load translations for locale: ${locale}`, error);
      // Fallback to English
      const fallback = await import("../../locales/en/common.json");
      return fallback.default;
    }
  }
);

export const getLocale = cache(async (): Promise<Locale> => {
  const headersList = await headers();
  return (headersList.get("x-locale") || "en") as Locale;
});

// Helper function for translations
export async function t(key: string): Promise<string> {
  const translations = await getTranslations();
  return translations[key] || key;
}
