import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseExtractedItems } from "@/lib/extract-parse";
import {
  DEFAULT_GROK_MODEL,
  DEFAULT_GROQ_MODEL,
  readTrimmedEnv,
} from "@/lib/integrations";
import { localExtract } from "@/lib/local-extract";
import type { ExtractedItem } from "@/lib/plan";

export type ExtractEngine = "groq" | "grok" | "local";

const SYSTEM = `You extract structured school-life items from messy parent/school messages (emails, WhatsApp, newsletters, flyers, permission slips, welcome letters, club notes, bus times, supply lists).

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
- event = a happening (party, trip, conference, photos, club, INSET, meet the teacher, bus run)
- deadline = a due-by date (return slip by Friday, pay by Wednesday, supply list, forms)
- task = an action without a firm calendar event (pack lunch, buy swimsuit, PE kit, uniform)
- rsvp = a reply/confirmation needed (party RSVP, club spot, bus seat)
- Ignore greetings, signatures, and fluff
- Prefer the child's first name in titles when present
- Never invent items that are not in the text
- Max 12 items. If nothing actionable, return {"items": []}`;

type ChatTarget = {
  engine: Exclude<ExtractEngine, "local">;
  url: string;
  apiKey: string;
  model: string;
};

async function extractWithChat(
  text: string,
  target: ChatTarget,
): Promise<ExtractedItem[] | null> {
  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(target.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${target.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: target.model,
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
    return parseExtractedItems(body.choices?.[0]?.message?.content ?? "");
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function chatTargets(): ChatTarget[] {
  const targets: ChatTarget[] = [];
  const groqKey = readTrimmedEnv(process.env, "GROQ_API_KEY");
  if (groqKey) {
    targets.push({
      engine: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: readTrimmedEnv(process.env, "GROQ_MODEL") ?? DEFAULT_GROQ_MODEL,
    });
  }
  const xaiKey = readTrimmedEnv(process.env, "XAI_API_KEY");
  if (xaiKey) {
    targets.push({
      engine: "grok",
      url: "https://api.x.ai/v1/chat/completions",
      apiKey: xaiKey,
      model: DEFAULT_GROK_MODEL,
    });
  }
  return targets;
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
    for (const target of chatTargets()) {
      const items = await extractWithChat(data.text, target);
      if (items?.length) {
        return { ok: true as const, items, engine: target.engine };
      }
    }
    const local = localExtract(data.text);
    if (local.length) {
      return { ok: true as const, items: local, engine: "local" as ExtractEngine };
    }
    return {
      ok: false as const,
      error: "Nothing to pull from that message. Try a different excerpt.",
    };
  });
