import { env } from "@/lib/env.server";
import type { ExtractedItem } from "@/lib/plan";

/**
 * Minimal Composio REST client (server-only).
 *
 * Composio brokers the OAuth: we never see a Google token. We ask it for a
 * hosted connect link, then execute a toolkit's tools on the user's connected
 * account.
 *
 * No Google Cloud project is required. Google Calendar and Google Tasks are both
 * on Composio's managed OAuth list, so auth configs are created with
 * `use_composio_managed_auth` and Composio's own OAuth app serves the consent
 * screen. Bringing your own OAuth client is only worth it later for branding,
 * custom scopes or a dedicated quota — see the README.
 *
 * Docs: https://docs.composio.dev/reference/v3/api-reference/connected-accounts
 *       https://docs.composio.dev/toolkits/googlecalendar
 *       https://docs.composio.dev/toolkits/googletasks
 *
 * NOTE: written against Composio's published v3 REST API. Response envelopes are
 * read defensively (see `pick`) because Composio nests tool output inside the
 * API envelope and the exact depth has changed between versions.
 */

const COMPOSIO_BASE = "https://backend.composio.dev/api/v3";

export type ToolkitSlug = "googlecalendar" | "googletasks";

type ToolkitSpec = {
  label: string;
  /** Prefix for this toolkit's optional env overrides. */
  envPrefix: string;
};

const TOOLKITS: Record<ToolkitSlug, ToolkitSpec> = {
  googlecalendar: { label: "Google Calendar", envPrefix: "GCAL" },
  googletasks: { label: "Google Tasks", envPrefix: "TASKS" },
};

export function composioApiKey(): string | undefined {
  return env("COMPOSIO_API_KEY");
}

/** True when Composio is switched on for this deployment. */
export function composioConfigured(): boolean {
  return Boolean(composioApiKey());
}

/** Optional per-toolkit override, e.g. COMPOSIO_GCAL_AUTH_CONFIG_ID. */
function toolkitEnv(toolkit: ToolkitSlug, suffix: string): string | undefined {
  return env(`COMPOSIO_${TOOLKITS[toolkit].envPrefix}_${suffix}`);
}

type Json = Record<string, unknown>;

type ComposioResponse = { ok: boolean; status: number; body: unknown };

