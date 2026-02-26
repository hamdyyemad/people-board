import { BrandPanel } from "@/frontend_lib/components/features/auth";
import { AuthShell } from "@/frontend_lib/components/layouts";
import { getTranslations } from "@/frontend_lib/lib";
/**
 * PublicLayout
 * -------------
 * Shared layout wrapper for all public authentication pages
 * such as Login, Register, Forgot Password, etc.
 *
 * This layout splits the screen into two sections:
 * - Left side (in Left-to-Right direction): the page-specific form/content (children)
 * - Right side (in Left-to-Right direction): a branding slideshow panel (BrandSlideshowPanelServer)
 */

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const translations = await getTranslations();

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 md:overflow-hidden">
      {/* Authentication Form */}
      <AuthShell>
        {children}
      </AuthShell>

      {/* Brand Slideshow */}
      <BrandPanel translations={translations} />
    </div>
  );
}
