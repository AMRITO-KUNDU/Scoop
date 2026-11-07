import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseExtractedItems } from "@/lib/extract-parse";
import { DEFAULT_GROQ_MODEL, GROQ_FALLBACK_MODELS, readTrimmedEnv } from "@/lib/groq";
import { localExtract } from "@/lib/local-extract";
import type { ExtractedItem } from "@/lib/plan";

export type ExtractEngine = "groq" | "local";

// Tool definition for structured extraction using Groq tool calling
// Groq Strict Mode requires: additionalProperties:false on ALL OBJECTS (not arrays), ALL properties in required
// Optional fields use union types with null: type: ["string", "null"]
const EXTRACTION_TOOL = {
  type: "function",
  function: {
    name: "extract_school_items",
    description:
      "Extract structured school-life items from parent/school messages. Use this tool to parse and categorize information into events, deadlines, tasks, and RSVPs.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Array of extracted school items",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["event", "deadline", "task", "rsvp"],
                description: "Item type: event, deadline, task, or rsvp",
              },
              title: {
                type: "string",
                description: "Short human-readable title, no trailing period",
                maxLength: 140,
              },
              date: {
                type: ["string", "null"],
                description: "Date in YYYY-MM-DD format or null",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              },
              endDate: {
                type: ["string", "null"],
                description:
                  "Last day of a multi-day span in YYYY-MM-DD, or null for a single-day item",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              },
              time: {
                type: ["string", "null"],
                description: "Time in HH:mm 24-hour format or null",
                pattern: "^\\d{2}:\\d{2}$",
              },
              location: {
                type: ["string", "null"],
                description: "Location string or null",
                maxLength: 160,
              },
              notes: {
                type: ["string", "null"],
                description: "One-line helpful context or null",
                maxLength: 280,
              },
            },
            required: ["type", "title", "date", "endDate", "time", "location", "notes"],
            additionalProperties: false,
          },
          maxItems: 12,
        },
      },
      required: ["items"],
      additionalProperties: false,
    },
    additionalProperties: false,
  },
  additionalProperties: false,
};

// System prompt for tool calling - instructs model to use the extraction tool
const SYSTEM = `You are the extraction engine behind SCOOP, a family plan app. A parent pastes a
message from school, a club or an activity group. Your job is to turn that messy
text into the few things they actually have to act on.

What the four types mean
- event    — something that happens at a date or time: trip, party, meeting, club, photos, appointment
- deadline — something to hand in or pay by a date: a form back, a payment, a supply list
- task     — something to bring, buy or do, with no fixed slot: packed lunch, new shoes, sign up
- rsvp     — a reply the message explicitly asks for

Rules that matter most
- Fewer, better items. One item per real action. Two or three clean items beat
  eight fragments — a parent reading their plan should never have to merge two
  lines in their head.
- Never invent. Every item must trace to words in the message. If nothing needs
  doing, return an empty list. An empty list is a correct answer, not a failure.
- Do not split one thing into pieces. "Return the consent form by Friday" is one
  deadline — not a deadline, a task and a reminder.
- Do not duplicate. If an event already covers it, do not also add a task to
  attend it, and do not repeat the same information as a second item.
- Skip the noise: greetings, sign-offs, signatures, thanks, contact details,
  office hours, and anything purely informational ("we had a lovely week").
- Spans are one item, not two. "Closed from today to three days after" is a
  single item with date = today and endDate = today + 3 days. A half-term week,
  a trip that returns the next evening, a two-day fair: one item, start and end.
  Never split a span into an item per day.
- An rsvp only when a reply is actually requested. A deadline only when there is
  a due date or an explicit "by …". Do not turn a date mentioned in passing into
  an item.

Fields
- title: what the parent sees in their list — short, specific, under 60
  characters, no trailing full stop, no emoji, no shouting, no "Important
  notice about…" padding. Write the thing itself: "Museum trip consent form".
- date: YYYY-MM-DD, resolved against TODAY (given below). If the message gives no
  date, use null. Never guess one.
- endDate: the last day of a span, or null when the thing happens on one day. Only
  set it when the message states a range — "until Friday", "closed Monday to
  Wednesday", "returns the next day". Never set it equal to date.
- time: HH:mm, 24-hour, only when a time is stated. Otherwise null.
- location: only when stated. Otherwise null.
- notes: one short line that adds something the title does not — what to bring,
  how much, who to ask. Null when it would only repeat the title.
- type: one of event, deadline, task, rsvp.

Return at most 12 items. A long newsletter usually contains two or three things
worth keeping and a page of things that are not.

ALWAYS use the extract_school_items tool. Never reply with prose or raw JSON.`;

type ToolCallTarget = {
  engine: "groq";
  url: string;
  apiKey: string;
  model: string;
};

