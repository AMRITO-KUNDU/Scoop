/**
 * Production wiring. Preview already works with nothing set.
 *
 *   DATABASE_URL     Neon pooled connection string (injected on publish)
 *   GROQ_API_KEY     Groq console key (gsk_…)
 *   GROQ_MODEL       optional, default llama-3.3-70b-versatile
 *   XAI_API_KEY      Grok extract backup (injected when available)
 *
 * Google sign-in is already live. No Clerk, no Google Cloud project.
 */

export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const DEFAULT_GROK_MODEL = "grok-4.5";

export type ServiceId = "google" | "neon" | "groq" | "grok";

export type ServiceStatus = {
  id: ServiceId;
  label: string;
  envVar: string | null;
  extraEnvVar?: string;
  wired: boolean;
  detail: string;
  model?: string;
};

export type IntegrationsStatus = {
  google: ServiceStatus;
  neon: ServiceStatus;
  groq: ServiceStatus;
  grok: ServiceStatus;
};

export function readTrimmedEnv(
  source: Record<string, string | undefined>,
  key: string,
): string | undefined {
  const value = source[key]?.trim();
  return value ? value : undefined;
}

export function resolveIntegrations(
  source: Record<string, string | undefined>,
): IntegrationsStatus {
  const databaseUrl = readTrimmedEnv(source, "DATABASE_URL");
  const groqKey = readTrimmedEnv(source, "GROQ_API_KEY");
  const groqModel = readTrimmedEnv(source, "GROQ_MODEL") ?? DEFAULT_GROQ_MODEL;
  const xaiKey = readTrimmedEnv(source, "XAI_API_KEY");

  return {
    google: {
      id: "google",
      label: "Google sign-in",
      envVar: null,
      wired: true,
      detail: "Real Google + X + email login. No Clerk, no Cloud Console.",
    },
    neon: {
      id: "neon",
      label: "Neon Postgres",
      envVar: "DATABASE_URL",
      wired: Boolean(databaseUrl),
      detail: databaseUrl
        ? "Connected to Neon. Plans persist across devices."
        : "Local preview database. Publish to get Neon automatically.",
    },
    groq: {
      id: "groq",
      label: "Groq extract",
      envVar: "GROQ_API_KEY",
      extraEnvVar: "GROQ_MODEL",
      wired: Boolean(groqKey),
      model: groqModel,
      detail: groqKey
        ? `Live on ${groqModel}.`
        : "Waiting for GROQ_API_KEY. On-device parser until then.",
    },
    grok: {
      id: "grok",
      label: "Grok backup",
      envVar: "XAI_API_KEY",
      wired: Boolean(xaiKey),
      model: DEFAULT_GROK_MODEL,
      detail: xaiKey
        ? `Live on ${DEFAULT_GROK_MODEL} if Groq is down.`
        : "Optional backup. Used automatically when the key is present.",
    },
  };
}
