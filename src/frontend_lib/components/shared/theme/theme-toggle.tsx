"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/frontend_lib/stores/theme-store";
import { cn } from "@/frontend_lib/utils/utils";
import { Button } from "@/frontend_lib/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

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

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full",
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
    </Button>
  );
}
