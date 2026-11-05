import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  CONNECTOR_CATALOGUE,
  CONNECTOR_IDS,
  connectorTakes,
  isConnectorId,
  type ConnectorId,
  type ConnectorState,
  type ConnectorStatus,
} from "@/lib/connectors";
import { getSql } from "@/lib/db";
import type { ExtractedItem, ItemType } from "@/lib/plan";
import { SITE_URL } from "@/lib/site";
import {
  composioConfigured,
  connectedAccount,
  createCalendarEvent,
  createConnectLink,
  createGoogleTask,
  deleteCalendarEvent,
  deleteGoogleTask,
  setGoogleTaskStatus,
} from "@/lib/server/composio";

/**
 * Connector server functions. All of them are scoped to the signed-in user, and
 * every one degrades quietly when Composio isn't switched on — the UI then shows
 * "Unavailable" rather than erroring.
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

async function counts(userId: string, connector: ConnectorId): Promise<Counts> {
  const sql = await getSql();
  const requiresDate = connector === "googlecalendar";

  // Written per connector rather than composed, so the query stays a plain
  // tagged template and nothing is interpolated into SQL text.
  const rows = requiresDate
    ? await sql<{ synced: number; pending: number }>`
        select
          count(*) filter (where calendar_event_id is not null) as synced,
          count(*) filter (where calendar_event_id is null and date is not null) as pending
        from plan_items
        where user_id = ${userId}
      `
    : await sql<{ synced: number; pending: number }>`
        select
          count(*) filter (where tasks_task_id is not null) as synced,
          count(*) filter (where tasks_task_id is null and type in ('task', 'deadline', 'rsvp')) as pending
        from plan_items
        where user_id = ${userId}
      `;

  const row = rows[0];
  return { synced: Number(row?.synced ?? 0), pending: Number(row?.pending ?? 0) };
}

async function connectionState(
  userId: string,
  connector: ConnectorId,
  configured: boolean,
): Promise<ConnectorState> {
  if (!configured) return "unavailable";
  const account = await connectedAccount(userId, connector).catch(() => null);
  return account ? "connected" : "ready";
}

export const getConnectors = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ConnectorStatus[]> => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");

    const configured = composioConfigured();

    return Promise.all(
      CONNECTOR_IDS.map(async (id) => {
        const [state, tally] = await Promise.all([
          connectionState(userId, id, configured),
          counts(userId, id),
        ]);
        const { name, description, detail } = CONNECTOR_CATALOGUE[id];
        return {
          id,
          name,
          description,
          detail,
          state,
          syncedCount: tally.synced,
          pendingCount: tally.pending,
        };
      }),
    );
  });

export const connectConnector = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string } | undefined) => {
    const id = input?.id;
    if (!id || !isConnectorId(id)) throw new Error("Unknown connector.");
    return { id };
  })
  .handler(async ({ context, data }): Promise<{ url: string }> => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");
    if (!composioConfigured()) {
      throw new Error("Connections aren't available right now. Please try again later.");
    }
    const url = await createConnectLink(userId, data.id, `${SITE_URL}/connect`);
    return { url };
  });

export type PushResult = { synced: number; failed: number };

/** A plan item plus whatever it has already been pushed to. */
export type SyncableRow = {
  id: number;
  item: ExtractedItem;
  /** Already-pushed ids, keyed by connector. Absent or null means "not yet". */
  existing?: Partial<Record<ConnectorId, string | null>>;
};

/**
 * Push plan items to every connected service and record which resource each one
 * became, so a later sync never duplicates it.
 *
 * Best-effort by design: a failure here must never fail the caller (adding items
 * to the plan), so every error is counted, not thrown.
 */
export async function pushItemsToConnectors(
  userId: string,
  rows: SyncableRow[],
  timezone: string,
  only?: ConnectorId,
): Promise<PushResult> {
  if (!rows.length || !composioConfigured()) return { synced: 0, failed: 0 };

  const sql = await getSql();
  let synced = 0;
  let failed = 0;

  for (const connector of CONNECTOR_IDS) {
    if (only && connector !== only) continue;

    const wanted = rows.filter(
      (row) => !row.existing?.[connector] && connectorTakes(connector, row.item),
    );
    if (!wanted.length) continue;

    const account = await connectedAccount(userId, connector).catch(() => null);
    if (!account) continue;

    for (const { id, item } of wanted) {
      const result = await (
        connector === "googlecalendar"
          ? createCalendarEvent(userId, account.id, item, timezone)
          : createGoogleTask(userId, account.id, item)
      ).catch((err: unknown) => ({
        ok: false as const,
        error: err instanceof Error ? err.message : "Sync failed.",
      }));

      if (!result.ok) {
        failed += 1;
        continue;
      }

      // "unknown" marks the item as pushed when Composio didn't return an id, so
      // it is never sent twice — there is just no handle on the far side.
      const stored = result.id ?? "unknown";
      if (connector === "googlecalendar") {
        await sql`
          update plan_items set calendar_event_id = ${stored}
          where id = ${id} and user_id = ${userId}
        `;
      } else {
        await sql`
          update plan_items set tasks_task_id = ${stored}
          where id = ${id} and user_id = ${userId}
        `;
      }
      synced += 1;
    }
  }

  return { synced, failed };
}

