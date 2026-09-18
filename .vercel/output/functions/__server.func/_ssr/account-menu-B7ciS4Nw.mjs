import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { i as useCurrentUserState, n as cn, r as useCurrentUser } from "./logo-ZkcmHUEu.mjs";
import { a as hasGateSessionMarker } from "./server-DdkeDpYW.mjs";
import { u as LogOut, x as Cable } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-menu-B7ciS4Nw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
function Avatar({ name, src }) {
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		className: "size-9 rounded-full border-thick border-ink object-cover"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-9 place-items-center rounded-full border-thick border-ink bg-grape font-display text-sm font-black text-paper",
		children: name.charAt(0).toUpperCase()
	});
}
function AccountMenu() {
	const { user, isPending } = useCurrentUserState();
	const liveUser = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-24 animate-pulse rounded-full border-thick border-ink bg-paper-2 sm:w-28" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			className: "hidden h-10 items-center rounded-full border-thick border-ink bg-paper px-3 font-display text-sm font-bold shadow-hard-sm sm:inline-flex",
			children: "Sign in"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/signup",
			className: cn("chunky inline-flex h-10 items-center rounded-full bg-yolk px-3 font-display text-sm font-bold"),
			children: "Sign up"
		})]
	});
	const label = liveUser?.displayName ?? liveUser?.primaryEmail ?? "Account";
	const showSignOut = !gateSession;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/connect",
				className: "inline-flex size-10 items-center justify-center rounded-full border-thick border-ink bg-paper shadow-hard-sm hover:bg-yolk",
				"aria-label": "Connect services",
				title: "Connect",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cable, {
					className: "size-4",
					strokeWidth: 2.4
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				name: label,
				src: liveUser?.profileImageUrl ?? null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden max-w-28 truncate font-display text-sm font-bold lg:inline",
				children: label
			}),
			showSignOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut("/").catch(() => setSigningOut(false));
				},
				className: "inline-flex h-10 items-center justify-center gap-1.5 rounded-full border-thick border-ink bg-paper px-2.5 font-display text-sm font-bold shadow-hard-sm hover:bg-paper-2 disabled:opacity-50 sm:px-3",
				"aria-label": "Sign out",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
					className: "size-4 sm:hidden",
					strokeWidth: 2.4
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: signingOut ? "Signing out…" : "Sign out"
				})]
			}) : null
		]
	});
}
//#endregion
export { AccountMenu as t };
