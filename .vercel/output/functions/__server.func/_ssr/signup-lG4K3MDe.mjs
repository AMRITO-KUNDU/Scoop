import { C as require_jsx_runtime, b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useCurrentUserState } from "./button-D08vmLm4.mjs";
import { t as AuthPanel } from "./auth-panel-CLCaWh_c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signup-lG4K3MDe.js
var import_jsx_runtime = require_jsx_runtime();
function Signup() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-paper px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl font-black uppercase tracking-tight",
			children: "Loading SCOOP…"
		})
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/capture" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-paper px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPanel, { mode: "signup" })
	});
}
//#endregion
export { Signup as component };
