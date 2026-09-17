import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { i as isItemType } from "./plan-BrPv_pMX.mjs";
import { r as getSql } from "./db--9U1yA8U.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-items-qKSYG-ST.js
function toItem(row) {
	return {
		id: Number(row.id),
		type: isItemType(row.type) ? row.type : "task",
		title: row.title,
		date: row.date,
		time: row.time,
		location: row.location,
		notes: row.notes,
		done: row.done === true || row.done === "t" || row.done === 1 || row.done === "true",
		createdAt: row.created_at
	};
}
function cleanItem(input) {
	const title = (input.title ?? "").trim();
	if (!title) return null;
	return {
		type: isItemType(input.type) ? input.type : "task",
		title: title.slice(0, 140),
		date: input.date?.trim() || null,
		time: input.time?.trim() || null,
		location: input.location?.trim() || null,
		notes: input.notes?.trim() || null
	};
}
var listPlanItems_createServerFn_handler = createServerRpc({
	id: "541879be0e51bc31354110af03ffbe2c2ddba68362199b0c370ec4d84edd0fa4",
	name: "listPlanItems",
	filename: "src/lib/server/plan-items.ts"
}, (opts) => listPlanItems.__executeServer(opts));
var listPlanItems = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPlanItems_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, type, title, date, time, location, notes, done, created_at
      from plan_items
      where user_id = ${context.userId}
      order by date asc, time asc, id desc
    `).map(toItem);
});
var addPlanItems_createServerFn_handler = createServerRpc({
	id: "d2ae2933a666a3f0a28ece5166e45a333a03f820c485ef757a765b1cfdd2d74b",
	name: "addPlanItems",
	filename: "src/lib/server/plan-items.ts"
}, (opts) => addPlanItems.__executeServer(opts));
var addPlanItems = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const items = (input?.items ?? []).map(cleanItem).filter((x) => x !== null).slice(0, 12);
	if (!items.length) throw new Error("Nothing to add.");
	return { items };
}).handler(addPlanItems_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	for (const item of data.items) await sql`
        insert into plan_items (user_id, type, title, date, time, location, notes)
        values (
          ${context.userId},
          ${item.type},
          ${item.title},
          ${item.date},
          ${item.time},
          ${item.location},
          ${item.notes}
        )
      `;
	return { added: data.items.length };
});
var setPlanItemDone_createServerFn_handler = createServerRpc({
	id: "7fbb144dd9d68839339e4cfe8b2ba4d9cb4200dee1f14b6f54738dc92729c4b2",
	name: "setPlanItemDone",
	filename: "src/lib/server/plan-items.ts"
}, (opts) => setPlanItemDone.__executeServer(opts));
var setPlanItemDone = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	id: Number(input.id),
	done: Boolean(input.done)
})).handler(setPlanItemDone_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      update plan_items
      set done = ${data.done}
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
var deletePlanItem_createServerFn_handler = createServerRpc({
	id: "470537fd05a64e25d67c5bcc85a556c7a1c16bb58cd4e6fc40873277902a4260",
	name: "deletePlanItem",
	filename: "src/lib/server/plan-items.ts"
}, (opts) => deletePlanItem.__executeServer(opts));
var deletePlanItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: Number(input.id) })).handler(deletePlanItem_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      delete from plan_items
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
//#endregion
export { addPlanItems_createServerFn_handler, deletePlanItem_createServerFn_handler, listPlanItems_createServerFn_handler, setPlanItemDone_createServerFn_handler };