type ToolCallResult =
  { ok: true; items: ExtractedItem[] } | { ok: false; error: string; isModelNotFound?: boolean };

/**
 * Extract items using Groq tool calling (function calling) API.
 * This provides structured, precise extraction rather than free-form chat responses.
 */
async function extractWithToolCalling(
  text: string,
  target: ToolCallTarget,
  timeoutMs: number,
): Promise<ToolCallResult> {
  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Call Groq API with tool calling enabled
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
        // Enable tool calling with our extraction tool
        tools: [EXTRACTION_TOOL],
        tool_choice: {
          type: "function",
          function: { name: "extract_school_items" },
        },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `TODAY is ${weekday} (${today}).\n\nMESSAGE:\n${text}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      let detail = "";
      let isModelNotFound = false;
      try {
        const body = (await res.json()) as { error?: { message?: string; type?: string } };
        if (body.error?.message) detail = `: ${body.error.message}`;
        if (body.error?.type === "BadRequestError" || res.status === 404) {
          isModelNotFound = true;
        }
      } catch {
        /* ignore body parsing error */
      }
      return {
        ok: false,
        error: `Groq tool calling API error (${res.status}${detail})`,
        isModelNotFound,
      };
    }

    const body = (await res.json()) as {
      choices?: {
        message?: {
          content?: string | null;
          tool_calls?: Array<{ function: { name: string; arguments: string } }>;
        };
      }[];
    };

    // Process tool calls - extract the JSON from tool call arguments
    const toolCall = body.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.name === "extract_school_items") {
      try {
        const toolArgs = JSON.parse(toolCall.function.arguments) as { items?: unknown };
        if (Array.isArray(toolArgs.items)) {
          // Parse the extracted items using our existing parser
          const items = parseExtractedItems(JSON.stringify({ items: toolArgs.items }));
          return { ok: true, items };
        }
      } catch {
        // If tool call parsing fails, try fallback to message content
      }
    }

    // Fallback: try to parse from message content if tool calling didn't work
    const content = body.choices?.[0]?.message?.content;
    if (content) {
      const items = parseExtractedItems(content);
      return { ok: true, items };
    }

    return { ok: true, items: [] };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: `Groq tool calling request timed out (${Math.round(timeoutMs / 1000)}s limit).` };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Groq tool calling extraction failed: ${message}` };
  } finally {
    clearTimeout(timer);
  }
}

function toolCallingTargets(): ToolCallTarget[] {
  const targets: ToolCallTarget[] = [];
  const groqKey = readTrimmedEnv(process.env, "GROQ_API_KEY");
  if (groqKey) {
    const groqModel = readTrimmedEnv(process.env, "GROQ_MODEL") ?? DEFAULT_GROQ_MODEL;
    // Add all Groq fallback models as separate targets to try
    for (const model of GROQ_FALLBACK_MODELS) {
      targets.push({
        engine: "groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: groqKey,
        model,
      });
    }
    // Also add the user-specified model if it's not in the fallback list
    if (!GROQ_FALLBACK_MODELS.includes(groqModel as (typeof GROQ_FALLBACK_MODELS)[number])) {
      targets.unshift({
        engine: "groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: groqKey,
        model: groqModel,
      });
    }
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
    const targets = toolCallingTargets();

    // The whole AI attempt gets a hard deadline, not a per-model one: a serverless
    // function that runs out of time returns a 504 and the local parser never
    // runs. 9s fits inside the smallest default function limit with room to spare.
    const TOTAL_BUDGET_MS = 9_000;
    const PER_ATTEMPT_MS = 8_000;
    const startedAt = Date.now();

    // Try tool calling extraction first
    let lastError: string | null = null;
    for (const target of targets) {
      const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt);
      if (remaining < 1_000) break; // out of time — hand over to the local parser
      const res = await extractWithToolCalling(
        data.text,
        target,
        Math.min(PER_ATTEMPT_MS, remaining),
      );
      if (res.ok) {
        return {
          ok: true as const,
          items: res.items,
          engine: target.engine,
          method: "tool_calling" as const,
          model: target.model,
        };
      }
      lastError = res.error;
      // Fall through to the next model only when the current one is unavailable.
      // Any other failure will repeat identically on the next model, so stop and
      // hand over to the on-device parser instead of spending the request budget.
      if (!res.isModelNotFound) break;
    }

    // Fallback to local extraction when Groq is unconfigured or failed
    const local = localExtract(data.text);
    const fallbackReason = targets.length
      ? lastError || "Groq extraction failed"
      : "GROQ_API_KEY not configured — using on-device parser";

    return {
      ok: true as const,
      items: local,
      engine: "local" as ExtractEngine,
      method: "local" as const,
      reason: fallbackReason,
    };
  });
