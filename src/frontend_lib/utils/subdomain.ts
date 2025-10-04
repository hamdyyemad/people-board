/**
 * Utility functions for subdomain-based internationalization
 */

export function getLanguageFromSubdomain(): "en" | "ar" {
  if (typeof window === "undefined") return "en";

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Check if we're on Vercel deployment
  const isVercelDeployment = hostname.includes("vercel.app");

  if (isVercelDeployment) {
    // For Vercel: Check for /ar path
    return pathname.startsWith("/ar") ? "ar" : "en";
  } else {
    // For local development or custom domains: Check subdomain
    const subdomain = hostname.split(".")[0];
    return subdomain === "ar" ? "ar" : "en";
  }
}

export function getSubdomainFromLanguage(language: "en" | "ar"): string {
  return language === "ar" ? "ar" : "";
}

export function buildSubdomainUrl(
  language: "en" | "ar",
  path: string = "",
  search: string = ""
): string {
  if (typeof window === "undefined") return "";

  const currentHostname = window.location.hostname;
  const isVercelDeployment = currentHostname.includes("vercel.app");

  if (isVercelDeployment) {
    // For Vercel: Use path-based routing
    const protocol = window.location.protocol;
    const host = window.location.host;

    if (language === "ar") {
      // Add /ar prefix to the path
      const arPath = path.startsWith("/") ? `/ar${path}` : `/ar/${path}`;
      return `${protocol}//${host}${arPath}${search}`;
    } else {
      // Remove /ar prefix if it exists
      const cleanPath = path.replace(/^\/ar/, "") || "/";
      return `${protocol}//${host}${cleanPath}${search}`;
    }
  } else {
    // For local development or custom domains: Use subdomain routing
    const baseHostname = currentHostname.replace("ar.", "");
    let hostname: string;

    if (language === "ar") {
      hostname = `ar.${baseHostname}`;
    } else {
      hostname = baseHostname;
    }

    return `http://${hostname}${path}${search}`;
  }
}

export function isSubdomainRoute(): boolean {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  return hostname.startsWith("ar.");
}
