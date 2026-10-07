/**
 * Production wiring — paste values and restart. No code changes.
 *
 *   DATABASE_URL="postgres://…neon.tech/…?sslmode=require"
 *   GROQ_API_KEY="gsk_…"
 *   GROQ_MODEL="openai/gpt-oss-120b"
 *
 * Blank strings are ignored. Host/process env always wins.
 */

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

// Fallback models for Groq - try these if the default fails
// Using only currently active production models (developer-tier) as of Sept 2026
// See: https://console.groq.com/docs/models and https://console.groq.com/docs/deprecations
export const GROQ_FALLBACK_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"] as const;

export type ServiceId = "google" | "googleCloud" | "clerk" | "neon" | "groq";

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
      label: "Google sign-in",
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
  };
}
