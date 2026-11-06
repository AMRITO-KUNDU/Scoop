import { createFileRoute } from "@tanstack/react-router";
import { apiError, readJson } from "@/lib/server/api";
import { transcribeAudio } from "@/lib/server/transcribe";

/**
 *   POST /api/transcribe -> { ok, text, model }
 *   body: { audio: <base64>, mimeType }
 *
 * Same operation the web capture screen calls directly; here for the mobile app,
 * which records natively and cannot call a server function.
 */
export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await readJson<{ audio?: string; mimeType?: string }>(request);
          return Response.json(await transcribeAudio({ data: body }));
        } catch (err) {
          return apiError(err);
        }
      },
    },
  },
});
