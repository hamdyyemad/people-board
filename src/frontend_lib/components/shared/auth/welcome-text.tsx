"use client";

import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

interface WelcomeTextProps {
  translations: Record<string, string>;
}

export function WelcomeText({ translations }: WelcomeTextProps) {
  const isRTL = useLocaleStore((state) => state.isRTL);
  const t = (key: string) => translations[key] || key;

  const welcomeBack = t("welcomeBack");
  const signInDescription = t("signInDescription");

  return (
    <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
      <h1 className="text-3xl font-normal tracking-tight">{welcomeBack}</h1>
      <p className="text-sm text-muted-foreground">{signInDescription}</p>
    </div>
  );
}
