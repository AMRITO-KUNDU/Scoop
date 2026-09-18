import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { i as isItemType } from "./plan-BrPv_pMX.mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
import { n as createSsrRpc } from "./createSsrRpc-DpRQNsVg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-items-Ca55LKiy.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ icon, title, body, action, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center px-6 py-12 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid size-16 place-items-center rounded-full border-thick border-ink bg-yolk shadow-hard-sm",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl font-black tracking-tight uppercase",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm leading-relaxed text-mute",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: action
			}) : null
		]
	});
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
var listPlanItems = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("541879be0e51bc31354110af03ffbe2c2ddba68362199b0c370ec4d84edd0fa4"));
var addPlanItems = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const items = (input?.items ?? []).map(cleanItem).filter((x) => x !== null).slice(0, 12);
	if (!items.length) throw new Error("Nothing to add.");
	return { items };
}).handler(createSsrRpc("d2ae2933a666a3f0a28ece5166e45a333a03f820c485ef757a765b1cfdd2d74b"));
var setPlanItemDone = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	id: Number(input.id),
	done: Boolean(input.done)
})).handler(createSsrRpc("7fbb144dd9d68839339e4cfe8b2ba4d9cb4200dee1f14b6f54738dc92729c4b2"));
var deletePlanItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ id: Number(input.id) })).handler(createSsrRpc("470537fd05a64e25d67c5bcc85a556c7a1c16bb58cd4e6fc40873277902a4260"));
//#endregion
export { setPlanItemDone as a, listPlanItems as i, addPlanItems as n, deletePlanItem as r, EmptyState as t };
