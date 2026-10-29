const envUrl =
  (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_URL ??
  (typeof process !== "undefined" ? process.env.VITE_SITE_URL : undefined);

const raw = envUrl?.trim() || "https://scoopfamily.xyz";

export const SITE_URL = raw.replace(/\/+$/, "");