async function call(path: string, init?: RequestInit): Promise<ComposioResponse> {
  const key = composioApiKey();
  if (!key) throw new Error("COMPOSIO_API_KEY is not configured.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${COMPOSIO_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "x-api-key": key,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

/** Walk a path of keys, tolerating missing/odd-shaped intermediate values. */
function pick(root: unknown, path: (string | number)[]): unknown {
  let node: unknown = root;
  for (const key of path) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

function asArray(value: unknown): Json[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is Json => Boolean(v && typeof v === "object"));
  }
  return [];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

/** Composio list endpoints have returned the collection under a few keys. */
function listedItems(body: unknown): Json[] {
  return [
    ...asArray(pick(body, ["items"])),
    ...asArray(pick(body, ["data", "items"])),
    ...asArray(pick(body, ["data"])),
  ];
}

// Auth configs are project-wide, not per-user, so one lookup per toolkit per
// server instance is enough.
const authConfigCache = new Map<ToolkitSlug, string>();

/**
 * The auth config id for a toolkit.
 *
 * Operators never have to create one: if the project has no config for the
 * toolkit we ask Composio to make one with its own managed OAuth app, so the
 * only thing a deployment needs is `COMPOSIO_API_KEY`. Setting the toolkit's
 * `..._AUTH_CONFIG_ID` overrides this when you want your own OAuth client.
 */
export async function authConfigIdFor(toolkit: ToolkitSlug): Promise<string> {
  const override = toolkitEnv(toolkit, "AUTH_CONFIG_ID");
  if (override) return override;

  const cached = authConfigCache.get(toolkit);
  if (cached) return cached;

  // Reuse an existing config for this toolkit, if the project already has one.
  const listed = await call("/auth_configs", { method: "GET" });
  if (listed.ok) {
    const existing = listedItems(listed.body).find((config) => {
      const slug =
        asString(pick(config, ["toolkit", "slug"])) ?? asString(pick(config, ["toolkit_slug"]));
      return slug?.toLowerCase() === toolkit;
    });
    const id = existing ? (asString(existing.id) ?? asString(existing.nanoid)) : undefined;
    if (id) {
      authConfigCache.set(toolkit, id);
      return id;
    }
  }

  // Otherwise let Composio create one with its managed OAuth app. Composio picks
  // sensible default scopes for the toolkit, so `credentials` is normally empty;
  // the `..._SCOPES` override is the escape hatch if the defaults ever turn out
  // not to cover what SCOOP needs.
  const scopes = toolkitEnv(toolkit, "SCOPES")?.trim();
  const created = await call("/auth_configs", {
    method: "POST",
    body: JSON.stringify({
      toolkit: { slug: toolkit },
      auth_config: {
        name: `SCOOP ${TOOLKITS[toolkit].label}`,
        type: "use_composio_managed_auth",
        credentials: scopes ? { scopes } : {},
      },
    }),
  });

  const id =
    asString(pick(created.body, ["auth_config", "id"])) ??
    asString(pick(created.body, ["data", "auth_config", "id"])) ??
    asString(pick(created.body, ["id"])) ??
    asString(pick(created.body, ["data", "id"]));

  if (!id) {
    throw new Error(
      `Composio could not prepare ${TOOLKITS[toolkit].label} (HTTP ${created.status}). Check COMPOSIO_API_KEY.`,
    );
  }
  authConfigCache.set(toolkit, id);
  return id;
}

export type ConnectedAccount = { id: string };

/**
 * The user's live connection to a toolkit, if any.
 *
 * Filters by user + toolkit; if the API rejects the filter names we fall back to
 * listing the project's accounts and matching in code, so a filter rename on
 * Composio's side degrades to slower rather than broken.
 */
export async function connectedAccount(
  userId: string,
  toolkit: ToolkitSlug,
): Promise<ConnectedAccount | null> {
  const queries = [
    `?user_ids=${encodeURIComponent(userId)}&toolkit_slugs=${toolkit}`,
    `?user_id=${encodeURIComponent(userId)}&toolkit_slug=${toolkit}`,
    "",
  ];

  for (const query of queries) {
    const res = await call(`/connected_accounts${query}`, { method: "GET" });
    if (!res.ok) continue;

    const items = listedItems(res.body);
    if (!items.length) continue;

    // Safety: never adopt an account we can't attribute to this user. If the
    // response exposes ownership at all, require a match — otherwise only trust
    // a response we explicitly filtered by user, and never the unfiltered list.
    const exposesOwner = items.some(
      (account) => asString(account.user_id) ?? asString(account.entity_id),
    );

    const match = items.find((account) => {
      const status = asString(account.status) ?? asString(pick(account, ["connection", "status"]));
      const slug =
        asString(pick(account, ["toolkit", "slug"])) ??
        asString(pick(account, ["toolkit_slug"])) ??
        asString(pick(account, ["appName"]));
      const owner = asString(account.user_id) ?? asString(account.entity_id);
      const active = (status ?? "").toUpperCase() === "ACTIVE";
      const rightToolkit = !slug || slug.toLowerCase() === toolkit;
      const rightUser = exposesOwner ? owner === userId : Boolean(query);
      return active && rightToolkit && rightUser;
    });

    if (match) {
      const id = asString(match.id) ?? asString(match.nanoid);
      if (id) return { id };
    }
    // A filtered query that returned rows is authoritative — don't widen further.
    if (query) return null;
  }
  return null;
}

/**
 * A Composio Connect Link: send the user here to authorise the toolkit.
 * Returns the URL to redirect to.
 */
export async function createConnectLink(
  userId: string,
  toolkit: ToolkitSlug,
  callbackUrl?: string,
): Promise<string> {
  const authConfigId = await authConfigIdFor(toolkit);

  const res = await call("/connected_accounts/link", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      auth_config_id: authConfigId,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    }),
  });

  const url =
    asString(pick(res.body, ["redirect_url"])) ??
    asString(pick(res.body, ["redirectUrl"])) ??
    asString(pick(res.body, ["data", "redirect_url"])) ??
    asString(pick(res.body, ["data", "redirectUrl"]));

  if (!url) {
    throw new Error(
      `Composio did not return a connect link for ${TOOLKITS[toolkit].label} (HTTP ${res.status}).`,
    );
  }
  return url;
}

/** Pull the created resource's id out of whichever envelope Composio used. */
function createdId(body: unknown): string | undefined {
  const paths: (string | number)[][] = [
    ["data", "response_data", "id"],
    ["data", "data", "response_data", "id"],
    ["response_data", "id"],
    ["data", "id"],
    ["data", "data", "id"],
  ];
  for (const path of paths) {
    const id = asString(pick(body, path));
    if (id) return id;
  }
  return undefined;
}

