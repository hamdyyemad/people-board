/**
 * Utility functions for subdomain-based internationalization
 */

export function getLanguageFromSubdomain(): "en" | "ar" {
  if (typeof window === "undefined") return "en";

  const hostname = window.location.hostname;
  const url = new URL(window.location.href);

  // First, check for query parameter (fallback for Vercel)
  const langParam = url.searchParams.get("lang");
  if (langParam === "ar" || langParam === "en") {
    return langParam;
  }

  // Then check subdomain
  const subdomain = hostname.split(".")[0];
  return subdomain === "ar" ? "ar" : "en";
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
  const baseHostname = currentHostname.replace("ar.", "");

  let hostname: string;
  if (language === "ar") {
    hostname = `ar.${baseHostname}`;
  } else {
    hostname = baseHostname;
  }

  return `http://${hostname}${path}${search}`;
}

export function isSubdomainRoute(): boolean {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  return hostname.startsWith("ar.");
}
