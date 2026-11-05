import { createFileRoute } from "@tanstack/react-router";
import type { ExtractedItem } from "@/lib/plan";
import { apiError, readJson } from "@/lib/server/api";
import { deletePlanItem, setPlanItemDone, updatePlanItem } from "@/lib/server/plan-items";

/**
 *   PATCH  /api/plan/:id  -> { ok }   body: { done } | { item, timezone }
 *   DELETE /api/plan/:id  -> { ok }
 *
 * The id travels in the path rather than the body, so DELETE needs no payload.
 * PATCH carries two shapes: a tick sends `done`, an edit sends the whole item —
 * the same two operations the web app calls directly.
 */
export const Route = createFileRoute("/api/plan/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const id = Number(params.id);
          if (!Number.isFinite(id)) {
            return Response.json({ error: "Invalid item id." }, { status: 400 });
          }
          const body = await readJson<{
            done?: boolean;
            item?: ExtractedItem;
            timezone?: string;
          }>(request);

          if (body.item) {
            return Response.json(
              await updatePlanItem({ data: { id, item: body.item, timezone: body.timezone } }),
            );
          }
          return Response.json(await setPlanItemDone({ data: { id, done: body.done === true } }));
        } catch (err) {
          return apiError(err);
        }
      },

      DELETE: async ({ params }) => {
        try {
          const id = Number(params.id);
          if (!Number.isFinite(id)) {
            return Response.json({ error: "Invalid item id." }, { status: 400 });
          }
          const result = await deletePlanItem({ data: { id } });
          return Response.json(result);
        } catch (err) {
          return apiError(err);
        }
      },
    },
  },
});
