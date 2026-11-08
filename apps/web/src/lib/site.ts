const envUrl =
  (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_URL ??
  (typeof process !== "undefined" ? process.env.VITE_SITE_URL : undefined);

// SITE_URL feeds every canonical, og:url, og:image and JSON-LD url, so it must be
// an absolute origin. A bare "example.com" (no scheme) yields relative values that
// resolve against the page URL and silently produce broken canonical/OG tags.
const configured = envUrl?.trim() || "https://scoopfamily.xyz";
const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;

// The canonical host is the apex. Everything else in this repo already assumes it
// (the sitemap, llms.txt, the mobile API origin), and www 301s here — so a `www.`
// in the env would make every page claim a URL that redirects back to itself.
// Search Console showed the cost: pages "unknown to Google" with a sitemap
// pending for a week, because the canonical pointed at a redirect.
export const SITE_URL = withScheme.replace(/\/+$/, "").replace(/^(https?:\/\/)www\./i, "$1");
