import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  CONNECTOR_CATALOGUE,
  CONNECTOR_IDS,
  type ConnectorState,
  type ConnectorStatus,
} from "@/lib/connectors";
import { getSql } from "@/lib/db";
import type { ExtractedItem } from "@/lib/plan";
import { SITE_URL } from "@/lib/site";
import {
  composioConfigured,
  createCalendarEvent,
  createGoogleCalendarLink,
  findGoogleCalendarAccount,
} from "@/lib/server/composio";

/**
 * Connector server functions. All of them are scoped to the signed-in user, and
 * every one degrades quietly when Composio isn't configured — the UI then shows
 * "not configured" rather than erroring.
 */

const DEFAULT_TIMEZONE = "UTC";
const MAX_SYNC_PER_CALL = 50;

/** Accept only plausible IANA zone names; anything else falls back to UTC. */
export function normaliseTimezone(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_TIMEZONE;
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 64) return DEFAULT_TIMEZONE;
  return /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/.test(trimmed) ? trimmed : DEFAULT_TIMEZONE;
}

type Counts = { synced: number; pending: number };

async function calendarCounts(userId: string): Promise<Counts> {
  const sql = await getSql();
  const rows = await sql<{ synced: number; pending: number }>`
    select
      count(*) filter (where calendar_event_id is not null) as synced,
      count(*) filter (where calendar_event_id is null and date is not null) as pending
    from plan_items
    where user_id = ${userId}
  `;
  const row = rows[0];
  return { synced: Number(row?.synced ?? 0), pending: Number(row?.pending ?? 0) };
}

export const getConnectors = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ConnectorStatus[]> => {
    if (!context.userId) throw new Error("Unauthorized");
    const counts = await calendarCounts(context.userId);

    // Only ask Composio for connection state when it is actually configured.
    let state: ConnectorState = "not_configured";
    if (composioConfigured()) {
      const account = await findGoogleCalendarAccount(context.userId).catch(() => null);
      state = account ? "connected" : "ready";
    }

    return CONNECTOR_IDS.map((id) => ({
      id,
      ...CONNECTOR_CATALOGUE[id],
      state,
      syncedCount: counts.synced,
      pendingCount: counts.pending,
    }));
  });

export const connectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ url: string }> => {
    if (!context.userId) throw new Error("Unauthorized");
    if (!composioConfigured()) {
      throw new Error(
        "Google Calendar isn't configured yet. Set COMPOSIO_API_KEY and COMPOSIO_GCAL_AUTH_CONFIG_ID.",
      );
    }
    const url = await createGoogleCalendarLink(context.userId, `${SITE_URL}/connect`);
    return { url };
  });

export type PushResult = { synced: number; failed: number };

/**
 * Push plan items to the user's Google Calendar and record which event each one
 * became, so a later sync never duplicates it.
 *
 * Best-effort by design: a failure here must never fail the caller (adding items
 * to the plan), so every error is counted, not thrown.
 */
export async function pushItemsToCalendar(
  userId: string,
  rows: { id: number; item: ExtractedItem }[],
  timezone: string,
): Promise<PushResult> {
  const dated = rows.filter((row) => row.item.date);
  if (!dated.length || !composioConfigured()) return { synced: 0, failed: 0 };

  const account = await findGoogleCalendarAccount(userId).catch(() => null);
  if (!account) return { synced: 0, failed: 0 };

  const sql = await getSql();
  let synced = 0;
  let failed = 0;

  for (const { id, item } of dated) {
    const result = await createCalendarEvent(userId, account.id, item, timezone).catch(
      (err: unknown) => ({
        ok: false as const,
        error: err instanceof Error ? err.message : "Calendar sync failed.",
      }),
    );
    if (!result.ok) {
      failed += 1;
      continue;
    }
    await sql`
      update plan_items
      set calendar_event_id = ${result.eventId ?? "synced"}
      where id = ${id} and user_id = ${userId}
    `;
    synced += 1;
  }
  return { synced, failed };
}

export const syncPlanToCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { timezone?: string } | undefined) => ({
    timezone: normaliseTimezone(input?.timezone),
  }))
  .handler(async ({ context, data }): Promise<PushResult> => {
    if (!context.userId) throw new Error("Unauthorized");
    if (!composioConfigured()) {
      throw new Error(
        "Google Calendar isn't configured yet. Set COMPOSIO_API_KEY and COMPOSIO_GCAL_AUTH_CONFIG_ID.",
      );
    }

    const sql = await getSql();
    const rows = await sql<{
      id: number;
      type: string;
      title: string;
      date: string | null;
      time: string | null;
      location: string | null;
      notes: string | null;
    }>`
      select id, type, title, date, time, location, notes
      from plan_items
      where user_id = ${context.userId}
        and calendar_event_id is null
        and date is not null
      order by date asc, time asc
      limit ${MAX_SYNC_PER_CALL}
    `;

    return pushItemsToCalendar(
      context.userId,
      rows.map((row) => ({
        id: Number(row.id),
        item: {
          type: (row.type as ExtractedItem["type"]) ?? "task",
          title: row.title,
          date: row.date,
          time: row.time,
          location: row.location,
          notes: row.notes,
        },
      })),
      data.timezone,
    );
  });
