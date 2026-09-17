import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, b as Navigate, f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { i as isItemType } from "./plan-BrPv_pMX.mjs";
import { a as useCurrentUserState, n as Wordmark, r as cn } from "./button-D08vmLm4.mjs";
import { o as ScanText, p as CalendarDays } from "../_libs/lucide-react.mjs";
import { t as AccountMenu } from "./type-badge-BroaxcjG.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
var TABS = [{
	to: "/capture",
	label: "Capture",
	icon: ScanText
}, {
	to: "/plan",
	label: "Plan",
	icon: CalendarDays
}];
function AppNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b-thick border-ink bg-paper/95 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/capture",
					className: "shrink-0",
					"aria-label": "SCOOP home",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { compact: true })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "ml-1 flex min-w-0 flex-1 items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex rounded-full border-thick border-ink bg-paper p-1 shadow-hard-sm",
						children: TABS.map((tab) => {
							const active = pathname === tab.to;
							const Icon = tab.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: tab.to,
								className: cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-display text-sm font-black sm:px-4", active ? "bg-yolk text-ink" : "text-ink hover:bg-paper-2"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									strokeWidth: 2.4
								}), tab.label]
							}, tab.to);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {})
			]
		})
	});
}
function ShellSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-40 border-b-thick border-ink bg-paper",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-6xl items-center gap-3 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { compact: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex rounded-full border-thick border-ink bg-paper p-1 shadow-hard-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex h-9 items-center px-3 font-display text-sm font-black",
						children: "Capture"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex h-9 items-center px-3 font-display text-sm font-black text-mute",
						children: "Plan"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 py-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-title font-black uppercase tracking-tight",
				children: "Dump the chaos."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-40 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" })]
		})]
	});
}
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellSkeleton, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-3xl px-4 py-6 sm:py-10",
			children
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
export { listPlanItems as a, deletePlanItem as i, addPlanItems as n, setPlanItemDone as o, createSsrRpc as r, AppShell as t };
