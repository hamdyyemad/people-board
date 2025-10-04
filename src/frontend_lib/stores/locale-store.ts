import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en" | "ar";

interface LocaleState {
  locale: Locale;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      isRTL: false,
      setLocale: (locale: Locale) =>
        set({
          locale,
          isRTL: locale === "ar",
        }),
    }),
    {
      name: "locale-storage",
      // Only persist the locale, isRTL is derived
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
