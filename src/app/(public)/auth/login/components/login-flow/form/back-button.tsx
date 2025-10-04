"use client";
import { Button } from "@/frontend_lib/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRoleSelection } from "../../../hooks/use-role-selection";

interface BackButtonProps {
  onBack?: () => void;
  translations: Record<string, string>;
}

export function BackButton({ onBack, translations }: BackButtonProps) {
  const { handleBack: defaultOnBack } = useRoleSelection();
  const t = (key: string) => translations[key] || key;

  const handleClick = () => {
    if (onBack) {
      onBack();
    } else {
      defaultOnBack();
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
    >
      <ArrowLeft className="h-4 w-4" />
      {t("backToRoleSelection")}
    </Button>
  );
}
