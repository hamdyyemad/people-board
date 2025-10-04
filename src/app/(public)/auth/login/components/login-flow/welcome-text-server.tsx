import { getTranslations } from "@/frontend_lib/lib/i18n";
import { WelcomeText } from "./welcome-text";

export async function WelcomeTextServer() {
  const translations = await getTranslations();

  return <WelcomeText translations={translations} />;
}
