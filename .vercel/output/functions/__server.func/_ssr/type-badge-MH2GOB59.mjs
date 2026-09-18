import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TYPE_META } from "./plan-BrPv_pMX.mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/type-badge-MH2GOB59.js
var import_jsx_runtime = require_jsx_runtime();
var TONE = {
	cyan: "bg-cyan text-ink",
	hot: "bg-hot text-paper",
	yolk: "bg-yolk text-ink",
	grape: "bg-grape text-paper"
};
function TypeBadge({ type, className }) {
	const meta = TYPE_META[type];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border-thick border-ink px-2.5 py-0.5 font-display text-xs font-black uppercase tracking-wide", TONE[meta.tone], className),
		children: meta.label
	});
}
//#endregion
export { TypeBadge as t };
