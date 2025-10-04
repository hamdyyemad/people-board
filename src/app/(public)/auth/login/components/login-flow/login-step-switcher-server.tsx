import { getTranslations } from "@/frontend_lib/lib/i18n";
import { LoginStepSwitcher } from "./login-step-switcher";

export async function LoginStepSwitcherServer() {
  const translations = await getTranslations();

  return <LoginStepSwitcher translations={translations} />;
}