function toolFailed(body: unknown): string | undefined {
  const successful = pick(body, ["data", "successful"]) ?? pick(body, ["successful"]);
  if (successful === false) {
    return (
      asString(pick(body, ["data", "error"])) ??
      asString(pick(body, ["error"])) ??
      "Composio reported the tool call as unsuccessful."
    );
  }
  return undefined;
}

export type ToolResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Execute a tool, retrying once with a smaller argument set.
 *
 * Composio validates arguments against the toolkit schema and optional fields
 * are not documented in every version. The retry only fires when the error
 * actually looks like a rejected argument — these create calls are not
 * idempotent, so retrying on an unrelated failure would risk a duplicate.
 */
async function executeTool(
  tool: string,
  accountId: string,
  userId: string,
  variants: Json[],
): Promise<ToolResult> {
  let lastError = "Unknown error.";

  for (const [index, args] of variants.entries()) {
    const res = await call(`/tools/execute/${tool}`, {
      method: "POST",
      body: JSON.stringify({
        connected_account_id: accountId,
        user_id: userId,
        arguments: args,
      }),
    });

    if (res.ok) {
      const failure = toolFailed(res.body);
      if (!failure) return { ok: true, id: createdId(res.body) };
      lastError = failure;
    } else {
      lastError = `Composio returned HTTP ${res.status}.`;
    }

    const isLast = index === variants.length - 1;
    const looksLikeBadArgs =
      /invalid|unknown|unexpected|unsupported|schema|parameter|argument|field|required|additional/i.test(
        lastError,
      );
    if (isLast || !looksLikeBadArgs) break;
  }

  return { ok: false, error: lastError };
}

/** Google Calendar's default length for an item that has a date but no time. */
const DEFAULT_EVENT_MINUTES = 60;

/** Create one calendar event for a plan item. */
export async function createCalendarEvent(
  userId: string,
  accountId: string,
  item: ExtractedItem,
  timezone: string,
): Promise<ToolResult> {
  if (!item.date) return { ok: false, error: "Item has no date." };

  const full: Json = {
    summary: item.title,
    calendar_id: "primary",
    timezone,
    // Don't email anyone — SCOOP adds no attendees, and Composio would
    // otherwise notify the organiser.
    send_updates: "none",
    exclude_organizer: true,
    create_meeting_room: false,
  };
  if (item.location) full.location = item.location;
  if (item.notes) full.description = item.notes;

  if (item.time) {
    full.start_datetime = `${item.date}T${item.time}:00`;
    full.event_duration_hour = Math.floor(DEFAULT_EVENT_MINUTES / 60);
    full.event_duration_minutes = DEFAULT_EVENT_MINUTES % 60;
  } else {
    // All-day: `start_date` inclusive, `end_date` exclusive.
    full.start_date = item.date;
    const end = new Date(`${item.date}T00:00:00`);
    end.setDate(end.getDate() + 1);
    full.end_date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(
      end.getDate(),
    ).padStart(2, "0")}`;
  }

  const minimal: Json = { summary: full.summary, calendar_id: "primary", timezone };
  if (full.start_datetime) {
    minimal.start_datetime = full.start_datetime;
    minimal.event_duration_hour = full.event_duration_hour;
    minimal.event_duration_minutes = full.event_duration_minutes;
  } else {
    minimal.start_date = full.start_date;
    minimal.end_date = full.end_date;
  }

  return executeTool("GOOGLECALENDAR_CREATE_EVENT", accountId, userId, [full, minimal]);
}

/** Create one Google Task for a plan item. */
export async function createGoogleTask(
  userId: string,
  accountId: string,
  item: ExtractedItem,
): Promise<ToolResult> {
  const full: Json = {
    tasklist_id: "@default",
    title: item.title,
    status: "needsAction",
  };
  if (item.date) {
    // Google Tasks keeps only the date part. Anchoring at midday UTC keeps the
    // intended calendar date for every offset from -12 to +12.
    full.due = `${item.date}T12:00:00.000Z`;
  }
  if (item.notes) full.notes = item.notes;

  const minimal: Json = { tasklist_id: "@default", title: item.title };

  return executeTool("GOOGLETASKS_INSERT_TASK", accountId, userId, [full, minimal]);
}
