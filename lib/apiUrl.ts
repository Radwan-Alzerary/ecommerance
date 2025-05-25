// src/config.ts
// const DEFAULT_API = 'https://radwan.oro-system.com/';
const DEFAULT_API = 'http://localhost:3000/';

function getApiUrl(): string {
  // 1. honor an explicit override if set
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // 2. if we're running in the browser, pull the subdomain off the host
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;                   // e.g. "radwan.oro-eshop.com"
    const magicSuffix = '.oro-eshop.com';

    if (host.endsWith(magicSuffix)) {
      // strip the “.oro-eshop.com” off, leaving “radwan”
      const subdomain = host.slice(0, host.length - magicSuffix.length);
      return `https://${subdomain}.oro-system.com/`;
    }
  }

  // 3. fallback if neither of the above matched
  return DEFAULT_API;
}

export const API_URL = getApiUrl();
