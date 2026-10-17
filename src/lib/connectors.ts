/**
 * Connector metadata shared by the client and the server.
 *
 * Contains no secrets and no Composio specifics — the server-side Composio
 * client lives in `src/lib/server/composio.ts`, and the server functions that
 * expose it live in `src/lib/server/connectors.ts`.
 */

export const CONNECTOR_IDS = ["googlecalendar"] as const;
export type ConnectorId = (typeof CONNECTOR_IDS)[number];

/**
 * `not_configured` — the operator hasn't set the Composio env vars yet.
 * `ready`          — configured, but this user hasn't authorised the service.
 * `connected`      — the user has a live connection; syncing works.
 */
export type ConnectorState = "not_configured" | "ready" | "connected";

export type ConnectorStatus = {
  id: ConnectorId;
  name: string;
  /** One line under the title. */
  description: string;
  /** What SCOOP actually does with the connection. */
  detail: string;
  state: ConnectorState;
  /** Env vars the operator must set before the connector can work. */
  requires: string[];
  /** Plan items already pushed to this service. */
  syncedCount: number;
  /** Plan items with a date that still need pushing. */
  pendingCount: number;
};

export type ConnectorDefinition = {
  name: string;
  description: string;
  detail: string;
  requires: string[];
};

/** The catalogue, in display order. Google Calendar is the first connector. */
export const CONNECTOR_CATALOGUE: Record<ConnectorId, ConnectorDefinition> = {
  googlecalendar: {
    name: "Google Calendar",
    description: "Push dated plan items straight into your calendar.",
    detail:
      "Once connected, every item with a date is added to your primary Google Calendar as you save it — and you can re-sync the whole plan whenever you like. SCOOP remembers which items it has already sent, so nothing is duplicated.",
    requires: ["COMPOSIO_API_KEY", "COMPOSIO_GCAL_AUTH_CONFIG_ID"],
  },
};

export function isConnectorId(value: string): value is ConnectorId {
  return (CONNECTOR_IDS as readonly string[]).includes(value);
}
