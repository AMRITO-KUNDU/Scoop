import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { n as TYPE_META, t as ITEM_TYPES } from "./plan-BrPv_pMX.mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
import { C as ArrowRight, c as MapPin, d as LoaderCircle, i as Sparkles, r as Trash2 } from "../_libs/lucide-react.mjs";
import { n as createSsrRpc, t as AppShell } from "./createSsrRpc-DpRQNsVg.mjs";
import { n as Label, t as Input } from "./label-PsRqwIh2.mjs";
import { r as Textarea, t as EXAMPLE_CHIPS } from "./examples-JdvpsOiJ.mjs";
import { t as TypeBadge } from "./type-badge-MH2GOB59.mjs";
import { n as addPlanItems, t as EmptyState } from "./plan-items-Ca55LKiy.mjs";
import { t as Button } from "./button-CpYBE5GC.mjs";
import { t as getIntegrationsStatus } from "./integrations-CV35u5jW.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/capture-O4bv3KWq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TONE_ACTIVE = {
	event: "bg-grape text-paper",
	deadline: "bg-hot text-paper",
	task: "bg-yolk text-ink",
	rsvp: "bg-cyan text-ink"
};
function DraftCard({ item, onChange, onRemove }) {
	const set = (key, value) => onChange({
		...item,
		[key]: value
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "panel p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeBadge, { type: item.type }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onRemove,
					className: "grid size-11 place-items-center rounded-xl border-thick border-ink bg-paper hover:bg-hot hover:text-paper",
					"aria-label": "Remove item",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
						className: "size-4",
						strokeWidth: 2.4
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-1.5",
				children: ITEM_TYPES.map((type) => {
					const active = item.type === type;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => set("type", type),
						className: cn("h-10 rounded-full border-thick border-ink px-3 font-display text-xs font-black uppercase tracking-wide", active ? TONE_ACTIVE[type] : "bg-paper text-ink hover:bg-paper-2"),
						children: TYPE_META[type].label
					}, type);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `title-${item.key}`,
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `title-${item.key}`,
							value: item.title,
							onChange: (e) => set("title", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `date-${item.key}`,
								children: "Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `date-${item.key}`,
								type: "date",
								value: item.date ?? "",
								onChange: (e) => set("date", e.target.value || null)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `time-${item.key}`,
								children: "Time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `time-${item.key}`,
								type: "time",
								value: item.time ?? "",
								onChange: (e) => set("time", e.target.value || null)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `loc-${item.key}`,
							children: "Location"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `loc-${item.key}`,
								className: "pl-9",
								value: item.location ?? "",
								onChange: (e) => set("location", e.target.value || null),
								placeholder: "Optional"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `notes-${item.key}`,
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: `notes-${item.key}`,
							rows: 2,
							value: item.notes ?? "",
							onChange: (e) => set("notes", e.target.value || null),
							placeholder: "Optional"
						})]
					})
				]
			})
		]
	});
}
var extractItems = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const text = (input?.text ?? "").trim();
	if (text.length < 8) throw new Error("Paste a bit more text first.");
	if (text.length > 6e3) throw new Error("That's too long — try a shorter excerpt.");
	return { text: text.slice(0, 6e3) };
}).handler(createSsrRpc("78f7a18ba111d88ad19628e64f106f8887fc5d87366aa23e066488a3e3b0fd28"));
function newKey() {
	return crypto.randomUUID();
}
function engineLabel(engine) {
	if (engine === "groq") return "Extracted with Groq";
	if (engine === "grok") return "Extracted with Grok";
	if (engine === "local") return "Extracted on-device";
	return "Review";
}
function CapturePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptureScreen, {}) });
}
function CaptureScreen() {
	const navigate = useNavigate();
	const [text, setText] = (0, import_react.useState)("");
	const [activeChip, setActiveChip] = (0, import_react.useState)(null);
	const [extracting, setExtracting] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [drafts, setDrafts] = (0, import_react.useState)(null);
	const [engine, setEngine] = (0, import_react.useState)(null);
	const [liveEngine, setLiveEngine] = (0, import_react.useState)("local");
	const canExtract = text.trim().length >= 8 && !extracting;
	const showEmpty = !extracting && drafts === null && text.trim().length === 0;
	(0, import_react.useEffect)(() => {
		let alive = true;
		getIntegrationsStatus().then((status) => {
			if (!alive) return;
			if (status.groq.wired) setLiveEngine("groq");
			else if (status.grok.wired) setLiveEngine("grok");
			else setLiveEngine("local");
		}).catch(() => {});
		return () => {
			alive = false;
		};
	}, []);
	async function onExtract() {
		if (!canExtract) return;
		setExtracting(true);
		setDrafts(null);
		setEngine(null);
		try {
			const result = await extractItems({ data: { text } });
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			if (!result.items.length) {
				toast.error("Nothing to pull from that message.");
				setDrafts([]);
				return;
			}
			setEngine(result.engine);
			setDrafts(result.items.map((item) => ({
				...item,
				key: newKey()
			})));
		} catch (err) {
			const message = err instanceof Error ? err.message : "Extract failed.";
			if (message === "Unauthorized") {
				await navigate({ to: "/login" });
				return;
			}
			toast.error(message);
		} finally {
			setExtracting(false);
		}
	}
	async function onAddToPlan() {
		if (!drafts?.length) return;
		setSaving(true);
		try {
			await addPlanItems({ data: { items: drafts.map(({ key: _key, ...item }) => item) } });
			toast.success("Added to your plan.");
			await navigate({ to: "/plan" });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not add items.";
			toast.error(message);
		} finally {
			setSaving(false);
		}
	}
	const readingCopy = liveEngine === "groq" ? "Groq is reading this." : liveEngine === "grok" ? "Grok is reading this." : "Pulling out the dates.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sticker inline-flex rounded-full bg-cyan px-3 py-1 text-xs",
					children: "Capture"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-title font-black uppercase tracking-tight",
					children: "Dump the chaos."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-lg text-sm font-medium text-mute",
					children: "Paste a school email, WhatsApp, newsletter or flyer. We’ll make the plan."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: text,
				onChange: (e) => {
					setText(e.target.value);
					setActiveChip(null);
				},
				rows: 9,
				placeholder: "Paste any school email, WhatsApp message, newsletter or flyer text…",
				className: "min-h-48 rounded-none border-0 shadow-none focus:shadow-none sm:min-h-56 sm:text-base"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: EXAMPLE_CHIPS.map((chip) => {
				const on = activeChip === chip.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setText(chip.text);
						setActiveChip(chip.id);
						setDrafts(null);
						setEngine(null);
					},
					className: cn("h-11 rounded-full border-thick border-ink px-3.5 font-display text-sm font-bold shadow-hard-sm", on ? "bg-yolk" : "bg-paper hover:bg-paper-2"),
					children: chip.label
				}, chip.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-5 w-full sm:w-auto sm:min-w-56",
			size: "lg",
			disabled: !canExtract,
			onClick: () => void onExtract(),
			children: extracting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" }), "Making a plan…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Extract", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
				className: "size-5",
				strokeWidth: 2.6
			})] })
		}),
		showEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "size-6",
						strokeWidth: 2.4
					}),
					title: "Nothing pasted yet",
					body: "Drop in a messy school email or tap a chip above. We’ll pull out events, deadlines, tasks and RSVPs."
				})
			})
		}) : null,
		extracting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-10",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel rotate-1 bg-yolk p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-10 animate-spin" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-display text-2xl font-black uppercase tracking-tight",
						children: "Making a plan…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-medium",
						children: readingCopy
					})
				]
			})
		}) : null,
		drafts ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper",
						children: engineLabel(engine)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-2xl font-black uppercase tracking-tight",
						children: drafts.length ? "We made a plan!" : "No items found"
					}),
					drafts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm font-medium text-mute",
						children: [
							drafts.length,
							" item",
							drafts.length === 1 ? "" : "s",
							" — tweak anything before it goes in."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-medium text-mute",
						children: "Try another excerpt, or tap a chip for a working example."
					})
				] }),
				drafts.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraftCard, {
					item,
					onChange: (next) => setDrafts((prev) => prev ? prev.map((d) => d.key === item.key ? next : d) : prev),
					onRemove: () => setDrafts((prev) => prev ? prev.filter((d) => d.key !== item.key) : prev)
				}, item.key)),
				drafts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ink",
					size: "lg",
					className: "w-full",
					disabled: saving,
					onClick: () => void onAddToPlan(),
					children: saving ? "Adding…" : "Looks Good – Add to Plan"
				}) : null
			]
		}) : null
	] });
}
//#endregion
export { CapturePage as component };
