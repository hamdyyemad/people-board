"use client";
import { RoleSelection } from "./role-based/role-selection";
import { LoginFormWithRole } from "./form/login-form-with-role";
import { useRoleSelection } from "../../hooks/use-role-selection";
import { FlipCard } from "@/frontend_lib/components/flip-card";

export function LoginStepSwitcher() {
  const {
    selectedRole,
    handleRoleSelect: onRoleSelect,
    handleBack: onBack,
  } = useRoleSelection();

  // Derive isFlipped from selectedRole - no need for additional state
  const isFlipped = selectedRole !== null;

  const frontContent = <RoleSelection onContinue={onRoleSelect} />;

  const backContent = (
    <LoginFormWithRole userRole={selectedRole || "HR"} onBack={onBack} />
  );

  return (
    <FlipCard
      isFlipped={isFlipped}
      frontContent={frontContent}
      backContent={backContent}
    />
  );
}
