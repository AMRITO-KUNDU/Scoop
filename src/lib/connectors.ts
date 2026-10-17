import type { ExtractedItem, ItemType } from "@/lib/plan";

/**
 * Connector metadata shared by the client and the server.
 *
 * Contains no secrets and no Composio specifics — the server-side Composio
 * client lives in `src/lib/server/composio.ts`, and the server functions that
 * expose it live in `src/lib/server/connectors.ts`.
 *
 * Nothing here is operator-facing: a user only ever sees "Connect" or
 * "Connected". Any setup detail belongs in .env.example and the README.
 */

export const CONNECTOR_IDS = ["googlecalendar", "googletasks"] as const;
export type ConnectorId = (typeof CONNECTOR_IDS)[number];

/**
 * `unavailable` — the service is switched off for this deployment.
 * `ready`       — switched on; this user just hasn't connected yet.
 * `connected`   — live; syncing works.
 */
export type ConnectorState = "unavailable" | "ready" | "connected";

export type ConnectorStatus = {
  id: ConnectorId;
  name: string;
  /** One line under the title. */
  description: string;
  /** What SCOOP actually does with the connection. */
  detail: string;
  state: ConnectorState;
  /** Plan items already pushed to this service. */
  syncedCount: number;
  /** Plan items that qualify but still need pushing. */
  pendingCount: number;
};

/** Which plan items a connector receives. */
export type ConnectorRouting = {
  /** Item types to send. Empty means every type. */
  types: ItemType[];
  /** Whether the item must have a date to qualify. */
  requiresDate: boolean;
};

export type ConnectorDefinition = {
  name: string;
  description: string;
  detail: string;
  routing: ConnectorRouting;
};

/** The catalogue, in display order. */
export const CONNECTOR_CATALOGUE: Record<ConnectorId, ConnectorDefinition> = {
  googlecalendar: {
    name: "Google Calendar",
    description: "Put your dates straight into your calendar.",
    detail:
      "Connect once and you're done. Anything with a date is added to your Google Calendar as you save it, and whatever is already in your plan is synced for you. SCOOP remembers what it has sent, so nothing is duplicated.",
    routing: { types: [], requiresDate: true },
  },
  googletasks: {
    name: "Google Tasks",
    description: "Turn what you have to do into a to-do list.",
    detail:
      "The things you need to do — tasks, deadlines and RSVPs — become items in your Google Tasks list, with the due date filled in wherever you gave one. Ticking something off in Google Tasks doesn't change your plan, and vice versa; the two stay separate.",
    routing: { types: ["task", "deadline", "rsvp"], requiresDate: false },
  },
};

/** Does this connector want this item? */
export function connectorTakes(connector: ConnectorId, item: ExtractedItem): boolean {
  const { routing } = CONNECTOR_CATALOGUE[connector];
  if (routing.requiresDate && !item.date) return false;
  if (routing.types.length && !routing.types.includes(item.type)) return false;
  return true;
}

export function isConnectorId(value: string): value is ConnectorId {
  return (CONNECTOR_IDS as readonly string[]).includes(value);
}
