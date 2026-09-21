import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  isItemType,
  type ExtractedItem,
  type ItemType,
  type PlanItem,
} from "@/lib/plan";

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

function toItem(row: Row): PlanItem {
  return {
    id: Number(row.id),
    type: (isItemType(row.type) ? row.type : "task") as ItemType,
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    notes: row.notes,
    done: row.done === true || row.done === "t" || row.done === 1 || row.done === "true",
    createdAt: row.created_at,
  };
}

function cleanItem(input: ExtractedItem): ExtractedItem | null {
  const title = (input.title ?? "").trim();
  if (!title) return null;
  const type = isItemType(input.type) ? input.type : "task";
  return {
    type,
    title: title.slice(0, 140),
    date: input.date?.trim() || null,
    time: input.time?.trim() || null,
    location: input.location?.trim() || null,
    notes: input.notes?.trim() || null,
  };
}

function normalizeText(text: string | null): string {
  if (!text) return "";
  return text.toLowerCase().replace(/[.,!?;:'"\(\)\[\]]/g, "").trim();
}

function stringsSimilar(a: string | null, b: string | null, threshold = 0.85): boolean {
  if (!a || !b) return a === b;
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  
  if (normA === normB) return true;
  
  const wordsA = normA.split(/\s+/);
  const wordsB = normB.split(/\s+/);
  
  const common = new Set(wordsA.filter(w => wordsB.includes(w)));
  const total = new Set([...wordsA, ...wordsB]);
  
  return common.size / total.size >= threshold;
}

export const listPlanItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
    const items = (input?.items ?? [])
      .map(cleanItem)
      .filter((x): x is ExtractedItem => x !== null)
      .slice(0, 12);
    if (!items.length) throw new Error("Nothing to add.");
    return { items };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const userId = context.userId;
    
    const existingItems = await sql<Row[]>`
      select id, type, title, date, time, location, notes
      from plan_items
      where user_id = ${userId}
    `;
    
    let addedCount = 0;
    for (const item of data.items) {
      const isDuplicate = existingItems.some(existing => {
        if (existing.type !== item.type) return false;
        if (existing.date !== item.date) return false;
        if (existing.time !== item.time) return false;
        if (existing.location !== item.location) return false;
        
        if (stringsSimilar(existing.title, item.title)) {
          return true;
        }
        
        if (stringsSimilar(existing.notes, item.notes)) {
          return true;
        }
        
        return false;
      });
      
      if (!isDuplicate) {
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
      }
    }
    return { added: addedCount };
  });

export const setPlanItemDone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; done: boolean }) => ({
    id: Number(input.id),
    done: Boolean(input.done),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update plan_items
      set done = ${data.done}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deletePlanItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => ({ id: Number(input.id) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      delete from plan_items
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });
