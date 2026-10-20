import { Wordmark } from "@/components/logo";

/**
 * Branded loading screen shown while the session is still resolving.
 *
 * Clerk resolves on the client only, so the server always renders the pending
 * state — this is what a signed-in visitor briefly sees before the app takes
 * over. A centred wordmark rather than a layout skeleton: it reads as an
 * intentional "getting you in" moment instead of flashing the wrong screen's
 * chrome first.
 */
export function Splash({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper">
      <div className="flex flex-col items-center gap-5" role="status" aria-live="polite">
        <span className="animate-pulse">
          <Wordmark />
        </span>
        <span className="font-display text-xs font-black uppercase tracking-widest text-mute">
          {label}
        </span>
      </div>
    </div>
  );
}
