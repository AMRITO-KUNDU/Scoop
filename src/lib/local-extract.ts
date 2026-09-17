import { format, nextDay, type Day } from "date-fns";
import type { ExtractedItem, ItemType } from "@/lib/plan";

const WEEKDAYS: Record<string, Day> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const MONTH_RE =
  "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec";
const WEEKDAY_RE = "sunday|monday|tuesday|wednesday|thursday|friday|saturday";

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nextNamedDay(from: Date, weekday: Day): string {
  return format(nextDay(from, weekday), "yyyy-MM-dd");
}

function resolveMonthDay(from: Date, day: number, month: number): string {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (candidate < today) return iso(year + 1, month, day);
  return iso(year, month, day);
}

function extractDate(text: string, from: Date): string | null {
  const range = text.match(
    new RegExp(
      `\\b(\\d{1,2})\\s*[–-]\\s*(\\d{1,2})\\s+(${MONTH_RE})\\b`,
      "i",
    ),
  );
  if (range) {
    const day = Number(range[1]);
    const month = MONTHS[range[3].toLowerCase()];
    if (month) return resolveMonthDay(from, day, month);
  }

  const monthDay = text.match(
    new RegExp(
      `\\b(?:(?:${WEEKDAY_RE})\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_RE})\\b`,
      "i",
    ),
  );
  if (monthDay) {
    const day = Number(monthDay[1]);
    const month = MONTHS[monthDay[2].toLowerCase()];
    if (month) return resolveMonthDay(from, day, month);
  }

  const thisDay = text.match(
    new RegExp(`\\b(?:this|next)\\s+(${WEEKDAY_RE})\\b`, "i"),
  );
  if (thisDay) return nextNamedDay(from, WEEKDAYS[thisDay[1].toLowerCase()]);

  const byDay = text.match(
    new RegExp(`\\b(?:by|on)\\s+(${WEEKDAY_RE})\\b`, "i"),
  );
  if (byDay) return nextNamedDay(from, WEEKDAYS[byDay[1].toLowerCase()]);

  const onDay = text.match(new RegExp(`\\b(${WEEKDAY_RE})\\b`, "i"));
  if (
    onDay &&
    /\b(party|trip|appointment|photos?|bake|fair|swimming|after school|conferences?|dentist)\b/i.test(
      text,
    )
  ) {
    return nextNamedDay(from, WEEKDAYS[onDay[1].toLowerCase()]);
  }

  return null;
}

function extractTime(text: string): string | null {
  const range = text.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*[–-]\s*\d{1,2}(?::\d{2})?\s*(am|pm)\b/i,
  );
  const m = range ?? text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = m[2] ?? "00";
  const ap = m[3].toLowerCase();
  if (ap === "pm" && hours < 12) hours += 12;
  if (ap === "am" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function extractLocation(text: string): string | null {
  const at = text.match(/\bat\s+([A-Z][^,.]+(?:,\s*\d+[^,.]+)?)/);
  if (at) {
    const loc = at[1].replace(/\s+/g, " ").trim();
    if (loc.length > 3 && loc.length < 80) return loc;
  }
  const fromGate = text.match(/\bfrom the ([^,.]+)/i);
  if (fromGate) {
    const loc = fromGate[1].trim();
    return loc.charAt(0).toUpperCase() + loc.slice(1);
  }
  const inHall = text.match(/\bin the (hall|playground|gym|library|canteen)\b/i);
  if (inHall) return inHall[1].charAt(0).toUpperCase() + inHall[1].slice(1);
  return null;
}

function classify(text: string): ItemType {
  if (/\brsvp\b|\breply yes\b|\breply if\b/i.test(text)) return "rsvp";
  if (
    /\b(sign and return|return the|return this|due by|book your slot|pay by)\b/i.test(
      text,
    ) ||
    (/\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d)/i.test(
      text,
    ) &&
      !/\b(party|trip|appointment|conferences?|parent-teacher|fair|photos?|swimming|bake sale|dentist)\b/i.test(
        text,
      ))
  ) {
    return "deadline";
  }
  if (
    /\b(party|trip|appointment|conferences?|parent-teacher|fair|photos?|swimming|bake sale|museum|dentist)\b/i.test(
      text,
    )
  ) {
    return "event";
  }
  if (
    /\b(need|bring|pack|packed lunch|swimsuit|volunteers needed)\b/i.test(text)
  ) {
    return "task";
  }
  return "task";
}

