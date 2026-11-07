const envUrl =
  (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_URL ??
  (typeof process !== "undefined" ? process.env.VITE_SITE_URL : undefined);

// SITE_URL feeds every canonical, og:url, og:image and JSON-LD url, so it must be
// an absolute origin. A bare "example.com" (no scheme) yields relative values that
// resolve against the page URL and silently produce broken canonical/OG tags.
const configured = envUrl?.trim() || "https://scoopfamily.xyz";
const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;

// The canonical host is the apex. Every other generated URL in this repo already
// assumes it — the sitemap fallback, llms.txt, the mobile API origin — so a
// `www.` in the env would make the canonical tag disagree with the sitemap and
// split the page across two hosts. Normalised here, once, instead.
export const SITE_URL = withScheme.replace(/\/+$/, "").replace(/^(https?:\/\/)www\./i, "$1");
