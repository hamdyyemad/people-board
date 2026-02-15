"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

interface LocaleProviderProps {
  initialLocale: "en" | "ar";
  children: React.ReactNode;
}

export function LocaleProvider({
  initialLocale,
  children,
}: LocaleProviderProps) {
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    // Initialize the store with the server-determined locale
    setLocale(initialLocale);
  }, [initialLocale, setLocale]);

  return <>{children}</>;
}
