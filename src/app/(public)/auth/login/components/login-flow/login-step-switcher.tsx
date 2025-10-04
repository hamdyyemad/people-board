"use client";
import { RoleSelection } from "./role-based/role-selection";
import { LoginFormWithRole } from "./form/login-form-with-role";
import { useRoleSelection } from "../../hooks/use-role-selection";

export function LoginStepSwitcher() {
  const { selectedRole } = useRoleSelection();

  return (
    <>
      {!selectedRole ? (
        <RoleSelection />
      ) : (
        <LoginFormWithRole userRole={selectedRole} />
      )}
    </>
  );
}
