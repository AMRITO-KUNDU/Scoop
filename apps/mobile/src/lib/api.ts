/**
 * The mobile app's only door to the backend.
 *
 * It talks to the JSON API in `apps/web/src/routes/api/*`, because the web app's
 * server functions are same-origin RPC and deliberately not callable from a
 * native client on another origin.
 *
 * Auth is a Clerk session token in an `Authorization: Bearer` header — a native
 * app has no session cookie, and Clerk's middleware accepts the bearer form.
 *
 * Every request carries a deadline. React Native's `fetch` has no default
 * timeout, so without one a dropped connection leaves a screen spinning for as
 * long as the OS keeps the socket alive — which is what used to make the app
 * look frozen offline. Failures are classified (see `ApiErrorKind`) so a screen
 * can tell "you're offline" apart from "the server said no" and show the right
 * thing instead of a generic error.
 */

import { useAuth } from '@clerk/expo';
import { useMemo, useRef } from 'react';

import type { ConnectorId, ConnectorStatus } from '@/lib/connectors';
import type { ExtractedItem, PlanItem } from '@/lib/plan';

/**
 * Public origin of the web app, from EXPO_PUBLIC_API_URL.
 *
 * Required, deliberately with no fallback: a built-in default would let a build
 * with the variable missing ship silently against whatever deployment that
 * default happened to name, and the first symptom would be a sign-in or sync
 * failure on a real device. Failing here names the cause instead.
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
if (!apiUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Copy apps/mobile/.env.example to apps/mobile/.env ' +
      'and point it at your deployed web app (no trailing slash).',
  );
}
const BASE = apiUrl.replace(/\/+$/, '');

/** How long an ordinary request may take before we call it a connection problem. */
const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * Extraction is the one slow call: the server tries up to two Groq models at
 * 12s each before falling back to the on-device parser, so a short deadline
 * here would abort work that was about to succeed.
 */
const EXTRACT_TIMEOUT_MS = 30_000;

export type ApiErrorKind = 'offline' | 'timeout' | 'unauthorized' | 'server' | 'unknown';

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;

  constructor(message: string, status: number, kind: ApiErrorKind) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }

  /** True when the request never got an answer — the network, not the server. */
  get isConnectionProblem(): boolean {
    return this.kind === 'offline' || this.kind === 'timeout';
  }
}

/** Did this failure come from the network? Screens use it to pick their state. */
export function isConnectionProblem(err: unknown): boolean {
  return err instanceof ApiError && err.isConnectionProblem;
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

const OFFLINE_MESSAGE = "Can't reach SCOOP. Check your connection and try again.";
const TIMEOUT_MESSAGE = 'SCOOP took too long to answer. Try again in a moment.';

/**
 * The Clerk instance this build signs in to, decoded from the publishable key
 * (`pk_test_`/`pk_live_` followed by base64 of "<frontend-api>$").
 */
function frontendApiFromPublishableKey(key: string | undefined): string | null {
  const match = /^pk_(?:test|live)_(.+)$/.exec(key?.trim() ?? '');
  if (!match) return null;
  // Looked up at runtime rather than referenced directly: `atob` is not in every
  // TS lib this app compiles against, and a missing global must not throw.
  const decode = (globalThis as { atob?: (value: string) => string }).atob;
  if (typeof decode !== 'function') return null;
  try {
    const host = decode(match[1]).split('$')[0]?.trim();
    return host || null;
  } catch {
    return null;
  }
}

/**
 * A 401 is never just "Unauthorized" here.
 *
 * The two causes look identical from a phone and have completely different
 * fixes: the server has no Clerk secret key (a deployment problem), or this
 * build signs in to a different Clerk app than the server verifies against (a
 * build problem). The server names its instance on every 401 so we can tell.
 */
function unauthorisedMessage(body: unknown): string {
  const payload = body as { reason?: string; frontendApi?: string | null } | null;

  if (payload?.reason === 'auth_unconfigured') {
    return 'The SCOOP server cannot verify sign-in: CLERK_SECRET_KEY is not set on the web deployment.';
  }

  const appApi = frontendApiFromPublishableKey(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const serverApi = payload?.frontendApi ?? null;
  if (appApi && serverApi && appApi !== serverApi) {
    return `This app signs in to ${appApi}, but the server expects ${serverApi}. Build the app with the same Clerk app as the web deployment (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).`;
  }

  return 'Your session could not be verified. Sign out and sign in again.';
}

function createApi(getToken: TokenGetter) {
  async function request<T>(
    path: string,
    init?: RequestInit,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  ): Promise<T> {
    // Getting a token can itself need the network (a Clerk refresh), so it is
    // inside the same guard: offline, this throws instead of hanging.
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      throw new ApiError(OFFLINE_MESSAGE, 0, 'offline');
    }

    // No token means the session has not finished loading. Sending the request
    // anyway earns a bare 401 that reads like "signed out", so say what it is.
    if (!token) {
      throw new ApiError(
        'Your session is still loading. Wait a moment and try again.',
        401,
        'unauthorized',
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
    } catch {
      // `fetch` rejects for both a dead connection and our own abort, and RN
      // reports them the same way — the signal tells them apart.
      if (controller.signal.aborted) throw new ApiError(TIMEOUT_MESSAGE, 0, 'timeout');
      throw new ApiError(OFFLINE_MESSAGE, 0, 'offline');
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw new ApiError(unauthorisedMessage(body), 401, 'unauthorized');
      }
      const message =
        (body as { error?: string } | null)?.error ??
        (res.status >= 500 ? 'SCOOP had a problem. Try again in a moment.' : `Request failed (${res.status}).`);
      const kind: ApiErrorKind = res.status >= 500 ? 'server' : 'unknown';
      throw new ApiError(message, res.status, kind);
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
      request<CaptureResult>(
        '/api/capture',
        { method: 'POST', body: JSON.stringify({ text }) },
        EXTRACT_TIMEOUT_MS,
      ),

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
