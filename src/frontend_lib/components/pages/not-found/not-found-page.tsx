/**
 * Custom 404 page — split-screen layout aligned with reference.html.
 *
 * Structure:
 * - Full-width header: logo (top-start) + language/theme toggles (top-end)
 * - Split body (md+): illustration panel (50%) | content panel (50%)
 * - Mobile: content only; illustration hidden (matches reference)
 *
 * RTL: flex-row-reverse mirrors panels so content stays on the reading-start side.
 */

import Link from "next/link";
import { ArrowLeft, Home, LogIn, Briefcase, Users } from "lucide-react";

import { getLocale, getTranslations } from "@/frontend_lib/lib";
import {
  Logo,
  ThemeToggle,
  LanguageToggleServer,
} from "@/frontend_lib/components/shared";
import { Button } from "@/frontend_lib/components/ui/button";
import { cn } from "@/frontend_lib/utils/utils";

import { NotFoundIllustration } from "./not-found-illustration";
import { NotFoundStructuredData } from "./not-found-structured-data";

export async function NotFoundPage() {
  const translations = await getTranslations();
  const locale = await getLocale();
  const isRtl = locale === "ar";

  /**
   * Helpful Links — static placeholder list for now.
   *
   * TODO(role-based): Replace this hardcoded array with dynamic links based on
   * the authenticated user's role once auth context is available on this page:
   *   - Employee → portal routes (overview, attendance, leave, timesheets, etc.)
   *   - HR       → workspace routes (board, departments, jobs, drafts, etc.)
   *   - Guest    → keep generic links (login + both entry points) as fallback
   *
   * Suggested approach: resolve role from session/cookie, then call a small
   * helper (e.g. getNotFoundHelpfulLinks(role, translations)) that returns
   * { href, label, icon }[] so this component stays declarative.
   */
  const helpfulLinks = [
    {
      href: "/login",
      label: translations.goToLogin,
      icon: LogIn,
    },
    {
      href: "/workspace",
      label: translations.hrWorkspace,
      icon: Briefcase,
    },
    {
      href: "/portal",
      label: translations.employeePortal,
      icon: Users,
    },
  ] as const;

  return (
    <>
      <NotFoundStructuredData
        title={translations.notFoundMetaTitle}
        description={translations.notFoundMetaDescription}
      />

      <div className="flex min-h-screen w-full flex-col bg-background">
        {/* ── Header: logo + controls (full viewport width) ── */}
        <header className="relative z-50 flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo always LTR — brand lockup matches auth pages */}
          <div dir="ltr">
            <Logo showText size="md" />
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggleServer />
            <ThemeToggle />
          </div>
        </header>

        {/* ── Body: centered container (w-10/12 per reference) ── */}
        <div className="mx-auto flex w-10/12 flex-1 items-center justify-center pb-8 md:pb-12">
          <div
            className={cn(
              "flex w-full flex-col items-center md:flex-row md:items-center",
              isRtl && "md:flex-row-reverse"
            )}
          >
            {/* Left panel — illustration (desktop only, 50% width) */}
            <div className="hidden md:flex md:w-1/2 md:shrink-0">
              <NotFoundIllustration />
            </div>

            {/* Right panel — error message & navigation (100% mobile, 50% desktop) */}
            <main
              id="not-found-content"
              aria-labelledby="not-found-heading"
              dir={isRtl ? "rtl" : "ltr"}
              className={cn(
                "w-full space-y-6 p-4 md:w-1/2 md:p-8",
                isRtl ? "text-right" : "text-left"
              )}
            >
              {/* Typography matches login WelcomeText: text-3xl heading + text-sm description */}
              <div className="space-y-2">
                <h1
                  id="not-found-heading"
                  className="text-3xl font-normal tracking-tight text-foreground"
                >
                  {translations.notFoundHeading}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {translations.notFoundDescription}
                </p>
              </div>

              {/* Primary actions — button sizing matches login (h-12 text-base) */}
              <nav
                aria-label={translations.notFoundPrimaryNavLabel}
                className={cn(
                  "flex flex-col gap-3 sm:flex-row",
                  isRtl ? "sm:justify-end" : "sm:justify-start"
                )}
              >
                <Button
                  asChild
                  className="h-12 w-full text-base font-normal sm:w-auto"
                >
                  <Link href="/">
                    <Home aria-hidden="true" />
                    {translations.backToHome}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full text-base font-normal sm:w-auto"
                >
                  <Link href="/login">
                    <ArrowLeft
                      aria-hidden="true"
                      className={cn(isRtl && "rotate-180")}
                    />
                    {translations.goToLogin}
                  </Link>
                </Button>
              </nav>

              {/* Helpful Links — see TODO above for future role-based filtering */}
              <nav
                aria-label={translations.helpfulLinks}
                className="rounded-lg border border-border bg-card/50 p-6 backdrop-blur-sm"
              >
                <h2 className="mb-4 text-sm font-normal text-muted-foreground">
                  {translations.helpfulLinks}
                </h2>
                <ul className="space-y-2">
                  {helpfulLinks.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-normal text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          isRtl && "flex-row-reverse"
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-primary"
                        />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
