import { getTranslations } from "@/frontend_lib/lib/i18n";
import { BrandPanel } from "./brand-panel";

export async function BrandPanelServer() {
  const translations = await getTranslations();

  return <BrandPanel translations={translations} />;
}
