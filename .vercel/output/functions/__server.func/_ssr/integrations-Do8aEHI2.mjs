import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as resolveIntegrations } from "./integrations-BxLxWnwl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integrations-Do8aEHI2.js
var getIntegrationsStatus_createServerFn_handler = createServerRpc({
	id: "1b3697949cdd69f8c7f9185b1ea2a53cc66001ea47279c6ff87991c4d0bf8de5",
	name: "getIntegrationsStatus",
	filename: "src/lib/server/integrations.ts"
}, (opts) => getIntegrationsStatus.__executeServer(opts));
var getIntegrationsStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getIntegrationsStatus_createServerFn_handler, async () => {
	return resolveIntegrations(process.env);
});
//#endregion
export { getIntegrationsStatus_createServerFn_handler };
