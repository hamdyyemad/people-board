import {
  useRoleSelectionStore,
  type UserRole,
} from "@/frontend_lib/hooks/auth";

export function useRoleSelection() {
  const { selectedRole, setSelectedRole, clearSelectedRole } =
    useRoleSelectionStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    clearSelectedRole();
  };

  return {
    selectedRole,
    setSelectedRole,
    handleRoleSelect,
    handleBack,
  };
}
