import { createFileRoute } from "@tanstack/react-router";
import type { ConnectorId } from "@/lib/connectors";
import { apiError, readJson } from "@/lib/server/api";
import { connectConnector, getConnectors, syncConnectors } from "@/lib/server/connectors";

/**
 *   GET  /api/connectors -> { connectors }
 *   POST /api/connectors -> { url } | { synced, failed }
 *        body: { action: "connect" | "sync", id?, timezone? }
 *
 * One route for both actions keeps the mobile client's surface small. "connect"
 * returns the Composio link to open; "sync" pushes pending items.
 */
export const Route = createFileRoute("/api/connectors")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json({ connectors: await getConnectors() });
        } catch (err) {
          return apiError(err);
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await readJson<{
            action?: string;
            id?: ConnectorId;
            timezone?: string;
          }>(request);

          if (body.action === "connect") {
            if (!body.id) {
              return Response.json({ error: "Which connector?" }, { status: 400 });
            }
            return Response.json(await connectConnector({ data: { id: body.id } }));
          }

          if (body.action === "sync") {
            return Response.json(
              await syncConnectors({ data: { timezone: body.timezone, id: body.id } }),
            );
          }

          return Response.json({ error: "Unknown action." }, { status: 400 });
        } catch (err) {
          return apiError(err);
        }
      },
    },
  },
});
