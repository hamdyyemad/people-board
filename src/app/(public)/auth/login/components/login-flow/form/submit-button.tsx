import { Button } from "@/frontend_lib/components/ui/button";
import { type UserRole } from "@/frontend_lib/hooks/auth";

interface SubmitButtonProps {
  userRole: UserRole;
}

export function SubmitButton({ userRole }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full h-12 text-base font-normal">
      Sign In as {userRole}
    </Button>
  );
}
