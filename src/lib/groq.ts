/**
 * Groq configuration for the AI extraction path.
 *
 * Blank strings are treated as unset, so an empty value left behind in a deploy
 * UI doesn't silently shadow a default.
 */

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

// Fallback models, tried in order when the default is unavailable. Only
// currently active production models — see https://console.groq.com/docs/models
export const GROQ_FALLBACK_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"] as const;

export function readTrimmedEnv(
  source: Record<string, string | undefined>,
  key: string,
): string | undefined {
  const value = source[key]?.trim();
  return value ? value : undefined;
}
