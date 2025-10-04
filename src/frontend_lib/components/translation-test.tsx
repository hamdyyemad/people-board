"use client";

import { useAppTranslation } from "../hooks/use-translation";

export function TranslationTest() {
  const { t, language, isRTL } = useAppTranslation();

  return (
    <div
      className={`p-4 bg-card text-card-foreground border border-border rounded-lg ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <h3 className="text-lg font-semibold mb-2">Translation Test</h3>
      <p className="text-muted-foreground">
        Current language: <span className="font-medium">{language}</span>
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Direction: <span className="font-medium">{isRTL ? "RTL" : "LTR"}</span>
      </p>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Welcome:</strong> {t("welcome")}
        </p>
        <p>
          <strong>Login:</strong> {t("login")}
        </p>
        <p>
          <strong>Continue:</strong> {t("continue")}
        </p>
        <p>
          <strong>Select Role:</strong> {t("selectRole")}
        </p>
        <p>
          <strong>HR:</strong> {t("hr")}
        </p>
        <p>
          <strong>Employee:</strong> {t("employee")}
        </p>
      </div>
    </div>
  );
}
