"use client";
import { type UserRole } from "@/frontend_lib/hooks/auth";
import { BackButton } from "./back-button";
import { UserInputField } from "./user-input-field";
import { PasswordField } from "./password-field";
import { ForgotPasswordLink } from "./forgot-password-link";
import { SubmitButton } from "./submit-button";

interface LoginFormWithRoleProps {
  userRole: UserRole;
}

export function LoginFormWithRole({ userRole }: LoginFormWithRoleProps) {
  return (
    <div className="space-y-6">
      <BackButton />

      <form className="space-y-4">
        <UserInputField userRole={userRole} />
        <PasswordField />
        <ForgotPasswordLink />
        <SubmitButton userRole={userRole} />
      </form>
    </div>
  );
}
