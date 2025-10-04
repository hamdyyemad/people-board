import { BrandPanelServer } from "../../shared/brand-panel-server";
import { LoginFormPanel } from "./components/login-form-panel";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 md:overflow-hidden">
      <LoginFormPanel />
      <BrandPanelServer />
    </div>
  );
}
