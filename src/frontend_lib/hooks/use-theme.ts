import { useThemeStore } from "../stores/theme-store";

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
}
