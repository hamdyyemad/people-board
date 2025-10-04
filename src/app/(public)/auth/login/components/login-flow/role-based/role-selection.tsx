"use client";
import { useState } from "react";
import { Button } from "@/frontend_lib/components/ui/button";
import { type UserRole } from "@/frontend_lib/hooks/auth";
import { useRoleSelection } from "../../../hooks/use-role-selection";
import { RoleOption } from "./role-option";

interface RoleOptionData {
  id: UserRole;
  label: string;
  description: string;
  icon: string;
  glowColor: string;
  iconColor: string;
}

const roleOptions: RoleOptionData[] = [
  {
    id: "HR",
    label: "HR Staff",
    description: "Login as HR",
    icon: "M20 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H20C20.5523 17 21 16.5523 21 16V8C21 7.44772 20.5523 7 20 7Z",
    glowColor: "16, 80, 94",
    iconColor: "text-primary",
  },
  {
    id: "Employee",
    label: "Employee",
    description: "Login as Employee",
    icon: "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
    glowColor: "34, 197, 94",
    iconColor: "text-green-600",
  },
];

interface RoleSelectionProps {
  onContinue?: (role: UserRole) => void;
}

export function RoleSelection({ onContinue }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { handleRoleSelect: onRoleSelect } = useRoleSelection();

  const handleContinue = () => {
    if (selectedRole) {
      if (onContinue) {
        onContinue(selectedRole);
      } else {
        onRoleSelect(selectedRole);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-5">
          Who are you?
        </h3>
        <ul className="grid w-full gap-6 md:grid-cols-2">
          {roleOptions.map((option) => (
            <RoleOption
              key={option.id}
              option={option}
              isSelected={selectedRole === option.id}
              onSelect={setSelectedRole}
            />
          ))}
        </ul>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedRole}
        className="w-full h-12 text-base font-normal"
      >
        Continue
      </Button>
    </div>
  );
}
