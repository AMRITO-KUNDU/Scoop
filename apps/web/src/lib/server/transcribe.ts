import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { readTrimmedEnv } from "@/lib/groq";

/**
 * Voice notes: a recording in, text out.
 *
 * Transcription runs on the same Groq account that already does extraction, so
 * this adds no vendor and no key — and the audio never goes to a third party we
 * have not already disclosed in the privacy policy.
 */

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

/** Turbo first; the slower model is the fallback if the first is unavailable. */
const MODELS = ["whisper-large-v3-turbo", "whisper-large-v3"] as const;

/** ~10 MB of audio, base64-encoded. A minute of speech is far smaller. */
const MAX_BASE64_CHARS = 14_000_000;

const REQUEST_TIMEOUT_MS = 15_000;

const ALLOWED_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/x-m4a",
];

export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { audio?: string; mimeType?: string }) => {
    const audio = typeof input?.audio === "string" ? input.audio : "";
    if (!audio) throw new Error("Nothing was recorded.");
    if (audio.length > MAX_BASE64_CHARS) {
      throw new Error("That recording is too long — try under a minute.");
    }
    const mimeType = (input?.mimeType ?? "audio/webm").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(mimeType)) throw new Error("That audio format isn't supported.");
    return { audio, mimeType };
  })
  .handler(async ({ data }) => {
    const apiKey = readTrimmedEnv(process.env, "GROQ_API_KEY");
    if (!apiKey) throw new Error("Voice notes aren't set up on this server yet.");

    const bytes = Buffer.from(data.audio, "base64");
    let lastError = "Could not transcribe that recording.";

    for (const model of MODELS) {
      const form = new FormData();
      form.append("file", new Blob([bytes], { type: data.mimeType }), "voice.webm");
      form.append("model", model);
      form.append("response_format", "json");
      form.append("temperature", "0");

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const res = await fetch(GROQ_TRANSCRIBE_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
          signal: controller.signal,
        });

        if (!res.ok) {
          lastError = `Transcription failed (${res.status}).`;
          // A bad model name or a rejected clip is worth one retry on the other
          // model; anything else will fail the same way again.
          if (res.status === 400 || res.status === 404) continue;
          break;
        }

        const body = (await res.json()) as { text?: string };
        const text = (body.text ?? "").trim();
        if (!text) {
          lastError = "That recording came back empty — try again, a bit closer to the mic.";
          continue;
        }
        return { ok: true as const, text, model };
      } catch (err) {
        lastError =
          err instanceof Error && err.name === "AbortError"
            ? "That took too long to transcribe. Try a shorter note."
            : "Could not reach the transcription service.";
      } finally {
        clearTimeout(timer);
      }
    }

    throw new Error(lastError);
  });
