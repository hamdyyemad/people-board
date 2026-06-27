/**
 * Metadata module — public API.
 *
 * Folder layout:
 *   site/     → root layout defaults (site-metadata.ts)
 *   builders/ → shared metadata construction helpers
 *   pages/    → route-specific generateMetadata functions
 *               └── not-found/ → 404 page SEO
 *
 * Import from here (or @/frontend_lib/lib) when wiring Next.js metadata.
 */

export { siteMetadata as metadata } from "./site/site-metadata";
export { buildLocalizedPageMetadata } from "./builders/build-localized-page-metadata";
export { generateNotFoundMetadata } from "./pages/not-found/generate-metadata";
