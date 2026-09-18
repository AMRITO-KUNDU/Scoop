import { isItemType, type ExtractedItem, type ItemType } from "./plan";

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeDate(value: unknown): string | null {
  const s = asString(value);
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function normalizeTime(value: unknown): string | null {
  const s = asString(value);
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Parse a model JSON payload into typed extract items. Never throws. */
export function parseExtractedItems(raw: string): ExtractedItem[] {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let parsed: { items?: unknown };
  try {
    parsed = JSON.parse(cleaned) as { items?: unknown };
  } catch {
    return [];
  }
  if (!Array.isArray(parsed.items)) return [];
  const out: ExtractedItem[] = [];
  for (const row of parsed.items) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const type = asString(rec.type);
    const title = asString(rec.title);
    if (!type || !title || !isItemType(type)) continue;
    out.push({
      type: type as ItemType,
      title: title.slice(0, 140),
      date: normalizeDate(rec.date),
      time: normalizeTime(rec.time),
      location: asString(rec.location)?.slice(0, 160) ?? null,
      notes: asString(rec.notes)?.slice(0, 280) ?? null,
    });
    if (out.length >= 12) break;
  }
  return out;
}
