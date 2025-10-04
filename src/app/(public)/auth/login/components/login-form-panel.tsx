import { Logo } from "@/frontend_lib/components/logo";
import { WelcomeTextServer } from "./login-flow/welcome-text-server";
import { LoginStepSwitcherServer } from "./login-flow/login-step-switcher-server";
import { ThemeToggle } from "@/frontend_lib/components/theme-toggle";
import { LanguageToggleServer } from "@/frontend_lib/components/language-toggle-server";

export function LoginFormPanel() {
  return (
    <div className="relative grid place-items-center h-screen pb-8 md:py-0 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <LanguageToggleServer />
        <ThemeToggle />
      </div>
      <div className="mt-auto w-full max-w-md md:space-y-8">
        {/* Logo */}
        <div className="mb-12" dir="ltr">
          <Logo showText={true} size="md" />
        </div>

        {/* Welcome Text */}
        <WelcomeTextServer />

        {/* Role Selection or Login Form */}
        <LoginStepSwitcherServer />
      </div>
    </div>
  );
}
