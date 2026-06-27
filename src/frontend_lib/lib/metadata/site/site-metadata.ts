import type { Metadata } from "next";

/**
 * Default site-wide SEO metadata for the root layout.
 * Applied to all pages unless overridden by a route-level generateMetadata.
 *
 * Kept in English for now; localize later via generateMetadata in layout if needed.
 */
export const siteMetadata: Metadata = {
  title: "People Board",
  description: "A modern dashboard for managing people and teams",
};