export const syncConnectors = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { timezone?: string; id?: string } | undefined) => {
    const raw = input?.id;
    const id: ConnectorId | undefined = raw && isConnectorId(raw) ? raw : undefined;
    if (raw && !id) throw new Error("Unknown connector.");
    return { timezone: normaliseTimezone(input?.timezone), id };
  })
  .handler(async ({ context, data }): Promise<PushResult> => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");
    if (!composioConfigured()) {
      throw new Error("Sync isn't available right now. Please try again later.");
    }

    const sql = await getSql();

    type SyncRow = {
      id: number;
      type: string;
      title: string;
      date: string | null;
      time: string | null;
      location: string | null;
      notes: string | null;
      calendar_event_id: string | null;
      tasks_task_id: string | null;
    };

    // The `limit` must bound *unsynced* rows, so "still waiting on this
    // connector" is part of the `where` clause rather than a filter applied
    // afterwards. Filtering in JS instead would strand a user whose oldest 50
    // items are already pushed: every call would select the same synced 50, find
    // nothing pending and return {synced: 0}, leaving item 51 unreachable.
    //
    // The predicates mirror `connectorTakes()` (see CONNECTOR_CATALOGUE.routing):
    // Google Calendar wants dated items, Google Tasks wants task/deadline/rsvp.
    // Written per connector, like `counts()`, so each stays a plain tagged
    // template with nothing interpolated into the SQL text.
    const rows =
      data.id === "googlecalendar"
        ? await sql<SyncRow>`
            select id, type, title, date, time, location, notes, calendar_event_id, tasks_task_id
            from plan_items
            where user_id = ${userId}
              and calendar_event_id is null
              and date is not null
            order by date asc, time asc, id asc
            limit ${MAX_SYNC_PER_CALL}
          `
        : data.id === "googletasks"
          ? await sql<SyncRow>`
              select id, type, title, date, time, location, notes, calendar_event_id, tasks_task_id
              from plan_items
              where user_id = ${userId}
                and tasks_task_id is null
                and type in ('task', 'deadline', 'rsvp')
              order by date asc, time asc, id asc
              limit ${MAX_SYNC_PER_CALL}
            `
          : await sql<SyncRow>`
              select id, type, title, date, time, location, notes, calendar_event_id, tasks_task_id
              from plan_items
              where user_id = ${userId}
                and (
                  (calendar_event_id is null and date is not null)
                  or (tasks_task_id is null and type in ('task', 'deadline', 'rsvp'))
                )
              order by date asc, time asc, id asc
              limit ${MAX_SYNC_PER_CALL}
            `;

    return pushItemsToConnectors(
      userId,
      rows.map((row) => ({
        id: Number(row.id),
        item: {
          type: (row.type as ItemType) ?? "task",
          title: row.title,
          date: row.date,
          time: row.time,
          location: row.location,
          notes: row.notes,
        },
        existing: {
          googlecalendar: row.calendar_event_id,
          googletasks: row.tasks_task_id,
        },
      })),
      data.timezone,
      data.id,
    );
  });

/**
 * Delete the copies of a plan item that live in Google.
 *
 * Called after the row is gone, so the user's task list and calendar do not fill
 * up with entries for things they deleted here. Best effort, like the push: a
 * Google hiccup must never fail the delete they asked for.
 */
export async function removePushedCopies(
  userId: string,
  copies: { taskId?: string | null; eventId?: string | null },
): Promise<void> {
  if (!composioConfigured()) return;

  const taskId = copies.taskId && copies.taskId !== "unknown" ? copies.taskId : null;
  const eventId = copies.eventId && copies.eventId !== "unknown" ? copies.eventId : null;
  if (!taskId && !eventId) return;

  if (taskId) {
    const account = await connectedAccount(userId, "googletasks").catch(() => null);
    if (account) {
      await deleteGoogleTask(userId, account.id, taskId).catch((err: unknown) =>
        console.error("[connectors] could not delete the Google Task:", err),
      );
    }
  }

  if (eventId) {
    const account = await connectedAccount(userId, "googlecalendar").catch(() => null);
    if (account) {
      await deleteCalendarEvent(userId, account.id, eventId).catch((err: unknown) =>
        console.error("[connectors] could not delete the calendar event:", err),
      );
    }
  }
}

/**
 * Tick or untick the Google Task a plan item became.
 *
 * SCOOP is the source of truth for its own plan; this keeps Google in step
 * instead of leaving a task open there for something already done here.
 */
export async function syncTaskStatus(
  userId: string,
  taskId: string | null | undefined,
  done: boolean,
): Promise<void> {
  if (!composioConfigured() || !taskId || taskId === "unknown") return;
  const account = await connectedAccount(userId, "googletasks").catch(() => null);
  if (!account) return;
  await setGoogleTaskStatus(userId, account.id, taskId, done).catch((err: unknown) =>
    console.error("[connectors] could not update the Google Task:", err),
  );
}
