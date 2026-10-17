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

export const CONNECTOR_IDS = ["googlecalendar"] as const;
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
  /** Plan items with a date that still need pushing. */
  pendingCount: number;
};

export type ConnectorDefinition = {
  name: string;
  description: string;
  detail: string;
};

/** The catalogue, in display order. Google Calendar is the first connector. */
export const CONNECTOR_CATALOGUE: Record<ConnectorId, ConnectorDefinition> = {
  googlecalendar: {
    name: "Google Calendar",
    description: "Put your plan straight into your calendar.",
    detail:
      "Connect once and you're done. Every item with a date is added to your Google Calendar as you save it, and anything already in your plan is synced for you. SCOOP remembers what it has sent, so nothing is ever duplicated.",
  },
};

export function isConnectorId(value: string): value is ConnectorId {
  return (CONNECTOR_IDS as readonly string[]).includes(value);
}
