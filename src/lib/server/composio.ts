import { env } from "@/lib/env.server";
import type { ExtractedItem } from "@/lib/plan";

/**
 * Minimal Composio REST client (server-only).
 *
 * Composio brokers the OAuth: we never see a Google token. We ask it for a
 * hosted connect link, then execute the Google Calendar toolkit's
 * `GOOGLECALENDAR_CREATE_EVENT` tool on the user's connected account.
 *
 * Docs: https://docs.composio.dev/reference/v3/api-reference/connected-accounts
 *       https://docs.composio.dev/toolkits/googlecalendar
 *
 * NOTE: written against Composio's published v3 REST API. Response envelopes are
 * read defensively (see `pick`) because Composio nests tool output inside the
 * API envelope and the exact depth has changed between versions.
 */

const COMPOSIO_BASE = "https://backend.composio.dev/api/v3";
const GOOGLECALENDAR_SLUG = "googlecalendar";
const CREATE_EVENT_TOOL = "GOOGLECALENDAR_CREATE_EVENT";

/** Google Calendar's default length for an item that has a date but no time. */
const DEFAULT_EVENT_MINUTES = 60;

export function composioApiKey(): string | undefined {
  return env("COMPOSIO_API_KEY");
}

/** True when Composio is switched on for this deployment. */
export function composioConfigured(): boolean {
  return Boolean(composioApiKey());
}

// Resolved once per server instance — the auth config is project-wide, not
// per-user, so there is nothing to recompute per request.
let cachedAuthConfigId: string | undefined;

/**
 * The Google Calendar auth config id.
 *
 * Operators never have to create one: if the project has no config for this
 * toolkit we ask Composio to make one with its own managed OAuth app, so the
 * only thing a deployment needs is `COMPOSIO_API_KEY`. Setting
 * `COMPOSIO_GCAL_AUTH_CONFIG_ID` overrides this when you want your own OAuth
 * client (for branded consent screens) instead.
 */
