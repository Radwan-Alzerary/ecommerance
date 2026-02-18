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
    // If Next.js returns a Promise in this runtime, sync resolver can't await it.
    if (typeof (h as any)?.then === 'function') {
      return null;
    }
    const hs = h as Headers;
    const host = hs.get('x-forwarded-host') || hs.get('host');
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Async server-side host resolver for Next.js versions where headers() is async.
 * Useful in request-scoped code such as axios interceptors.
 */
async function getServerHostAsync(): Promise<string | null> {
  try {
    const mod = await import('next/headers');
    const h = await (mod as any).headers();
    const host = h?.get?.('x-forwarded-host') || h?.get?.('host');
    return host || null;
  } catch {
    return null;
  }
}

export function getApiUrl(): string {
  devLog("[config] getApiUrl() called");

  // 0) If running on localhost/IP in browser, force local API
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const localDerived = deriveFromLocalOrIpHost(hostname);
    if (localDerived) {
      devLog('[config] local hostname detected →', localDerived);
      return localDerived;
    }
  }

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
      const hostNoPort = serverHost.split(':')[0];
      const tenantDerived = deriveFromOroEshopHost(hostNoPort);
      if (tenantDerived) {
        devLog('[config] derived (server/tenant) →', tenantDerived);
        return tenantDerived;
      }
      const localOrIp = deriveFromLocalOrIpHost(hostNoPort);
      if (localOrIp) {
        devLog('[config] derived (server/local-ip) →', localOrIp);
        return localOrIp;
      }
      devLog('[config] no derivation on server for host', serverHost);
    } else {
      devLog('[config] no server host available');
      if (process.env.NODE_ENV !== 'production') {
        devLog('[config] dev fallback (server/no-host) → http://localhost:3000/');
        return 'http://localhost:3000/';
      }
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

/**
 * Async resolver for server request context (multi-tenant aware in Next.js 16+).
 */
export async function getApiUrlAsync(): Promise<string> {
  // Browser path can stay sync
  if (typeof window !== 'undefined') return getApiUrl();

  const envOverride =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.VITE_API_BASE_URL;
  if (envOverride) return withTrailingSlash(envOverride);

  const serverHost = await getServerHostAsync();
  if (serverHost) {
    const hostNoPort = String(serverHost).split(':')[0];
    const tenantDerived = deriveFromOroEshopHost(hostNoPort);
    if (tenantDerived) return tenantDerived;
    const localOrIp = deriveFromLocalOrIpHost(hostNoPort);
    if (localOrIp) return localOrIp;
  }

  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000/';
  return FALLBACK_API;
}

/**
 * Static bootstrap URL (safe at module load). Real URL is set per request in interceptor.
 */
export const API_URL = withTrailingSlash(
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/' : FALLBACK_API)
);

/**
 * Extract the tenant slug from the current browsing context.
 * Works for both oro-eshop.com (frontend) and oro-system.com (api) hostnames.
 */
function getTenantSlug(): string | null {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // e.g. alamalelectron.oro-eshop.com → alamalelectron
    const eshopMatch = hostname.match(/^([^.]+)\.oro-eshop\.com$/i);
    if (eshopMatch && eshopMatch[1] !== 'www') return eshopMatch[1];
    // e.g. alamalelectron.oro-system.com → alamalelectron
    const systemMatch = hostname.match(/^([^.]+)\.oro-system\.com$/i);
    if (systemMatch && systemMatch[1] !== 'www') return systemMatch[1];
  }
  // Fallback: try from getApiUrl()
  const baseUrl = getApiUrl();
  const match = baseUrl.match(/^https?:\/\/([^.]+)\.oro-system\.com/);
  return match ? match[1] : null;
}

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
  if (/^https?:\/\//i.test(str) || str.startsWith('data:')) {
    // Fix multi-tenant: replace bare oro-system.com with the tenant-specific domain
    const bareOroPattern = /^(https?:\/\/)oro-system\.com\//i;
    if (bareOroPattern.test(str)) {
      const tenant = getTenantSlug();
      if (tenant) {
        return str.replace(bareOroPattern, `$1${tenant}.oro-system.com/`);
      }
    }
    return str;
  }
  const baseUrl = getApiUrl();
  return baseUrl + (str.startsWith('/') ? str.slice(1) : str);
}
