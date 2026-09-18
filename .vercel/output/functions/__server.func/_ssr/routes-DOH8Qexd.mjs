import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Navigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatWhen } from "./plan-BrPv_pMX.mjs";
import { r as signIn } from "./client-B40BzJxt.mjs";
import { i as useCurrentUserState, n as cn, t as Wordmark } from "./logo-ZkcmHUEu.mjs";
import { C as ArrowRight, S as Bell, a as Smartphone, b as CalendarCheck, g as ClipboardPaste, i as Sparkles, l as Mail, o as Share2, s as ScanText } from "../_libs/lucide-react.mjs";
import { t as AccountMenu } from "./account-menu-B7ciS4Nw.mjs";
import { n as LANDING_CHIPS, r as Textarea, t as EXAMPLE_CHIPS } from "./examples-JdvpsOiJ.mjs";
import { t as TypeBadge } from "./type-badge-MH2GOB59.mjs";
import { t as Button } from "./button-CpYBE5GC.mjs";
import { t as localExtract } from "./local-extract-BIP-eJa6.mjs";
import { t as GoogleMark } from "./brand-marks-Dz1k8vWj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DOH8Qexd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEMO_CHIPS = LANDING_CHIPS.length ? LANDING_CHIPS : EXAMPLE_CHIPS.slice(0, 4);
function LandingPreview() {
	const [text, setText] = (0, import_react.useState)(DEMO_CHIPS[0]?.text ?? "");
	const [active, setActive] = (0, import_react.useState)(DEMO_CHIPS[0]?.id ?? null);
	const [sorted, setSorted] = (0, import_react.useState)(false);
	const items = (0, import_react.useMemo)(() => localExtract(text).slice(0, 4), [text]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto w-full max-w-md px-2 pt-3 lg:max-w-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticker absolute top-0 left-3 z-10 rotate-[-8deg] rounded-full bg-hot px-3 py-1 text-xs text-paper",
			children: "Live demo"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel overflow-hidden bg-paper",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b-thick border-ink bg-yolk px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm font-black uppercase tracking-wide",
					children: "Dump the chaos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full border-thick border-ink bg-paper px-2.5 py-0.5 text-xs font-black uppercase tracking-wide",
					children: "Ready"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: text,
						onChange: (e) => {
							setText(e.target.value);
							setActive(null);
							setSorted(false);
						},
						rows: 5,
						placeholder: "Paste any school email, WhatsApp message, newsletter or flyer text…",
						className: "min-h-28 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: DEMO_CHIPS.map((chip) => {
							const on = active === chip.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setText(chip.text);
									setActive(chip.id);
									setSorted(false);
								},
								className: cn("h-10 rounded-full border-thick border-ink px-3 font-display text-sm font-bold shadow-hard-sm", on ? "bg-yolk" : "bg-paper hover:bg-paper-2"),
								children: chip.label
							}, chip.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						size: "lg",
						disabled: text.trim().length < 8,
						onClick: () => setSorted(true),
						children: ["Sort it for me", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
							className: "size-5",
							strokeWidth: 2.6
						})]
					}),
					sorted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 border-t-thick border-ink pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs font-black uppercase tracking-widest text-mute",
								children: "We made a plan!"
							}),
							items.length ? items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border-thick border-ink bg-paper-2 p-3 shadow-hard-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeBadge, { type: item.type }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-display text-base font-bold leading-snug tracking-tight",
										children: item.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-mute",
										children: [formatWhen(item), item.location ? ` · ${item.location}` : ""]
									})
								]
							}, `${item.type}-${item.title}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-mute",
								children: "Nothing to pull from that one — try a chip."
							}),
							items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ink",
								className: "w-full",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/signup",
									children: ["Looks Good — save my plan", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										className: "size-4",
										strokeWidth: 2.4
									})]
								})
							}) : null
						]
					}) : null
				]
			})]
		})]
	});
}
var STEPS = [
	{
		num: "01",
		title: "Dump the chaos",
		body: "Paste a WhatsApp message, forward a school email, or type what’s in your head.",
		tone: "bg-cyan",
		tilt: "-rotate-1"
	},
	{
		num: "02",
		title: "AI makes sense of it",
		body: "Groq (or Grok) pulls out events, deadlines, tasks and RSVPs you can edit.",
		tone: "bg-hot text-paper",
		tilt: "rotate-1"
	},
	{
		num: "03",
		title: "Your family gets the plan",
		body: "One tap to confirm. Into your plan — or straight into Google Calendar.",
		tone: "bg-grape text-paper",
		tilt: "-rotate-1"
	}
];
var FEATURES = [
	{
		icon: Mail,
		title: "School emails",
		tone: "bg-cyan"
	},
	{
		icon: CalendarCheck,
		title: "Events & deadlines",
		tone: "bg-hot text-paper"
	},
	{
		icon: Bell,
		title: "RSVPs & slips",
		tone: "bg-yolk"
	},
	{
		icon: ClipboardPaste,
		title: "WhatsApp chaos",
		tone: "bg-grape text-paper"
	},
	{
		icon: Smartphone,
		title: "Phone-first",
		tone: "bg-cyan"
	},
	{
		icon: Share2,
		title: "Share the load",
		tone: "bg-hot text-paper"
	}
];
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/capture" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, { pending: isPending });
}
function Landing({ pending = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-40 border-b-thick border-ink bg-paper/95 backdrop-blur-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					"aria-label": "SCOOP",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
				}), pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-24 animate-pulse rounded-xl border-thick border-ink bg-paper-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative border-b-thick border-ink",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dot-shape absolute top-10 right-8 hidden size-8 bg-hot sm:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sq-shape absolute bottom-16 left-6 hidden size-7 rotate-12 bg-cyan md:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dot-shape absolute top-1/2 right-1/4 hidden size-4 bg-yolk lg:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-6xl items-start gap-12 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "sticker mb-5 inline-flex items-center rounded-full bg-paper px-3 py-1 text-xs",
								children: "The family admin app"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display text-display font-black uppercase leading-[0.9] tracking-tight",
								children: [
									"Stop",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"sweating the",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-grape",
										children: "school stuff."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-md text-lead font-medium",
								children: "SCOOP turns school letters, party invites and WhatsApp chaos into a calm family plan — in seconds."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-col gap-3 sm:max-w-md",
								children: [!pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "lg",
									variant: "yolk",
									className: "w-full",
									onClick: () => {
										signIn("grok-google", { callbackURL: "/capture" });
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, { className: "size-5" }), "Continue with Google"]
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-3 sm:flex-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "lg",
										variant: "ink",
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/signup",
											children: "Start with email"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "lg",
										variant: "paper",
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/login",
											children: "Sign in"
										})
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-medium text-mute",
								children: "Real Google accounts. Not a mock login."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingPreview, {})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b-thick border-ink bg-hot px-4 py-12 sm:py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sticker mb-8 inline-flex rounded-full bg-yolk px-3 py-1 text-xs text-ink",
						children: "How it works"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `panel ${step.tone} ${step.tilt} p-5`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xs font-black tracking-widest uppercase opacity-80",
									children: step.num
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl font-black tracking-tight uppercase",
									children: step.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm font-medium leading-relaxed",
									children: step.body
								})
							]
						}, step.title))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b-thick border-ink px-4 py-12 sm:py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-title font-black uppercase tracking-tight",
						children: "Built for the school run brain."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3",
						children: FEATURES.map((feature) => {
							const Icon = feature.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 rounded-xl border-thick border-ink bg-paper p-3 shadow-hard-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `grid size-11 shrink-0 place-items-center rounded-full border-thick border-ink ${feature.tone}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-5",
										strokeWidth: 2.4
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-sm font-bold leading-snug",
									children: feature.title
								})]
							}, feature.title);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b-thick border-ink bg-grape px-4 py-14 text-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-title font-black uppercase tracking-tight",
							children: [
								"Stop carrying it",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"alone."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-md text-sm font-medium text-paper/85",
							children: "Sign in with Google, paste the next school email, and keep the plan in one place."
						}),
						!pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							variant: "yolk",
							className: "mt-8",
							onClick: () => {
								signIn("grok-google", { callbackURL: "/capture" });
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, { className: "size-5" }), "Continue with Google"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "yolk",
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/signup",
								children: ["Start your SCOOP", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanText, {
									className: "size-5",
									strokeWidth: 2.4
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs font-bold uppercase tracking-widest text-paper/70",
							children: "No credit card. Works on your phone."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-black uppercase tracking-tight",
					children: "Paste the chaos. Get the plan."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wider text-mute",
					children: "Welcome letters · clubs · bus times · supplies · trips"
				})]
			})
		] })]
	});
}
//#endregion
export { Home as component };
