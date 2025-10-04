import { getTranslations } from "@/frontend_lib/lib/i18n";
import { RoleSelection } from "./role-selection";

export async function RoleSelectionServer() {
  const translations = await getTranslations();

  return <RoleSelection translations={translations} />;
}
