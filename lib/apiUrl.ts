// ───────────────────────────────────────────────────────────
// src/config.ts
// Resolve the base API URL at runtime (browser or server)
// (verbose version with console.logs for every step)
// ───────────────────────────────────────────────────────────

/**
 * Fallback when nothing else matches.
 * Change this to whatever default tenant API you want.
 */
const FALLBACK_API = "https://radwan.oro-system.com/";

/** Ensure the URL we return always ends with “/”. */
const withTrailingSlash = (url: string): string =>
  url.endsWith("/") ? url : `${url}/`;

export function getApiUrl(): string {
  console.log("[config] getApiUrl() called");

  // 1) Explicit override via env var (works server- & client-side)
  const envOverride =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ?? // Next.js convention
    process.env.VITE_API_BASE_URL;          // Vite convention
  console.log("[config] env override value:", envOverride || "∅");

  if (envOverride) {
    const url = withTrailingSlash(envOverride);
    console.log("[config] using ENV override →", url);
    return url;
  }

  // 2) Browser: derive tenant from *.oro-eshop.com subdomain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;   // e.g. "alice.oro-eshop.com"
    console.log("[config] window.hostname:", hostname);

    const MAGIC_SUFFIX = ".oro-eshop.com";

    if (hostname.endsWith(MAGIC_SUFFIX)) {
      const tenantSlug = hostname.slice(0, -MAGIC_SUFFIX.length); // "alice"
      const derivedUrl = `https://${tenantSlug}.oro-system.com/`;
      console.log("[config] derived from hostname →", derivedUrl);
      return derivedUrl;
    } else {
      console.log(
        `[config] hostname does NOT end with "${MAGIC_SUFFIX}" — skipping derivation`
      );
    }
  } else {
    console.log("[config] window is undefined (server-side / CLI)");
  }

  // 3) Fallback
  console.log("[config] using fallback →", FALLBACK_API);
  return FALLBACK_API;
}

/** One resolved constant you can import anywhere in the app. */
export const API_URL = getApiUrl();

console.log("[config] final API_URL =", API_URL);
