import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, S as useRouter, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as Wordmark, t as Button } from "./button-D08vmLm4.mjs";
import { t as GROK_PROVIDERS } from "./server-DdkeDpYW.mjs";
import { n as Label, t as Input } from "./label-W4uXpWsh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-panel-CLCaWh_c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M21.6 12.23c0-.74-.06-1.28-.2-1.84H12v3.34h5.5c-.11.9-.72 2.26-2.07 3.17l-.02.12 3 2.3.21.02c1.9-1.75 3-4.33 3-7.11z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M12 22c2.7 0 4.96-.9 6.62-2.44l-3.15-2.42c-.85.6-1.99 1.02-3.47 1.02-2.65 0-4.9-1.75-5.7-4.17l-.12.01-3.08 2.38-.04.11C4.67 19.98 8.09 22 12 22z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M6.3 13.99A5.99 5.99 0 0 1 6 12c0-.69.11-1.36.29-1.99l-.01-.13-3.12-2.42-.1.05A9.98 9.98 0 0 0 2 12c0 1.61.39 3.13 1.06 4.49l3.24-2.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M12 5.84c1.88 0 3.15.81 3.87 1.49l2.83-2.76C16.95 2.91 14.7 2 12 2 8.09 2 4.67 4.02 3.06 7.51l3.22 2.5C7.1 7.59 9.35 5.84 12 5.84z"
			})
		]
	});
}
function XMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M18.9 2H22l-6.84 7.82L23.2 22h-6.5l-5.09-6.65L5.2 22H2.08l7.32-8.36L.8 2h6.66l4.6 6.08L18.9 2Zm-1.14 18h1.8L6.33 3.91H4.4L17.76 20Z"
		})
	});
}
function ProviderIcon({ label }) {
	if (label === "Google") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {});
	if (label === "X") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, {});
	return null;
}
function AuthPanel({ mode }) {
	const navigate = useNavigate();
	const router = useRouter();
	const isSignup = mode === "signup";
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			if (isSignup) {
				const { error: err } = await authClient.signUp.email({
					name: name.trim() || email.split("@")[0],
					email,
					password
				});
				if (err) throw new Error(err.message ?? "Could not create account.");
			} else {
				const { error: err } = await authClient.signIn.email({
					email,
					password
				});
				if (err) throw new Error(err.message ?? "Could not sign in.");
			}
			try {
				await authClient.getSession();
			} catch {}
			await router.invalidate();
			await navigate({ to: "/capture" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mb-8 inline-flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel rotate-1 p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sticker mb-3 inline-flex rounded-full bg-cyan px-3 py-1 text-xs",
						children: isSignup ? "Create account" : "Welcome back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-black uppercase tracking-tight",
						children: isSignup ? "Get organised" : "Sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm font-medium text-mute",
						children: isSignup ? "Get your family organised with SCOOP." : "Sign in to your SCOOP account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-3",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "paper",
							className: "w-full",
							onClick: () => {
								signIn(p.providerId, { callbackURL: "/capture" }).catch((err) => setError(err instanceof Error ? err.message : "Sign-in failed."));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderIcon, { label: p.label }),
								"Continue with ",
								p.label
							]
						}, p.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-ink" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold uppercase tracking-wider text-mute",
								children: "or email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-ink" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit,
						children: [
							isSignup ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "name",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "name",
									autoComplete: "name",
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Alex Rivera"
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									required: true,
									autoComplete: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "you@email.com"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									required: true,
									minLength: 8,
									autoComplete: isSignup ? "new-password" : "current-password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "At least 8 characters"
								})]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl border-thick border-ink bg-hot/15 px-3 py-2 text-sm font-semibold",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								size: "lg",
								disabled: busy,
								children: busy ? "Working…" : isSignup ? "Start your SCOOP" : "Sign in"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-center text-sm text-mute",
				children: isSignup ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Already have an account?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "font-bold text-ink underline decoration-2 underline-offset-4",
						children: "Sign in"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"New here?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signup",
						className: "font-bold text-ink underline decoration-2 underline-offset-4",
						children: "Sign up"
					})
				] })
			})
		]
	});
}
//#endregion
export { AuthPanel as t };
