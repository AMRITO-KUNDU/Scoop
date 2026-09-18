import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CyXujKyT.mjs";
import { n as createSsrRpc } from "./createSsrRpc-DpRQNsVg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integrations-CV35u5jW.js
var getIntegrationsStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1b3697949cdd69f8c7f9185b1ea2a53cc66001ea47279c6ff87991c4d0bf8de5"));
//#endregion
export { getIntegrationsStatus as t };
