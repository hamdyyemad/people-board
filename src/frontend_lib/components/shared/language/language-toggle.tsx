"use client";

import { useLanguageToggle } from "@/frontend_lib/hooks/i18n/use-language-toggle";
import { cn } from "@/frontend_lib/utils/utils";
import { Flag } from "@/frontend_lib/components/shared/flags";
import { Button } from "@/frontend_lib/components/ui/button";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

/** Matches navbar icon button: h-9 w-9 with h-4 w-4 (16px) icon */
const sizeClasses = {
  sm: "h-9 w-9 shrink-0 rounded-full p-0",
  md: "p-2 rounded-full",
  lg: "p-3 rounded-full",
};

const textSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const flagSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function LanguageToggle({
  className,
  size = "md",
  showText = false,
}: LanguageToggleProps) {
  const { isEnglish, toggleLanguage } = useLanguageToggle();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className={cn(
        "flex items-center justify-center gap-2",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${isEnglish ? "Arabic" : "English"}`}
      title={`Current: ${isEnglish ? "English" : "العربية"} | Click to switch`}
    >
      <Flag
        code={isEnglish ? "eg" : "us"}
        size={flagSizes[size]}
        rounded
      />
      {showText && (
        <span
          className={cn(
            "font-medium text-gray-700 dark:text-gray-300",
            textSizes[size]
          )}
        >
          {isEnglish ? "EN" : "AR"}
        </span>
      )}
    </Button>
  );
}
