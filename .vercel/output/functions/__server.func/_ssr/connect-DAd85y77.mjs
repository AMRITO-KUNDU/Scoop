import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
import { _ as Check, f as KeyRound, h as Copy, i as Sparkles, m as Database, t as Zap } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./createSsrRpc-DpRQNsVg.mjs";
import { t as getIntegrationsStatus } from "./integrations-CV35u5jW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connect-DAd85y77.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConnectPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectScreen, {}) });
}
function ConnectScreen() {
	const [services, setServices] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		getIntegrationsStatus().then((status) => {
			if (!alive) return;
			setServices([
				status.google,
				status.neon,
				status.groq,
				status.grok
			]);
		}).catch((err) => {
			if (!alive) return;
			setError(err instanceof Error ? err.message : "Could not load status.");
		});
		return () => {
			alive = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper",
			children: "Stack"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-3 font-display text-title font-black uppercase tracking-tight",
			children: "The real product stack."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-lg text-sm font-medium text-mute",
			children: "Google login is live now. Neon, Groq and Grok light up from host env — preview still works without them."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 rounded-xl border-thick border-ink bg-hot/15 px-3 py-2 text-sm font-semibold",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-4",
			children: services ? services.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceCard, { service }, service.id)) : [
				0,
				1,
				2,
				3
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" }, i))
		})
	] });
}
function ServiceCard({ service }) {
	const Icon = service.id === "google" ? KeyRound : service.id === "neon" ? Database : service.id === "groq" ? Zap : Sparkles;
	const tone = service.id === "google" ? "bg-cyan" : service.id === "neon" ? "bg-yolk" : service.id === "groq" ? "bg-hot text-paper" : "bg-grape text-paper";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel p-5 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("grid size-11 place-items-center rounded-xl border-thick border-ink shadow-hard-sm", tone),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						strokeWidth: 2.4
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-black uppercase tracking-tight",
					children: service.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-mute",
					children: service.detail
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("sticker shrink-0 rounded-full px-3 py-1 text-xs", service.wired ? "bg-cyan" : "bg-paper-2"),
				children: service.wired ? "Live" : "Waiting"
			})]
		}), service.envVar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnvRow, {
				name: service.envVar,
				hint: envHint(service.envVar)
			}), service.extraEnvVar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnvRow, {
				name: service.extraEnvVar,
				hint: "optional — defaults to llama-3.3-70b-versatile"
			}) : null]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 rounded-xl border-thick border-ink bg-paper-2 px-3 py-2 text-sm font-semibold",
			children: "Continue with Google is already on. Email and X work too."
		})]
	});
}
function envHint(name) {
	if (name === "DATABASE_URL") return "postgres://…neon.tech/…?sslmode=require";
	if (name === "GROQ_API_KEY") return "gsk_… from console.groq.com";
	if (name === "XAI_API_KEY") return "injected automatically when available";
	return "";
}
function EnvRow({ name, hint }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl border-thick border-ink bg-paper-2 px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
				className: "min-w-0 flex-1 truncate font-display text-sm font-bold",
				children: name
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-xs font-medium text-mute sm:inline",
				children: hint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "inline-flex size-9 items-center justify-center rounded-lg border-thick border-ink bg-paper hover:bg-yolk",
				"aria-label": `Copy ${name}`,
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(name);
						setCopied(true);
						window.setTimeout(() => setCopied(false), 1200);
					} catch {}
				},
				children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-4",
					strokeWidth: 2.6
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
					className: "size-4",
					strokeWidth: 2.4
				})
			})
		]
	});
}
//#endregion
export { ConnectPage as component };
