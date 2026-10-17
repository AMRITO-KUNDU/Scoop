/**
 * Connector metadata — the mobile counterpart of the web app's
 * `src/lib/connectors.ts`. Display copy only; all connector behaviour lives on
 * the server.
 */

export const CONNECTOR_IDS = ['googlecalendar', 'googletasks'] as const;
export type ConnectorId = (typeof CONNECTOR_IDS)[number];

export type ConnectorState = 'unavailable' | 'ready' | 'connected';

export type ConnectorStatus = {
  id: ConnectorId;
  name: string;
  description: string;
  detail: string;
  state: ConnectorState;
  syncedCount: number;
  pendingCount: number;
};

export const STATE_LABEL: Record<ConnectorState, string> = {
  unavailable: 'Unavailable',
  ready: 'Not connected',
  connected: 'Connected',
};
