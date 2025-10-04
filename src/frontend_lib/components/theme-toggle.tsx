"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../stores/theme-store";
import { cn } from "../utils/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon
          className={cn("text-gray-700 dark:text-gray-300", iconSizes[size])}
        />
      ) : (
        <Sun className={cn("text-yellow-500", iconSizes[size])} />
      )}
    </button>
  );
}
