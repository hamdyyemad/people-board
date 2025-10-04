import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Check if we're on Vercel deployment
  const isVercelDeployment = hostname.includes("vercel.app");

  let locale = "en"; // default
  let shouldRewrite = false;

  if (isVercelDeployment) {
    // For Vercel: Check for /ar path
    if (pathname.startsWith("/ar")) {
      locale = "ar";
      // Rewrite /ar/... to /... for internal routing
      const newPath = pathname.replace(/^\/ar/, "") || "/";
      url.pathname = newPath;
      shouldRewrite = true;
    }
  } else {
    // For local development or custom domains: Check subdomain
    if (hostname.startsWith("ar.")) {
      locale = "ar";
    }
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  if (shouldRewrite) {
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

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
