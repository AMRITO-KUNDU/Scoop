import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, S as useRouter, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as Wordmark } from "./logo-ZkcmHUEu.mjs";
import { t as GROK_PROVIDERS } from "./server-DdkeDpYW.mjs";
import { n as Label, t as Input } from "./label-PsRqwIh2.mjs";
import { t as Button } from "./button-CpYBE5GC.mjs";
import { n as XMark, t as GoogleMark } from "./brand-marks-Dz1k8vWj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-panel-XfDvrkSz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderIcon({ label }) {
	if (label === "Google") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, { className: "size-5" });
	if (label === "X") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, { className: "size-4" });
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
						children: isSignup ? "Real Google, X, or email. Your plan stays with your account." : "Google, X, or the email you signed up with."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-3",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: p.label === "Google" ? "yolk" : "paper",
							className: "w-full",
							size: "lg",
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
								variant: "ink",
								children: busy ? "Working…" : isSignup ? "Start your SCOOP" : "Sign in with email"
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
