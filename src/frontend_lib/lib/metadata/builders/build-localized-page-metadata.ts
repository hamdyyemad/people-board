import type { Metadata } from "next";

/** Supported app locales — mirrors i18n module. */
type Locale = "en" | "ar";

/** Input for building localized page metadata via the shared builder. */
type LocalizedPageMetadataInput = {
  title: string;
  description: string;
  locale: Locale;
  /** Defaults to indexable; pass { index: false } for error/private pages. */
  robots?: Metadata["robots"];
};

/** Maps app locale codes to Open Graph locale strings (e.g. ar → ar_EG). */
function toOpenGraphLocale(locale: Locale): string {
  return locale === "ar" ? "ar_EG" : "en_US";
}

/**
 * Builds a consistent Metadata object for localized pages.
 *
 * Centralizes duplicated fields (title, description, openGraph) so each
 * page generator only supplies page-specific values and robots policy.
 *
 * @example
 * buildLocalizedPageMetadata({
 *   title: translations.someMetaTitle,
 *   description: translations.someMetaDescription,
 *   locale,
 * });
 */
export function buildLocalizedPageMetadata({
  title,
  description,
  locale,
  robots = { index: true, follow: true },
}: LocalizedPageMetadataInput): Metadata {
  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      type: "website",
      locale: toOpenGraphLocale(locale),
    },
  };
}
