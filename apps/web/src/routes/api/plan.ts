import { createFileRoute } from "@tanstack/react-router";
import type { ExtractedItem } from "@/lib/plan";
import { apiError, readJson } from "@/lib/server/api";
import { addPlanItems, listPlanItems } from "@/lib/server/plan-items";

/**
 * The mobile app's view of the plan.
 *
 *   GET  /api/plan   -> { items }
 *   POST /api/plan   -> { added, synced }   body: { items, timezone }
 *
 * Server routes rather than server functions, because the caller is a native app
 * on another origin.
 */
export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json({ items: await listPlanItems() });
        } catch (err) {
          return apiError(err);
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await readJson<{ items?: ExtractedItem[]; timezone?: string }>(request);
          const result = await addPlanItems({
            data: { items: body.items ?? [], timezone: body.timezone },
          });
          return Response.json(result);
        } catch (err) {
          return apiError(err);
        }
      },
    },
  },
});
