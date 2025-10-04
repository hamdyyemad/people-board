"use client";
import { useState } from "react";
import { Button } from "@/frontend_lib/components/ui/button";
import { type UserRole } from "@/frontend_lib/hooks/auth";
import { useRoleSelection } from "../../../hooks/use-role-selection";
import { RoleOption } from "./role-option";
import { getRoleOptions } from "../../../data/role-options";
import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

interface RoleSelectionProps {
  onContinue?: (role: UserRole) => void;
  translations: Record<string, string>;
}

export function RoleSelection({
  onContinue,
  translations,
}: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { handleRoleSelect: onRoleSelect } = useRoleSelection();
  const isRTL = useLocaleStore((state) => state.isRTL);

  const t = (key: string) => translations[key] || key;

  const handleContinue = () => {
    if (selectedRole) {
      if (onContinue) {
        onContinue(selectedRole);
      } else {
        onRoleSelect(selectedRole);
      }
    }
  };

  const handleDoubleClick = (role: UserRole) => {
    if (onContinue) {
      onContinue(role);
    } else {
      onRoleSelect(role);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`text-lg font-medium text-foreground mb-5 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("whoAreYou")}
        </h2>
        <ul className="grid w-full gap-6 md:grid-cols-2">
          {getRoleOptions(t).map((option) => (
            <RoleOption
              key={option.id}
              option={option}
              isSelected={selectedRole === option.id}
              onSelect={setSelectedRole}
              onDoubleClick={handleDoubleClick}
            />
          ))}
        </ul>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedRole}
        className="w-full h-12 text-base font-normal"
      >
        {t("continue")}
      </Button>
    </div>
  );
}
