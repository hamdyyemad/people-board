"use client";

import { RoleSelection } from "./role-step";
import { LoginFormWithRole } from "./form-step";
import { FlipCard } from "../marketing/flip-card";

import { useRoleSelection } from "@/frontend_lib/hooks/auth/use-role-selection";

interface LoginStepSwitcherProps {
  /** Dictionary of translated strings passed from the Server Component parent */
  translations: Record<string, string>;
}

/**
 * Orchestrator component that manages the transition between Role Selection 
 * and the Login Form using a 3D flip animation.
 */
export function LoginStepSwitcher({ translations }: LoginStepSwitcherProps) {
  // Extract role state and navigation handlers from our custom auth hook
  const {
    selectedRole,
    handleRoleSelect: onRoleSelect,
    handleBack: onBack,
  } = useRoleSelection();

  /**
   * DERIVED STATE: isFlipped
   * We determine if the card should show the "Back" side based on whether 
   * a role has been picked. This ensures the UI is always in sync with the data.
   */
  const isFlipped = selectedRole !== null;

  /**
   * FRONT SIDE: Role Selection
   * The initial view where the user picks between "HR" or "Employee".
   */
  const frontContent = (
    <RoleSelection
      onContinue={onRoleSelect}
      translations={translations}
    />
  );

  /**
   * BACK SIDE: Login Form
   * The secondary view. We default to "HR" for type-safety, though the 
   * FlipCard won't show this side unless selectedRole is truthy.
   */
  const backContent = (
    <LoginFormWithRole
      userRole={selectedRole || "HR"}
      onBack={onBack}
      translations={translations}
    />
  );

  return (
    <FlipCard
      isFlipped={isFlipped}
      frontContent={frontContent}
      backContent={backContent}
    />
  );
}