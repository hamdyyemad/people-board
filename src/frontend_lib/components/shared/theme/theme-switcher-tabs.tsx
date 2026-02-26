"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/frontend_lib/stores/theme-store";
import { cn } from "@/frontend_lib/utils/utils";

export function ThemeSwitcherPill() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex rounded-full border border-border bg-muted/50 p-0.5">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
          theme === "dark"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
          theme === "light"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </button>
    </div>
  );
}
