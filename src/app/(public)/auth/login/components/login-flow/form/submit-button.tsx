import { Button } from "@/frontend_lib/components/ui/button";
import { type UserRole } from "@/frontend_lib/hooks/auth";

interface SubmitButtonProps {
  userRole: UserRole;
  translations: Record<string, string>;
}

export function SubmitButton({ userRole, translations }: SubmitButtonProps) {
  const t = (key: string) => translations[key] || key;

  return (
    <Button type="submit" className="w-full h-12 text-base font-normal">
      {t("signInAs")} {userRole}
    </Button>
  );
}
