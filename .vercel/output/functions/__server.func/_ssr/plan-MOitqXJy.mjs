import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as matchesFilter, r as formatWhen } from "./plan-BrPv_pMX.mjs";
import { r as cn, t as Button } from "./button-D08vmLm4.mjs";
import { f as Check, n as Trash2, o as ScanText, p as CalendarDays, s as MapPin } from "../_libs/lucide-react.mjs";
import { n as TypeBadge } from "./type-badge-BroaxcjG.mjs";
import { a as listPlanItems, i as deletePlanItem, o as setPlanItemDone, t as AppShell } from "./plan-items-92B6AQLV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-MOitqXJy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
var FILTERS = [
	{
		id: "today",
		label: "Today"
	},
	{
		id: "week",
		label: "This Week"
	},
	{
		id: "all",
		label: "All"
	}
];
function PlanPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanScreen, {}) });
}
function PlanScreen() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [filter, setFilter] = (0, import_react.useState)("all");
	async function reload() {
		try {
			const rows = await listPlanItems();
			setItems(rows);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not load plan.";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		reload();
	}, []);
	const visible = (0, import_react.useMemo)(() => items.filter((item) => matchesFilter(item, filter)), [items, filter]);
	async function toggleDone(item) {
		const next = !item.done;
		setItems((prev) => prev.map((row) => row.id === item.id ? {
			...row,
			done: next
		} : row));
		try {
			await setPlanItemDone({ data: {
				id: item.id,
				done: next
			} });
		} catch {
			setItems((prev) => prev.map((row) => row.id === item.id ? {
				...row,
				done: item.done
			} : row));
			toast.error("Couldn’t update that item.");
		}
	}
	async function remove(item) {
		const snapshot = items;
		setItems((prev) => prev.filter((row) => row.id !== item.id));
		try {
			await deletePlanItem({ data: { id: item.id } });
		} catch {
			setItems(snapshot);
			toast.error("Couldn’t delete that item.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper",
					children: "Plan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-title font-black uppercase tracking-tight",
					children: "Your plan."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm font-medium text-mute",
					children: "What’s on — today, this week, or everything."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 inline-flex rounded-full border-thick border-ink bg-paper p-1 shadow-hard-sm",
			children: FILTERS.map((f) => {
				const on = filter === f.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(f.id),
					className: cn("h-10 rounded-full px-4 font-display text-sm font-black", on ? "bg-cyan text-ink" : "text-ink hover:bg-paper-2"),
					children: f.label
				}, f.id);
			})
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" })]
		}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
					className: "size-6",
					strokeWidth: 2.4
				}),
				title: items.length ? "Nothing in this view" : "Your plan is empty",
				body: items.length ? "Try another filter, or capture a new message." : "Dump a school message and add the bits that matter.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "yolk",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/capture",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanText, {
							className: "size-4",
							strokeWidth: 2.4
						}), "Go to Capture"]
					})
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "panel p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeBadge, { type: item.type }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: cn("mt-2 font-display text-lg font-bold tracking-tight", item.done && "text-mute line-through"),
								children: item.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-medium text-mute tabular-nums",
								children: formatWhen(item)
							}),
							item.location ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1.5 text-sm text-mute",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 shrink-0" }), item.location]
							}) : null,
							item.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-ink",
								children: item.notes
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 sm:flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void toggleDone(item),
							className: cn("inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink px-3 font-display text-sm font-bold sm:flex-none", item.done ? "bg-yolk" : "bg-paper hover:bg-paper-2"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-4",
								strokeWidth: 2.6
							}), item.done ? "Done" : "Mark done"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void remove(item),
							className: "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink bg-paper px-3 font-display text-sm font-bold hover:bg-hot hover:text-paper sm:flex-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-4",
								strokeWidth: 2.4
							}), "Delete"]
						})]
					})]
				})
			}, item.id))
		})
	] });
}
//#endregion
export { PlanPage as component };
