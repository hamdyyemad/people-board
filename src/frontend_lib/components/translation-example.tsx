"use client";

import { useAppTranslation } from "../hooks/use-translation";

export function TranslationExample() {
  const { t, language, isRTL, changeLanguage } = useAppTranslation();

  return (
    <div className="p-4 bg-card text-card-foreground border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{t("welcome")}</h3>
      <p className="text-muted-foreground">
        Current language: <span className="font-medium">{language}</span>
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Direction: <span className="font-medium">{isRTL ? "RTL" : "LTR"}</span>
      </p>

      <div className="mt-4 space-y-2">
        <p>
          {t("login")}: {t("email")}
        </p>
        <p>
          {t("selectRole")}: {t("hr")} / {t("employee")}
        </p>
      </div>

      <div className="mt-4">
        <button
          onClick={() => changeLanguage(isRTL ? "en" : "ar")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          {t("language")}: {isRTL ? "English" : "العربية"}
        </button>
      </div>
    </div>
  );
}
