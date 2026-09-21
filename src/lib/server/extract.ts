import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseExtractedItems } from "@/lib/extract-parse";
import {
  DEFAULT_GROK_MODEL,
  DEFAULT_GROQ_MODEL,
  GROQ_FALLBACK_MODELS,
  readTrimmedEnv,
} from "@/lib/integrations";
import { localExtract } from "@/lib/local-extract";
import type { ExtractedItem } from "@/lib/plan";

export type ExtractEngine = "groq" | "grok" | "local";

// Tool definition for structured extraction using Groq tool calling
// Groq Strict Mode requires: additionalProperties:false on ALL objects, ALL properties in required
// Optional fields use union types with null: type: ["string", "null"]
const EXTRACTION_TOOL = {
  type: "function",
  function: {
    name: "extract_school_items",
    description: "Extract structured school-life items from parent/school messages. Use this tool to parse and categorize information into events, deadlines, tasks, and RSVPs.",
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
            required: ["type", "title", "date", "time", "location", "notes"],
            additionalProperties: false,
          },
          maxItems: 12,
          additionalProperties: false,
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
const SYSTEM = `You are an expert extraction assistant for parent/school communications.
Your ONLY job is to extract structured school-life items from messages and return them using the extract_school_items tool.

Extraction rules:
- event = a happening (party, trip, conference, photos, club, INSET, meet the teacher, bus run)
- deadline = a due-by date (return slip by Friday, pay by Wednesday, supply list, forms)
- task = an action without a firm calendar event (pack lunch, buy swimsuit, PE kit, uniform)
- rsvp = a reply/confirmation needed (party RSVP, club spot, bus seat)

Guidelines:
- Split distinct things into separate items
- Ignore greetings, signatures, and fluff
- Prefer the child's first name in titles when present
- Never invent items that are not in the text
- Max 12 items. If nothing actionable, return empty items array.
- Date format: YYYY-MM-DD (resolve relative dates using TODAY)
- Time format: HH:mm (24-hour)

ALWAYS use the extract_school_items tool. Never return plain text or JSON directly.`;

type ToolCallTarget = {
  engine: Exclude<ExtractEngine, "local">;
  url: string;
  apiKey: string;
  model: string;
};

type ToolCallResult =
  | { ok: true; items: ExtractedItem[] }
  | { ok: false; error: string; isModelNotFound?: boolean };

/**
 * Extract items using Groq tool calling (function calling) API.
 * This provides structured, precise extraction rather than free-form chat responses.
 */
async function extractWithToolCalling(
  text: string,
  target: ToolCallTarget,
): Promise<ToolCallResult> {
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
      const engineName = target.engine === "groq" ? "Groq" : "Grok";
      return {
        ok: false,
        error: `${engineName} tool calling API error (${res.status}${detail})`,
        isModelNotFound,
      };
    }

    const body = (await res.json()) as {
      choices?: { message?: { tool_calls?: Array<{ function: { name: string; arguments: string } }> } }[];
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
    const engineName = target.engine === "groq" ? "Groq" : "Grok";
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: `${engineName} tool calling request timed out (12s limit).` };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `${engineName} tool calling extraction failed: ${message}` };
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
    if (!GROQ_FALLBACK_MODELS.includes(groqModel as typeof GROQ_FALLBACK_MODELS[number])) {
      targets.unshift({
        engine: "groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        apiKey: groqKey,
        model: groqModel,
      });
    }
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
    let lastError: string | null = null;
    const targets = toolCallingTargets();

    // Try tool calling extraction first
    for (const target of targets) {
      const res = await extractWithToolCalling(data.text, target);
      if (res.ok) {
        if (res.items.length) {
          return { ok: true as const, items: res.items, engine: target.engine, method: "tool_calling" as const };
        }
      } else {
        lastError = res.error;
      }
    }

    // Fallback to local extraction if tool calling fails
    const local = localExtract(data.text);
    if (local.length) {
      return {
        ok: true as const,
        items: local,
        engine: "local" as ExtractEngine,
        method: "local" as const,
        warning: lastError ?? undefined,
      };
    }

    if (lastError) {
      return {
        ok: false as const,
        error: lastError,
      };
    }

    return {
      ok: false as const,
      error: "Nothing to pull from that message. Try a different excerpt.",
    };
  });
