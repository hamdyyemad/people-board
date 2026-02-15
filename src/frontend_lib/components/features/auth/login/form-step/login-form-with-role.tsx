"use client";
import { BackButton } from "./back-button";
import { UserInputField } from "./user-input-field";
import { PasswordField } from "./password-field";
import { ForgotPasswordLink } from "./forgot-password-link";
import { SubmitButton } from "./submit-button";

import { type UserRole } from "@/frontend_lib/hooks/auth";

interface LoginFormWithRoleProps {
  userRole: UserRole;
  onBack?: () => void;
  translations: Record<string, string>;
}

export function LoginFormWithRole({
  userRole,
  onBack,
  translations,
}: LoginFormWithRoleProps) {
  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} translations={translations} />

      <form className="space-y-4">
        <UserInputField userRole={userRole} translations={translations} />
        <PasswordField translations={translations} />
        <ForgotPasswordLink translations={translations} />
        <SubmitButton userRole={userRole} translations={translations} />
      </form>
    </div>
  );
}
