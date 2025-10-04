"use client";
import { Button } from "@/frontend_lib/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRoleSelection } from "../../../hooks/use-role-selection";

export function BackButton() {
  const { handleBack: onBack } = useRoleSelection();

  return (
    <Button
      variant="ghost"
      onClick={onBack}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to role selection
    </Button>
  );
}