function tidyLead(text: string): string {
  return text
    .replace(/^[•\-–]\s*/, "")
    .replace(/^(hi|hello|hey)(\s+\w+)?[!.,]?\s*/i, "")
    .replace(/^just confirming\s+/i, "")
    .replace(/^you're invited to\s+/i, "")
    .replace(/^please\s+/i, "")
    .replace(/^reminder:\s*/i, "")
    .replace(/^your child will\s+/i, "")
    .replace(/^children\s+/i, "")
    .replace(/^need (?:a |an |to )?/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortenTitle(raw: string, type: ItemType): string {
  let t = tidyLead(raw).replace(/[.!?]+$/, "").trim();

  const party = t.match(/^(.{3,48}?\b(?:birthday )?party)\b/i);
  if (party) return cap(party[1]);

  const trip = t.match(/^(.{3,56}?\btrip)\b/i);
  if (trip) return cap(trip[1]);

  const appt = t.match(/^(.{3,56}?\bappointment)\b/i);
  if (appt) return cap(appt[1]);

  if (type === "rsvp") {
    const who = raw.match(/\b([A-Z][a-z]+)'s\b/);
    if (who && /party/i.test(raw)) return `RSVP for ${who[1]}'s party`;
    if (/dentist|appointment/i.test(t)) return "Confirm the appointment";
    return "RSVP";
  }

  if (type === "deadline") {
    if (/permission slip/i.test(t) && /£|\$|pay|£\d/i.test(t)) {
      const money = t.match(/£[\d.]+|\$[\d.]+/);
      return money
        ? `Return permission slip + ${money[0]}`
        : "Return the permission slip";
    }
    if (/permission slip|sign and return/i.test(t)) {
      return "Sign and return permission slip";
    }
    if (/book your slot/i.test(t)) return "Book parent-teacher slot";
    const beforeBy = t.split(/\bby\b/i)[0]?.trim();
    if (beforeBy && beforeBy.length >= 8 && beforeBy.length < 64) {
      t = beforeBy;
    }
  }

  if (/\bswimsuit\b/i.test(t)) return "Pack swimsuit, towel and goggles";
  if (/\bpacked lunch\b/i.test(t)) return "Packed lunch (no nuts) and coat";
  if (/^bring socks/i.test(t)) return "Bring socks";
  if (type === "event" && /\bswimming\b/i.test(t)) {
    return /term/i.test(t) ? "Term swimming" : "Swimming";
  }

  t = t.replace(
    new RegExp(
      `\\s+(?:this|next|on|by)\\s+(?:${WEEKDAY_RE})\\b.*$`,
      "i",
    ),
    "",
  );
  t = t.replace(new RegExp(`\\s+(?:${WEEKDAY_RE})\\b.*$`, "i"), "");
  t = t.replace(
    new RegExp(
      `\\s*:?\\s*\\d{1,2}\\s*[–-]\\s*\\d{1,2}\\s+(?:${MONTH_RE})\\b.*$`,
      "i",
    ),
    "",
  );
  t = t.replace(/:\s*\d.*$/, "");
  t = t.replace(
    new RegExp(
      `\\s+(?:(?:${WEEKDAY_RE})\\s+)?\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTH_RE})\\b.*$`,
      "i",
    ),
    "",
  );
  t = t.replace(/\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b.*$/i, "");
  t = t.replace(/\s+at\s+[A-Z].*$/, "");
  t = t.replace(/\s*[—–:-]+\s*$/, "").replace(/:$/, "").trim();
  t = t.replace(/[.!?]+$/, "").trim();

  if (!t) t = tidyLead(raw).slice(0, 64);
  if (t.length > 64) t = `${t.slice(0, 61).replace(/\s+\S*$/, "").trim()}…`;
  return cap(t);
}

function cap(value: string): string {
  const t = value.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function isNoise(text: string): boolean {
  const t = text.trim();
  return (
    t.length < 8 ||
    /^(thanks|thank you|hope you can|have a good|contact:|ms\.|mr\.|from,)/i.test(
      t,
    ) ||
    /newsletter$/i.test(t) ||
    /^permission slip/i.test(t) ||
    /^no gifts needed/i.test(t)
  );
}

function isEnrichment(text: string): boolean {
  return /^(coach leaves|sessions?\b|return approx|arrive \d)/i.test(
    text.trim(),
  );
}

function splitCombined(chunk: string): string[] {
  const m = chunk.match(
    /^(.*?)(?:[.!]\s+|\s+[—–]\s+)((?:please\s+)?(?:return the|sign and return|book your slot|rsvp\b|reply yes|pay by|volunteers needed).+)$/i,
  );
  if (m && m[1].trim().length > 12 && m[2].trim().length > 10) {
    return [m[1].trim(), m[2].trim()];
  }
  return [chunk];
}

function splitChunks(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/\s*[•]\s+/))
    .flatMap((line) => {
      const parts = line.split(
        /(?<=(?<!\b(?:Dr|Mr|Ms|Mrs|St|Prof))\.)\s+(?=[A-Z])/,
      );
      if (parts.length === 1) return [line];
      if (
        /[.!?]\s+(?:please\s+)?(?:bring|pack|need|return|sign|rsvp|reply|book)/i.test(
          line,
        ) ||
        line.length > 120
      ) {
        return parts;
      }
      return [line];
    })
    .flatMap(splitCombined)
    .map((s) => s.replace(/^[•\-–]\s*/, "").trim())
    .filter((s) => s.length > 0);
}

function leftoverNotes(chunk: string, title: string): string | null {
  let extra = chunk.replace(title, "").replace(/\s+/g, " ").trim();
  extra = extra
    .replace(/^(hi|hello|hey)(\s+\w+)?[!.,]?\s*/i, "")
    .replace(/^you're invited to\s+/i, "")
    .replace(/^just confirming\s+/i, "")
    .replace(/^please\s+/i, "")
    .replace(/^reminder:\s*/i, "")
    .replace(/^[•\-–.!,;:\s]+/, "")
    .trim();
  if (extra.length < 12) return null;
  return extra.slice(0, 220);
}

export function localExtract(text: string, from = new Date()): ExtractedItem[] {
  const chunks = splitChunks(text);
  const items: ExtractedItem[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    if (isNoise(chunk)) continue;

    const date = extractDate(chunk, from);
    const time = extractTime(chunk);
    const location = extractLocation(chunk);

    if (isEnrichment(chunk) && items.length) {
      const prev = items[items.length - 1];
      if (!prev.time && time) prev.time = time;
      if (!prev.location && location) prev.location = location;
      continue;
    }

    const type = classify(chunk);
    const title = shortenTitle(chunk, type);
    if (title.length < 4) continue;
    const key = `${type}:${title.toLowerCase()}`;
    if (seen.has(key)) continue;

    const actionable =
      Boolean(date) ||
      Boolean(time) ||
      type === "rsvp" ||
      type === "deadline" ||
      /\b(need|bring|pack|appointment|trip|party|photos|swimming|conference|bake|fair|dentist|swimsuit|volunteers)\b/i.test(
        chunk,
      );
    if (!actionable) continue;

    seen.add(key);
    items.push({
      type,
      title,
      date,
      time,
      location,
      notes: leftoverNotes(chunk, title),
    });
    if (items.length >= 12) break;
  }

  const namedEvent = items.find((i) => i.type === "event");
  if (namedEvent) {
    for (const item of items) {
      if (item.type === "rsvp" && item.title === "RSVP") {
        const next = `RSVP: ${namedEvent.title}`;
        if (next.length <= 64) item.title = next;
      }
    }
  }

  return items;
}
