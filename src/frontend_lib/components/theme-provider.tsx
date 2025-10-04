"use client";

import { useEffect } from "react";
import { useThemeStore } from "../stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
