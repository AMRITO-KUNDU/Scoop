import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-CpYBE5GC.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("chunky inline-flex items-center justify-center gap-2 font-display font-bold tracking-tight select-none disabled:pointer-events-none disabled:opacity-45", {
	variants: {
		variant: {
			yolk: "bg-yolk text-ink",
			hot: "bg-hot text-paper",
			cyan: "bg-cyan text-ink",
			grape: "bg-grape text-paper",
			volt: "bg-cyan text-ink",
			ink: "bg-ink text-paper",
			paper: "bg-paper text-ink"
		},
		size: {
			sm: "h-10 px-3 text-sm",
			md: "h-12 px-5 text-base",
			lg: "h-14 px-7 text-lg",
			xl: "h-16 px-8 text-xl",
			icon: "size-12"
		}
	},
	defaultVariants: {
		variant: "yolk",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		type: asChild ? void 0 : type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