export async function googleCalendarAuthConfigId(): Promise<string> {
  const override = env("COMPOSIO_GCAL_AUTH_CONFIG_ID");
  if (override) return override;
  if (cachedAuthConfigId) return cachedAuthConfigId;

  // Reuse an existing config for this toolkit, if the project already has one.
  const listed = await call("/auth_configs", { method: "GET" });
  if (listed.ok) {
    const configs = [
      ...asArray(pick(listed.body, ["items"])),
      ...asArray(pick(listed.body, ["data", "items"])),
      ...asArray(pick(listed.body, ["data"])),
    ];
    const existing = configs.find((config) => {
      const slug =
        asString(pick(config, ["toolkit", "slug"])) ?? asString(pick(config, ["toolkit_slug"]));
      return slug?.toLowerCase() === GOOGLECALENDAR_SLUG;
    });
    const id = existing ? (asString(existing.id) ?? asString(existing.nanoid)) : undefined;
    if (id) {
      cachedAuthConfigId = id;
      return id;
    }
  }

  // Otherwise let Composio create one with its managed OAuth app.
  const created = await call("/auth_configs", {
    method: "POST",
    body: JSON.stringify({
      toolkit: { slug: GOOGLECALENDAR_SLUG },
      auth_config: {
        type: "use_composio_managed_auth",
        credentials: {},
        restrict_to_following_tools: [],
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
      `Composio could not prepare Google Calendar (HTTP ${created.status}). Check COMPOSIO_API_KEY.`,
    );
  }
  cachedAuthConfigId = id;
  return id;
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
  if (Array.isArray(value)) return value.filter((v): v is Json => Boolean(v && typeof v === "object"));
  return [];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

export type ConnectedAccount = { id: string };

/**
 * The user's live Google Calendar connection, if any.
 *
 * Filters by user + toolkit; if the API rejects the filter names we fall back to
 * listing the project's accounts and matching in code, so a filter rename on
 * Composio's side degrades to slower rather than broken.
 */
export async function findGoogleCalendarAccount(userId: string): Promise<ConnectedAccount | null> {
  const queries = [
    `?user_ids=${encodeURIComponent(userId)}&toolkit_slugs=${GOOGLECALENDAR_SLUG}`,
    `?user_id=${encodeURIComponent(userId)}&toolkit_slug=${GOOGLECALENDAR_SLUG}`,
    "",
  ];

  for (const query of queries) {
    const res = await call(`/connected_accounts${query}`, { method: "GET" });
    if (!res.ok) continue;

    const items = [
      ...asArray(pick(res.body, ["items"])),
      ...asArray(pick(res.body, ["data", "items"])),
      ...asArray(pick(res.body, ["data"])),
    ];
    if (!items.length) continue;

    const match = items.find((account) => {
      const status = asString(account.status) ?? asString(pick(account, ["connection", "status"]));
      const slug =
        asString(pick(account, ["toolkit", "slug"])) ??
        asString(pick(account, ["toolkit_slug"])) ??
        asString(pick(account, ["appName"]));
      const owner = asString(account.user_id) ?? asString(account.entity_id);
      const active = (status ?? "").toUpperCase() === "ACTIVE";
      const rightToolkit = !slug || slug.toLowerCase() === GOOGLECALENDAR_SLUG;
      const rightUser = !owner || owner === userId;
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
 * A Composio Connect Link: send the user here to authorise Google Calendar.
 * Returns the URL to redirect to.
 */
export async function createGoogleCalendarLink(
  userId: string,
  callbackUrl?: string,
): Promise<string> {
  const authConfigId = await googleCalendarAuthConfigId();

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
      `Composio did not return a connect link (HTTP ${res.status}). Check COMPOSIO_API_KEY and COMPOSIO_GCAL_AUTH_CONFIG_ID.`,
    );
  }
  return url;
}

/** Split a plan item into the calendar event arguments Composio expects. */
function eventArguments(item: ExtractedItem, timezone: string): Json | null {
  if (!item.date) return null;

  const args: Json = {
    summary: item.title,
    calendar_id: "primary",
    timezone,
    // Don't email anyone — SCOOP adds no attendees, and Composio would
    // otherwise notify the organiser.
    send_updates: "none",
    exclude_organizer: true,
    create_meeting_room: false,
  };
  if (item.location) args.location = item.location;
  if (item.notes) args.description = item.notes;

  if (item.time) {
    args.start_datetime = `${item.date}T${item.time}:00`;
    args.event_duration_hour = Math.floor(DEFAULT_EVENT_MINUTES / 60);
    args.event_duration_minutes = DEFAULT_EVENT_MINUTES % 60;
  } else {
    // All-day: `start_date` inclusive, `end_date` exclusive.
    args.start_date = item.date;
    const end = new Date(`${item.date}T00:00:00`);
    end.setDate(end.getDate() + 1);
    args.end_date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(
      end.getDate(),
    ).padStart(2, "0")}`;
  }
  return args;
}

/** Pull the created event's id out of whichever envelope Composio used. */
function createdEventId(body: unknown): string | undefined {
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

export type CreateEventResult =
  | { ok: true; eventId?: string }
  | { ok: false; error: string };

/**
 * Create one Google Calendar event for a plan item, on the user's connection.
 *
 * Two attempts: the full argument set first, then a minimal one. Composio
 * validates tool arguments against the toolkit schema, and optional fields such
 * as `create_meeting_room` are not documented in every version — if the schema
 * rejects them we still create the event rather than failing the sync.
 */
export async function createCalendarEvent(
  userId: string,
  accountId: string,
  item: ExtractedItem,
  timezone: string,
): Promise<CreateEventResult> {
  const full = eventArguments(item, timezone);
  if (!full) return { ok: false, error: "Item has no date." };

  const minimal: Json = {
    summary: full.summary,
    calendar_id: "primary",
    timezone,
  };
  if (full.start_datetime) {
    minimal.start_datetime = full.start_datetime;
    minimal.event_duration_hour = full.event_duration_hour;
    minimal.event_duration_minutes = full.event_duration_minutes;
  } else {
    minimal.start_date = full.start_date;
    minimal.end_date = full.end_date;
  }

  let lastError = "Unknown error.";
  for (const args of [full, minimal]) {
    const res = await call(`/tools/execute/${CREATE_EVENT_TOOL}`, {
      method: "POST",
      body: JSON.stringify({
        connected_account_id: accountId,
        user_id: userId,
        arguments: args,
      }),
    });

    if (res.ok) {
      const failure = toolFailed(res.body);
      if (failure) {
        lastError = failure;
        continue;
      }
      return { ok: true, eventId: createdEventId(res.body) };
    }
    lastError = `Composio returned HTTP ${res.status}.`;
  }
  return { ok: false, error: lastError };
}
