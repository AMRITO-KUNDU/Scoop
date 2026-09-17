import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { localExtract } from "@/lib/local-extract";
import { isItemType, type ExtractedItem, type ItemType } from "@/lib/plan";

const SYSTEM = `You extract structured school-life items from messy parent/school messages (emails, WhatsApp, newsletters, flyers, permission slips).

Return ONLY JSON of the form: {"items": ExtractedItem[]}

Each ExtractedItem:
- type: "event" | "deadline" | "task" | "rsvp"
- title: short human title, no trailing period
- date: YYYY-MM-DD or null. Resolve relative dates using TODAY (next occurrence).
- time: HH:mm 24-hour or null
- location: string or null
- notes: one-line helpful context or null

Rules:
- Split distinct things into separate items (a trip AND a permission deadline = event + deadline)
- event = a happening (party, trip, conference, photos)
- deadline = a due-by date (return slip by Friday, pay by Wednesday)
- task = an action without a firm calendar event (pack lunch, buy swimsuit)
- rsvp = a reply/confirmation needed
- Ignore greetings, signatures, and fluff
- Prefer the child's first name in titles when present
- Never invent items that are not in the text
- Max 12 items. If nothing actionable, return {"items": []}`;

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

function parseItems(raw: string): ExtractedItem[] {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned) as { items?: unknown };
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

async function extractWithAi(text: string): Promise<ExtractedItem[] | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `TODAY is ${weekday} (${today}).\n\nMESSAGE:\n${text}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content ?? "";
    try {
      return parseItems(content);
    } catch {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const extractItems = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { text: string }) => {
    const text = (input?.text ?? "").trim();
    if (text.length < 8) throw new Error("Paste a bit more text first.");
    if (text.length > 6000) throw new Error("That's too long — try a shorter excerpt.");
    return { text: text.slice(0, 6000) };
  })
  .handler(async ({ data }) => {
    const aiItems = await extractWithAi(data.text);
    if (aiItems && aiItems.length) {
      return { ok: true as const, items: aiItems };
    }
    const local = localExtract(data.text);
    if (local.length) {
      return { ok: true as const, items: local };
    }
    return {
      ok: false as const,
      error: "Nothing to pull from that message. Try a different excerpt.",
    };
  });
