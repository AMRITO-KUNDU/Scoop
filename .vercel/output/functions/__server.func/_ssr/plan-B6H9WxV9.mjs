import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as matchesFilter, r as formatWhen } from "./plan-BrPv_pMX.mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
import { _ as Check, c as MapPin, p as Download, r as Trash2, s as ScanText, v as CalendarPlus, y as CalendarDays } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./createSsrRpc-DpRQNsVg.mjs";
import { t as TypeBadge } from "./type-badge-MH2GOB59.mjs";
import { a as setPlanItemDone, i as listPlanItems, r as deletePlanItem, t as EmptyState } from "./plan-items-Ca55LKiy.mjs";
import { t as Button } from "./button-CpYBE5GC.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-B6H9WxV9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function pad(n) {
	return String(n).padStart(2, "0");
}
function compactDate(date) {
	return date.replaceAll("-", "");
}
function compactDateTime(date, time) {
	return `${compactDate(date)}T${time.replace(":", "")}00`;
}
function addDays(date, days) {
	const d = /* @__PURE__ */ new Date(`${date}T00:00:00`);
	d.setDate(d.getDate() + days);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addMinutes(date, time, minutes) {
	const [hours, mins] = time.split(":").map(Number);
	const d = /* @__PURE__ */ new Date(`${date}T${pad(hours)}:${pad(mins)}:00`);
	d.setMinutes(d.getMinutes() + minutes);
	return {
		date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
		time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
	};
}
function slug(title) {
	return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
}
function escapeIcs(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(";", "\\;").replaceAll(",", "\\,");
}
function googleCalendarUrl(item) {
	if (!item.date) return null;
	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: item.title
	});
	if (item.time) {
		const end = addMinutes(item.date, item.time, 60);
		params.set("dates", `${compactDateTime(item.date, item.time)}/${compactDateTime(end.date, end.time)}`);
	} else params.set("dates", `${compactDate(item.date)}/${compactDate(addDays(item.date, 1))}`);
	if (item.location) params.set("location", item.location);
	const details = [item.notes, `From SCOOP · ${item.type}`].filter(Boolean).join("\n");
	if (details) params.set("details", details);
	return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function toIcs(item, now = /* @__PURE__ */ new Date()) {
	if (!item.date) return null;
	const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//SCOOP//School Life//EN",
		"CALSCALE:GREGORIAN",
		"BEGIN:VEVENT",
		`UID:scoop-${compactDate(item.date)}-${slug(item.title)}@scoop.app`,
		`DTSTAMP:${stamp}`
	];
	if (item.time) {
		const end = addMinutes(item.date, item.time, 60);
		lines.push(`DTSTART:${compactDateTime(item.date, item.time)}`);
		lines.push(`DTEND:${compactDateTime(end.date, end.time)}`);
	} else {
		lines.push(`DTSTART;VALUE=DATE:${compactDate(item.date)}`);
		lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(item.date, 1))}`);
	}
	lines.push(`SUMMARY:${escapeIcs(item.title)}`);
	if (item.location) lines.push(`LOCATION:${escapeIcs(item.location)}`);
	if (item.notes) lines.push(`DESCRIPTION:${escapeIcs(item.notes)}`);
	lines.push("END:VEVENT", "END:VCALENDAR");
	return `${lines.join("\r\n")}\r\n`;
}
function downloadIcs(item) {
	const ics = toIcs(item);
	if (!ics || typeof document === "undefined") return false;
	const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${slug(item.title)}.ics`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
	return true;
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
					children: "What’s on — today, this week, or everything. Push dated items to Google Calendar."
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
						className: "flex flex-wrap gap-2 sm:w-40 sm:flex-col sm:flex-nowrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void toggleDone(item),
								className: cn("inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink px-3 font-display text-sm font-bold sm:flex-none", item.done ? "bg-yolk" : "bg-paper hover:bg-paper-2"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "size-4",
									strokeWidth: 2.6
								}), item.done ? "Done" : "Mark done"]
							}),
							item.date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: googleCalendarUrl(item) ?? void 0,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink bg-cyan px-3 font-display text-sm font-bold hover:bg-yolk sm:flex-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {
									className: "size-4",
									strokeWidth: 2.4
								}), "Google"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									if (downloadIcs(item)) toast.success("Calendar file saved.");
									else toast.error("Couldn’t export that item.");
								},
								className: "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink bg-paper px-3 font-display text-sm font-bold hover:bg-paper-2 sm:flex-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									className: "size-4",
									strokeWidth: 2.4
								}), ".ics"]
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void remove(item),
								className: "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink bg-paper px-3 font-display text-sm font-bold hover:bg-hot hover:text-paper sm:flex-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "size-4",
									strokeWidth: 2.4
								}), "Delete"]
							})
						]
					})]
				})
			}, item.id))
		})
	] });
}
//#endregion
export { PlanPage as component };
