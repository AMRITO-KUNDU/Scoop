/**
 * The mobile app's only door to the backend.
 *
 * It talks to the JSON API in `apps/web/src/routes/api/*`, because the web app's
 * server functions are same-origin RPC and deliberately not callable from a
 * native client on another origin.
 *
 * Auth is a Clerk session token in an `Authorization: Bearer` header — a native
 * app has no session cookie, and Clerk's middleware accepts the bearer form.
 */

import { useAuth } from '@clerk/expo';
import { useMemo, useRef } from 'react';

import type { ConnectorId, ConnectorStatus } from '@/lib/connectors';
import type { ExtractedItem, PlanItem } from '@/lib/plan';

/** Public origin of the web app. Set EXPO_PUBLIC_API_URL for other environments. */
const BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'https://scoop-topaz.vercel.app').replace(
  /\/+$/,
  '',
);

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type CaptureResult = {
  ok: true;
  items: ExtractedItem[];
  engine: 'groq' | 'local';
  method: 'tool_calling' | 'local';
  model?: string;
  reason?: string;
};

export type TokenGetter = () => Promise<string | null>;

function createApi(getToken: TokenGetter) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();

    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }

    if (!res.ok) {
      const message =
        (body as { error?: string } | null)?.error ?? `Request failed (${res.status}).`;
      throw new ApiError(message, res.status);
    }
    return body as T;
  }

  return {
    listPlan: () => request<{ items: PlanItem[] }>('/api/plan').then((r) => r.items),

    addItems: (items: ExtractedItem[], timezone: string) =>
      request<{ added: number; synced: number }>('/api/plan', {
        method: 'POST',
        body: JSON.stringify({ items, timezone }),
      }),

    setDone: (id: number, done: boolean) =>
      request<{ ok: boolean }>(`/api/plan/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done }),
      }),

    remove: (id: number) => request<{ ok: boolean }>(`/api/plan/${id}`, { method: 'DELETE' }),

    capture: (text: string) =>
      request<CaptureResult>('/api/capture', {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),

    connectors: () =>
      request<{ connectors: ConnectorStatus[] }>('/api/connectors').then((r) => r.connectors),

    connect: (id: ConnectorId) =>
      request<{ url: string }>('/api/connectors', {
        method: 'POST',
        body: JSON.stringify({ action: 'connect', id }),
      }),

    sync: (timezone: string, id?: ConnectorId) =>
      request<{ synced: number; failed: number }>('/api/connectors', {
        method: 'POST',
        body: JSON.stringify({ action: 'sync', timezone, id }),
      }),
  };
}

export type Api = ReturnType<typeof createApi>;

/**
 * The API bound to the signed-in user's token.
 *
 * The token getter is held in a ref so the returned client keeps a stable
 * identity across renders — otherwise every screen's load effect would re-run
 * each time Clerk hands back a new `getToken`.
 */
export function useApi(): Api {
  const { getToken } = useAuth();
  const latest = useRef(getToken);
  latest.current = getToken;

  return useMemo(() => createApi(() => latest.current()), []);
}
