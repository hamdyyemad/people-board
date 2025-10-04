"use client";
import { useState } from "react";
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
  const [isFlipped, setIsFlipped] = useState(false);

  const handleRoleSelect = (role: any) => {
    setIsFlipped(true);
    onRoleSelect(role);
  };

  const handleBack = () => {
    setIsFlipped(false);
    onBack();
  };

  const frontContent = <RoleSelection onContinue={handleRoleSelect} />;

  const backContent = (
    <LoginFormWithRole userRole={selectedRole || "HR"} onBack={handleBack} />
  );

  return (
    <FlipCard
      isFlipped={isFlipped}
      frontContent={frontContent}
      backContent={backContent}
    />
  );
}
