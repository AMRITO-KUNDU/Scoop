/**
 * Public site origin used for canonical URLs, Open Graph and the sitemap.
 * Set VITE_SITE_URL in your hosting env (e.g. https://scoop.yourdomain.com).
 */
const raw =
  (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_URL ??
  (typeof process !== "undefined" ? process.env.VITE_SITE_URL : undefined) ??
  "https://example.com";

export const SITE_URL = raw.replace(/\/+$/, "");
