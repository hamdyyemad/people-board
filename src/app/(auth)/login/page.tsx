import { LoginStepSwitcher } from "@/frontend_lib/components/features/auth";
import { getTranslations } from "@/frontend_lib/lib";

export default async function LoginPage() {
  const translations = await getTranslations();

  return (
    <LoginStepSwitcher translations={translations} />
  );
}
