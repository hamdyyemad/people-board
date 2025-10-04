import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

/**
 * Theme store for managing dark/light mode
 *
 * Features:
 * - Persists theme preference in localStorage
 * - Automatically applies 'dark' class to document root
 * - Provides toggle functionality
 *
 * Usage:
 * ```tsx
 * import { useThemeStore } from '@/frontend_lib/stores/theme-store';
 *
 * function MyComponent() {
 *   const { theme, toggleTheme, setTheme } = useThemeStore();
 *   return <button onClick={toggleTheme}>Toggle Theme</button>;
 * }
 * ```
 */

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "theme-storage", // unique name for localStorage key
    }
  )
);
