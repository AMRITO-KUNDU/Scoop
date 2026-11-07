const envUrl =
  (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_URL ??
  (typeof process !== "undefined" ? process.env.VITE_SITE_URL : undefined);

// SITE_URL feeds every canonical, og:url, og:image and JSON-LD url, so it must be
// an absolute origin. A bare "example.com" (no scheme) yields relative values that
// resolve against the page URL and silently produce broken canonical/OG tags.
const configured = envUrl?.trim() || "https://scoopfamily.xyz";
const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;

export const SITE_URL = withScheme.replace(/\/+$/, "");
