import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isItemType, type ExtractedItem, type ItemType, type PlanItem } from "@/lib/plan";

type Row = {
  id: number;
  type: string;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  notes: string | null;
  done: boolean | number | string;
  created_at: string;
};

export function isValidCalendarDate(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

export function isValidTimeStr(timeStr: string | null | undefined): boolean {
  if (!timeStr || typeof timeStr !== "string") return false;
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function toItem(row: Row): PlanItem {
  return {
    id: Number(row.id),
    type: (isItemType(row.type) ? row.type : "task") as ItemType,
    title: row.title,
    date: isValidCalendarDate(row.date) ? row.date : null,
    time: isValidTimeStr(row.time) ? row.time : null,
    location: row.location,
    notes: row.notes,
    done: row.done === true || row.done === "t" || row.done === 1 || row.done === "true",
    createdAt: row.created_at,
  };
}

function cleanItem(input: ExtractedItem): ExtractedItem | null {
  if (!input || typeof input !== "object") return null;
  const title = (input.title ?? "").trim();
  if (!title) return null;
  const type = isItemType(input.type) ? input.type : "task";
  const dateRaw = input.date?.trim() || null;
  const timeRaw = input.time?.trim() || null;

  return {
    type,
    title: title.slice(0, 140),
    date: isValidCalendarDate(dateRaw) ? dateRaw : null,
    time: isValidTimeStr(timeRaw) ? timeRaw : null,
    location: input.location?.trim() ? input.location.trim().slice(0, 160) : null,
    notes: input.notes?.trim() ? input.notes.trim().slice(0, 280) : null,
  };
}

function normalizeText(text: string | null): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]]/g, "")
    .trim();
}

export function stringsSimilar(a: string | null, b: string | null, threshold = 0.85): boolean {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return false;

  if (normA === normB) return true;

  const wordsA = normA.split(/\s+/);
  const wordsB = normB.split(/\s+/);

  const common = new Set(wordsA.filter((w) => wordsB.includes(w)));
  const total = new Set([...wordsA, ...wordsB]);

  return total.size > 0 && common.size / total.size >= threshold;
}

export function isDuplicateItem(existing: ExtractedItem, incoming: ExtractedItem): boolean {
  if (existing.type !== incoming.type) return false;
  if (existing.date !== incoming.date) return false;
  if (existing.time !== incoming.time) return false;
  if (existing.location !== incoming.location) return false;

  // Title similarity is required for duplicate detection
  return stringsSimilar(existing.title, incoming.title);
}

export const listPlanItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.userId) throw new Error("Unauthorized");
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, type, title, date, time, location, notes, done, created_at
      from plan_items
      where user_id = ${context.userId}
      order by date asc, time asc, id desc
    `;
    return rows.map(toItem);
  });

export const addPlanItems = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { items: ExtractedItem[] }) => {
    if (!input || typeof input !== "object" || !Array.isArray(input.items)) {
      throw new Error("Invalid payload: items array is required.");
    }
    if (input.items.length > 12) {
      throw new Error("Maximum of 12 items can be added at once.");
    }

    const items = input.items
      .map(cleanItem)
      .filter((x): x is ExtractedItem => x !== null);

    if (!items.length) throw new Error("Nothing to add.");
    return { items };
  })
  .handler(async ({ context, data }) => {
    if (!context.userId) throw new Error("Unauthorized");
    const sql = await getSql();
    const userId = context.userId;

    const existingItems = await sql<Row>`
      select id, type, title, date, time, location, notes
      from plan_items
      where user_id = ${userId}
    `;

    const processedExisting: ExtractedItem[] = existingItems.map((row) => ({
      type: (isItemType(row.type) ? row.type : "task") as ItemType,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      notes: row.notes,
    }));

    let addedCount = 0;
    const batchAdded: ExtractedItem[] = [];

    for (const item of data.items) {
      const isDuplicateInDb = processedExisting.some((existing) => isDuplicateItem(existing, item));
      const isDuplicateInBatch = batchAdded.some((added) => isDuplicateItem(added, item));

      if (!isDuplicateInDb && !isDuplicateInBatch) {
        await sql`
          insert into plan_items (user_id, type, title, date, time, location, notes)
          values (
            ${userId},
            ${item.type},
            ${item.title},
            ${item.date},
            ${item.time},
            ${item.location},
            ${item.notes}
          )
        `;
        addedCount++;
        batchAdded.push(item);
      }
    }
    return { added: addedCount };
  });

export const setPlanItemDone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; done: boolean }) => {
    if (!input || typeof input !== "object") throw new Error("Invalid payload.");
    const id = Number(input.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid item ID.");
    if (typeof input.done !== "boolean") throw new Error("'done' must be a boolean value.");
    return { id, done: input.done };
  })
  .handler(async ({ context, data }) => {
    if (!context.userId) throw new Error("Unauthorized");
    const sql = await getSql();
    const result = await sql<{ id: number }>`
      update plan_items
      set done = ${data.done}
      where id = ${data.id} and user_id = ${context.userId}
      returning id
    `;
    if (!result.length) {
      throw new Error("Item not found or access denied.");
    }
    return { ok: true as const };
  });

export const deletePlanItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => {
    if (!input || typeof input !== "object") throw new Error("Invalid payload.");
    const id = Number(input.id);
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid item ID.");
    return { id };
  })
  .handler(async ({ context, data }) => {
    if (!context.userId) throw new Error("Unauthorized");
    const sql = await getSql();
    const result = await sql<{ id: number }>`
      delete from plan_items
      where id = ${data.id} and user_id = ${context.userId}
      returning id
    `;
    if (!result.length) {
      throw new Error("Item not found or access denied.");
    }
    return { ok: true as const };
  });

