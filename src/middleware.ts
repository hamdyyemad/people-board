import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl;

  // Check if we're on Vercel and handle subdomain routing
  const isVercelDeployment = hostname.includes("vercel.app");

  let locale = "en"; // default

  // First, check for query parameter (fallback for Vercel)
  const langParam = url.searchParams.get("lang");
  if (langParam === "ar" || langParam === "en") {
    locale = langParam;
  } else if (isVercelDeployment) {
    // For Vercel, check if the hostname starts with 'ar.'
    if (hostname.startsWith("ar.")) {
      locale = "ar";
    }
  } else {
    // For local development or custom domains
    locale = hostname.startsWith("ar.") ? "ar" : "en";
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
