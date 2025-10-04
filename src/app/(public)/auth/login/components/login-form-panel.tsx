import { Logo } from "@/frontend_lib/components/logo";
import { WelcomeText } from "./login-flow/welcome-text";
import { LoginStepSwitcher } from "./login-flow/login-step-switcher";

export function LoginFormPanel() {
  return (
    <div className="grid place-items-center h-screen pb-8 md:py-0 px-4 sm:px-6 lg:px-8">
      <div className="mt-auto w-full max-w-md md:space-y-8">
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
