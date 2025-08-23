// ───────────────────────────────────────────────────────────
// src/config.ts
// Resolve the base API URL at runtime (browser or server)
// (verbose version with console.logs for every step)
// ───────────────────────────────────────────────────────────

/**
 * Fallback when we cannot derive a tenant slug and no ENV override is present.
 * We now use the root domain (no tenant) instead of a hard-coded tenant like
 * "alamalelectron" so it behaves like a wildcard-ready base. Override via env
 * vars or provide a host with a subdomain (tenant) to avoid this fallback.
 */
const FALLBACK_API = "https://oro-system.com/";
// For local development you may switch to: const FALLBACK_API = "http://localhost:3000/";

/** Ensure the URL we return always ends with “/”. */
const withTrailingSlash = (url: string): string =>
  url.endsWith("/") ? url : `${url}/`;

/**
 * Try to derive a tenant-based API URL from a hostname such as
 *   "ahmed.oro-eshop.com"  -> https://ahmed.oro-system.com/
 * Returns null if it cannot derive.
 */
function deriveFromOroEshopHost(hostname: string): string | null {
  const MAGIC_SUFFIX = ".oro-eshop.com";
  if (hostname.endsWith(MAGIC_SUFFIX)) {
    const tenantSlug = hostname.slice(0, -MAGIC_SUFFIX.length);
    if (tenantSlug && tenantSlug !== "www") {
      return `https://${tenantSlug}.oro-system.com/`;
    }
  }
  return null;
}

/**
 * Derive API for local dev or direct IP access:
 *   localhost (any port)      -> http://localhost:3000/
 *   127.0.0.1                 -> http://127.0.0.1:3000/
 *   192.168.1.45 (example IP) -> http://192.168.1.45:3000/
 * Returns null if hostname is not localhost / IP.
 */
function deriveFromLocalOrIpHost(hostname: string): string | null {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return 'http://' + hostname + ':3000/';
  }
  // Simple IPv4 test
  const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    return 'http://' + hostname + ':3000/';
  }
  return null;
}

function devLog(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

/**
 * Attempt to read the current request Host header on the server (Next.js).
 * Safe to call on client (returns null) or outside request context (returns null).
 */
function getServerHost(): string | null {
  try {
    // Dynamically require to avoid bundling issues on client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers } = require('next/headers');
    const h = headers();
    const host = h.get('host');
    return host || null;
  } catch {
    return null;
  }
}

export function getApiUrl(): string {
  devLog("[config] getApiUrl() called");

  // 1) Explicit override via env var (works server- & client-side)
  const envOverride =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ?? // Next.js convention
    process.env.VITE_API_BASE_URL;          // Vite convention
  devLog("[config] env override value:", envOverride || "∅");

  if (envOverride) {
    const url = withTrailingSlash(envOverride);
    devLog("[config] using ENV override →", url);
    return url;
  }

  // 2) Derive from Host (server) or window.location (client)
  if (typeof window === "undefined") {
    const serverHost = getServerHost();
    if (serverHost) {
      devLog('[config] server host:', serverHost);
      const tenantDerived = deriveFromOroEshopHost(serverHost);
      if (tenantDerived) {
        devLog('[config] derived (server/tenant) →', tenantDerived);
        return tenantDerived;
      }
      const localOrIp = deriveFromLocalOrIpHost(serverHost.split(':')[0]);
      if (localOrIp) {
        devLog('[config] derived (server/local-ip) →', localOrIp);
        return localOrIp;
      }
      devLog('[config] no derivation on server for host', serverHost);
    } else {
      devLog('[config] no server host available');
    }
  } else {
    const hostname = window.location.hostname; // client
    devLog('[config] window.hostname:', hostname);
    const derived = deriveFromOroEshopHost(hostname);
    if (derived) {
      devLog('[config] derived from hostname →', derived);
      return derived;
    }
    const localDerived = deriveFromLocalOrIpHost(hostname);
    if (localDerived) {
      devLog('[config] derived from local/IP hostname →', localDerived);
      return localDerived;
    }
    devLog('[config] no tenant derivation on client – fallback next');
  }

  // 3) Fallback
  devLog("[config] using fallback →", FALLBACK_API);
  return FALLBACK_API;
}

/** One resolved constant you can import anywhere in the app. */
export const API_URL = getApiUrl();

devLog("[config] final API_URL =", API_URL);

/**
 * Safely build a full URL for assets (e.g. images) coming from the API.
 * Accepts either already absolute URLs or relative paths returned by backend.
 */
export function buildAssetUrl(path?: unknown): string {
  if (path == null) return '';

  // If an object with a url property was passed (e.g. {url: '...'}), extract it
  if (typeof path !== 'string') {
    if (typeof (path as any)?.url === 'string') {
      path = (path as any).url as string;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[buildAssetUrl] Non-string path ignored:', path);
      }
      return '';
    }
  }

  const str = path as string;
  if (!str) return '';
  // Already absolute or data URI
  if (/^https?:\/\//i.test(str) || str.startsWith('data:')) return str;
  return API_URL + (str.startsWith('/') ? str.slice(1) : str);
}
