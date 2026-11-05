import type { Sql } from "@/lib/db";
import { getSql } from "@/lib/db";

/**
 * A spend guard for the one endpoint that costs money per call.
 *
 * Counted per user in fixed hourly windows. Not a security boundary — Clerk
 * already decides who you are — but it is the difference between a bad afternoon
 * and a bad invoice when an account decides to hammer extraction.
 */

/** How many extractions one account may run in an hour. */
export const EXTRACT_HOURLY_LIMIT = 40;

export class RateLimitError extends Error {
  /** Read by the JSON API layer, which answers 429 instead of 400. */
  readonly status = 429;
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export type BudgetResult = {
  allowed: boolean;
  used: number;
  /** Minutes until the current window rolls over. */
  retryAfterMinutes: number;
};

/**
 * Count one use of `bucket` in the current hour and say whether it is still
 * within `limit`.
 *
 * One atomic upsert rather than read-then-write, so two requests arriving
 * together cannot both see "39 used" and both proceed. A burst at 10:59 and
 * another at 11:00 land in different windows; for a spend guard that is fine,
 * and it keeps the query portable across Neon and PGlite.
 */
export async function consumeHourlyBudget(
  sql: Sql,
  bucket: string,
  limit: number,
): Promise<BudgetResult> {
  const rows = await sql<{ count: number; window_start: string | Date }>`
    insert into rate_limits (bucket, window_start, count)
    values (${bucket}, date_trunc('hour', now()), 1)
    on conflict (bucket, window_start)
      do update set count = rate_limits.count + 1
    returning count, window_start
  `;

  const row = rows[0];
  const used = Number(row?.count ?? 1);
  const windowStart = row ? new Date(row.window_start).getTime() : Date.now();
  const retryAfterMinutes = Math.max(
    1,
    Math.ceil((windowStart + 60 * 60 * 1000 - Date.now()) / 60_000),
  );

  return { allowed: used <= limit, used, retryAfterMinutes };
}

/**
 * Claim one extraction for this user, or throw `RateLimitError`.
 *
 * Called before the AI call, so a request that would spend money is refused
 * before it spends any.
 */
export async function claimExtraction(userId: string): Promise<void> {
  const sql = await getSql();
  const { allowed, retryAfterMinutes } = await consumeHourlyBudget(
    sql,
    `extract:${userId}`,
    EXTRACT_HOURLY_LIMIT,
  );

  if (!allowed) {
    throw new RateLimitError(
      `That's a lot of messages in one hour. Try again in about ${retryAfterMinutes} minute${
        retryAfterMinutes === 1 ? "" : "s"
      }.`,
    );
  }
}
