import { createFileRoute } from "@tanstack/react-router";
import { apiError, readJson } from "@/lib/server/api";
import { extractItems } from "@/lib/server/extract";

/**
 *   POST /api/capture -> { ok, items, engine, method, model? | reason? }
 *   body: { text }
 *
 * Same extraction the web capture screen uses — Groq tool calling with the
 * built-in parser as the fallback.
 */
export const Route = createFileRoute("/api/capture")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await readJson<{ text?: string }>(request);
          const result = await extractItems({ data: { text: body.text ?? "" } });
          return Response.json(result);
        } catch (err) {
          return apiError(err);
        }
      },
    },
  },
});
