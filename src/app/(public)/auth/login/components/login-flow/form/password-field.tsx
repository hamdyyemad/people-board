"use client";
import { Label } from "@/frontend_lib/components/ui/label";
import { PasswordInput } from "@/frontend_lib/components/ui/password-input";

export function PasswordField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-normal">
        Password
      </Label>
      <PasswordInput
        id="password"
        name="password"
        placeholder="Enter your password"
        required
      />
    </div>
  );
}
