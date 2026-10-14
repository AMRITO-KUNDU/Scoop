#!/usr/bin/env node
/**
 * Writes `public/robots.txt` and `public/sitemap.xml` from the site's canonical
 * origin, so both always advertise the host the app actually serves on.
 *
 * The origin comes from `VITE_SITE_URL` (falling back to the production host).
 * Running this before `vite build` means attaching a custom domain later won't
 * leave stale references to the old host in the sitemap or robots file.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const FALLBACK_ORIGIN = "https://scoop-topaz.vercel.app";

const rawOrigin =
  process.env.VITE_SITE_URL?.trim() || process.env.SITE_URL?.trim() || FALLBACK_ORIGIN;
const origin = rawOrigin.replace(/\/+$/, "");

/** Public, indexable routes only — anything with a `noindex` meta must NOT appear. */
const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/how-it-works", priority: "0.8", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTES.map((route) =>
    [
      "  <url>",
      `    <loc>${origin}${route.path}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
  "",
].join("\n");

// App routes are `noindex` via their page meta; we don't also disallow them, so
// crawlers can read that directive. Login/signup are noindex too, not disallowed.
const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /capture",
  "Disallow: /plan",
  "Disallow: /connect",
  "",
  `Sitemap: ${origin}/sitemap.xml`,
  "",
].join("\n");

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

await Promise.all([
  writeFile(join(publicDir, "robots.txt"), robots, "utf8"),
  writeFile(join(publicDir, "sitemap.xml"), sitemap, "utf8"),
]);

console.log(`[seo] wrote robots.txt and sitemap.xml for ${origin}`);
