#!/usr/bin/env node
/**
 * Tell Bing, Yandex, Naver, Seznam and Yep that these URLs exist or changed.
 *
 * IndexNow is a push, not a promise: a 200 means the engines received the list,
 * not that anything is crawled or indexed. It shortens the gap between
 * publishing and discovery, which is the whole point when a domain is new.
 *
 * Google is not a participant and never receives this. That is fine — it is
 * what the sitemap and Search Console are for.
 *
 * Run after a deploy, not during the build: the build runs before the new
 * deployment is live, so a ping then would point the engines at the old site.
 *
 *   node scripts/indexnow.mjs
 */
const KEY = "a7f3c9e2b84d4f61a0c5d7e9b2f4a6c8";

const ORIGIN = (process.env.VITE_SITE_URL?.trim() || "https://scoopfamily.xyz")
  .replace(/\/+$/, "")
  // Same rule as site.ts and generate-seo.mjs: the apex is canonical.
  .replace(/^(https?:\/\/)www\./i, "$1");

/** Must match ROUTES in generate-seo.mjs — these are the public, indexable pages. */
const PATHS = [
  "/",
  "/how-it-works",
  "/about",
  "/guides",
  "/guides/school-emails",
  "/guides/permission-slips",
  "/guides/whatsapp-school-groups",
  "/privacy",
  "/terms",
];

const urlList = PATHS.map((path) => `${ORIGIN}${path}`);
const body = {
  host: new URL(ORIGIN).host,
  key: KEY,
  keyLocation: `${ORIGIN}/${KEY}.txt`,
  urlList,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// 200 accepted, 202 accepted-and-key-pending-validation, 4xx malformed or bad key.
console.log(`[indexnow] ${res.status} ${res.statusText} — ${urlList.length} URLs for ${body.host}`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
