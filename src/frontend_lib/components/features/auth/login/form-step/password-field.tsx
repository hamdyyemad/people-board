"use client";
import { Label } from "@/frontend_lib/components/ui/label";
import { PasswordInput } from "@/frontend_lib/components/ui/password-input";

interface PasswordFieldProps {
  translations: Record<string, string>;
}

export function PasswordField({ translations }: PasswordFieldProps) {
  const t = (key: string) => translations[key] || key;

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-normal">
        {t("password")}
      </Label>
      <PasswordInput
        id="password"
        name="password"
        placeholder={t("passwordPlaceholder")}
        required
      />
    </div>
  );
}
