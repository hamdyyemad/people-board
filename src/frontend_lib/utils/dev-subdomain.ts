/**
 * Development utility for subdomain testing without hosts file modification
 */

export function getDevSubdomainUrl(
  language: "en" | "ar",
  path: string = "",
  search: string = ""
): string {
  if (typeof window === "undefined") return "";

  const currentHostname = window.location.hostname;
  const currentPort = window.location.port;
  const baseHostname = currentHostname.replace("ar.", "");

  let hostname: string;
  if (language === "ar") {
    hostname = `ar.${baseHostname}`;
  } else {
    hostname = baseHostname;
  }

  const port = currentPort ? `:${currentPort}` : "";
  return `http://${hostname}${port}${path}${search}`;
}

export function getDevLanguageFromSubdomain(): "en" | "ar" {
  if (typeof window === "undefined") return "en";

  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];

  return subdomain === "ar" ? "ar" : "en";
}

// Alternative: Use query parameter for development
export function getDevLanguageFromQuery(): "en" | "ar" {
  if (typeof window === "undefined") return "en";

  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get("lang");

  return lang === "ar" ? "ar" : "en";
}

export function buildDevSubdomainUrl(
  language: "en" | "ar",
  path: string = "",
  search: string = ""
): string {
  // Try subdomain first, fallback to query parameter
  try {
    return getDevSubdomainUrl(language, path, search);
  } catch {
    // Fallback to query parameter approach
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    return url.toString();
  }
}
