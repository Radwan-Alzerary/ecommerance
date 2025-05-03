// lib/cookieUtils.ts

/**
 * Sets a browser cookie for the auth token (NOT HttpOnly).
 * For true HttpOnly cookies, you must set them from the server.
 */
export function setAuthCookie(token: string) {
    // e.g. 1 day expiration
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
    const expires = `expires=${expiryDate.toUTCString()}`;
  
    // Add Secure or SameSite if needed
    document.cookie = `authToken=${token}; ${expires}; path=/;`;
  }
  
  /**
   * Reads the auth token from the browser cookies (client-side only).
   */
  export function getAuthCookie(): string | undefined {
    const name = 'authToken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const parts = decodedCookie.split(';');
    for (let part of parts) {
      let trimmed = part.trim();
      if (trimmed.indexOf(name) === 0) {
        return trimmed.substring(name.length, trimmed.length);
      }
    }
    return undefined;
  }
  
  /**
   * Removes the authToken from the browser cookies.
   */
  export function removeAuthCookie() {
    // Setting it to an expired date to clear
    document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  