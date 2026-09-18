import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { resolveIntegrations, type IntegrationsStatus } from "@/lib/integrations";

export const getIntegrationsStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<IntegrationsStatus> => {
    return resolveIntegrations(process.env);
  });
