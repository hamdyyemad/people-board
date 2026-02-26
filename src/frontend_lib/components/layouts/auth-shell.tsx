// components/features/auth/auth-wrapper.tsx
import { getTranslations } from "@/frontend_lib/lib";
import { Logo, ThemeToggle, LanguageToggleServer, WelcomeText } from "@/frontend_lib/components/shared";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export async function AuthShell({ children }: AuthWrapperProps) {
    const translations = await getTranslations();

    return (
        <div className="relative grid place-items-center h-screen pb-8 md:py-0 px-4 sm:px-6 lg:px-8">
            {/* Top Toggles */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <LanguageToggleServer />
                <ThemeToggle />
            </div>

            <div className="mt-auto 2xl:my-auto w-full max-w-md md:space-y-8">
                {/* Consistent Brand Header */}
                <div className="mb-12" dir="ltr">
                    <Logo showText={true} size="md" />
                </div>

                <WelcomeText translations={translations} />

                {/* Dynamic Content (The "Switcher", "Register Form", etc.) */}
                {children}
            </div>
        </div>
    );
}