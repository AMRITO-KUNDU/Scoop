import { createFileRoute } from "@tanstack/react-router";
import { apiError, readJson } from "@/lib/server/api";
import { deletePlanItem, setPlanItemDone } from "@/lib/server/plan-items";

/**
 *   PATCH  /api/plan/:id  -> { ok }   body: { done }
 *   DELETE /api/plan/:id  -> { ok }
 *
 * The id travels in the path rather than the body, so DELETE needs no payload.
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
          const body = await readJson<{ done?: boolean }>(request);
          const result = await setPlanItemDone({ data: { id, done: body.done === true } });
          return Response.json(result);
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
