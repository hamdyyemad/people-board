import type { Metadata } from "next";

import { getLocale, getTranslations } from "../../../i18n";
import { buildLocalizedPageMetadata } from "../../builders/build-localized-page-metadata";

/**
 * Generates localized SEO metadata for the 404 (not-found) page.
 *
 * Wired in app/not-found.tsx as:
 *   export const generateMetadata = generateNotFoundMetadata;
 *
 * Uses noindex so search engines do not index missing/broken URLs.
 * Translation keys live in locales/{en,ar}/common.json.
 */
export async function generateNotFoundMetadata(): Promise<Metadata> {
  const [translations, locale] = await Promise.all([
    getTranslations(),
    getLocale(),
  ]);

  return buildLocalizedPageMetadata({
    title: translations.notFoundMetaTitle,
    description: translations.notFoundMetaDescription,
    locale,
    // 404 pages should not appear in search results
    robots: { index: false, follow: true },
  });
}
