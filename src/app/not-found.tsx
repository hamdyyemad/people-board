/**
 * Next.js App Router 404 handler.
 *
 * Automatically rendered when:
 * - A user visits a route that does not exist
 * - A page calls notFound() from "next/navigation"
 */

import { NotFoundPage } from "@/frontend_lib/components/pages/not-found";
import { generateNotFoundMetadata } from "@/frontend_lib/lib/metadata";

export const generateMetadata = generateNotFoundMetadata;

export default function NotFound() {
  return <NotFoundPage />;
}
