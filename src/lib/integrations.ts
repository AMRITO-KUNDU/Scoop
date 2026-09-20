/**
 * Production wiring — paste values and restart. No code changes.
 *
 * In `.grok/app-env.json`:
 *
 *   "env": {
 *     "DATABASE_URL": "postgres://…neon.tech/…?sslmode=require",
 *     "GROQ_API_KEY": "gsk_…",
 *     "GROQ_MODEL": "llama3-70b-8192",
 *     "XAI_API_KEY": ""
 *   }
 *
 * Blank strings are ignored. Host/process env always wins. Google sign-in
 * is already live.
 */

export const DEFAULT_GROQ_MODEL = "llama3-70b-8192";

// Fallback models for Groq - try these if the default fails
export const GROQ_FALLBACK_MODELS = [
  "llama3-70b-8192",
  "llama-3.2-70b-versatile",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
] as const;
export const DEFAULT_GROK_MODEL = "grok-4.5";

export type ServiceId = "google" | "googleCloud" | "clerk" | "neon" | "groq" | "grok";

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
  googleCloud: ServiceStatus;
  clerk: ServiceStatus;
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

  const googleClientId = readTrimmedEnv(source, "GOOGLE_CLIENT_ID");
  const googleClientSecret = readTrimmedEnv(source, "GOOGLE_CLIENT_SECRET");
  const googleCloudWired = Boolean(googleClientId && googleClientSecret);

  const clerkPublishableKey =
    readTrimmedEnv(source, "VITE_CLERK_PUBLISHABLE_KEY") ??
    readTrimmedEnv(source, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ??
    readTrimmedEnv(source, "CLERK_PUBLISHABLE_KEY");
  const clerkSecretKey = readTrimmedEnv(source, "CLERK_SECRET_KEY");
  const clerkWired = Boolean(clerkPublishableKey || clerkSecretKey);

  return {
    google: {
      id: "google",
      label: "Google sign-in (Broker)",
      envVar: null,
      wired: true,
      detail: googleCloudWired
        ? "Bypassed — Direct Google Cloud OAuth is active."
        : "Real Google and email sign-in via Clerk / Google OAuth.",
    },
    googleCloud: {
      id: "googleCloud",
      label: "Google Cloud OAuth",
      envVar: "GOOGLE_CLIENT_ID",
      extraEnvVar: "GOOGLE_CLIENT_SECRET",
      wired: googleCloudWired,
      detail: googleCloudWired
        ? "Connected to custom Google Cloud Console OAuth app."
        : "Optional direct Google OAuth. Provide client ID & secret.",
    },
    clerk: {
      id: "clerk",
      label: "Clerk Auth",
      envVar: "VITE_CLERK_PUBLISHABLE_KEY",
      extraEnvVar: "CLERK_SECRET_KEY",
      wired: clerkWired,
      detail: clerkWired
        ? "Clerk keys configured. Custom auth enabled."
        : "Optional Clerk auth integration. Provide publishable and secret keys.",
    },
    neon: {
      id: "neon",
      label: "Neon Postgres",
      envVar: "DATABASE_URL",
      wired: Boolean(databaseUrl),
      detail: databaseUrl
        ? "Connected to Neon. Data and sessions persist in Neon Postgres."
        : "Local preview database. Provide DATABASE_URL for Neon.",
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
