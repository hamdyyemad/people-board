import { Logo } from "@/frontend_lib/components/logo";
import { WelcomeText } from "./login-flow/welcome-text";
import { LoginStepSwitcher } from "./login-flow/login-step-switcher";

export function LoginFormPanel() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="mb-12">
          <Logo showText={true} size="md" />
        </div>

        {/* Welcome Text */}
        <WelcomeText />

        {/* Role Selection or Login Form */}
        <LoginStepSwitcher />
      </div>
    </div>
  );
}
