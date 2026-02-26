"use client";

import { Flag } from "@/frontend_lib/components/shared/flags";
import { useLanguageToggle } from "@/frontend_lib/hooks/i18n/use-language-toggle";
import { cn } from "@/frontend_lib/utils/utils";

export function LanguageSwitcherPill() {
  const { isEnglish, toggleLanguage } = useLanguageToggle();

  return (
    <div className="flex rounded-full border border-border bg-muted/50 p-0.5">
      <button
        type="button"
        onClick={() => !isEnglish && toggleLanguage()}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
          isEnglish
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Flag code="us" size={14} rounded />
        EN
      </button>
      <button
        type="button"
        onClick={() => isEnglish && toggleLanguage()}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors",
          !isEnglish
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Flag code="eg" size={14} rounded />
        AR
      </button>
    </div>
  );
}
