import { Wordmark } from "@/components/logo";

/**
 * Loading state for the app shell while the session resolves.
 *
 * This is the app's own skeleton idiom — the `animate-pulse` placeholder blocks
 * used by Plan and Connectors, and the same shell chrome that was here before —
 * rather than a spinner or a branded splash. It shows the shape of the screen
 * that is about to appear, with no loading copy.
 */
export function Splash() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b-thick border-ink bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Wordmark compact />
          <div className="inline-flex rounded-full border-thick border-ink bg-paper p-1 shadow-hard-sm">
            <span className="inline-flex h-9 items-center px-3 font-display text-sm font-black">
              Capture
            </span>
            <span className="inline-flex h-9 items-center px-3 font-display text-sm font-black text-mute">
              Plan
            </span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-40 animate-pulse rounded-full border-thick border-ink bg-paper-2" />
        <div className="mt-4 h-6 w-56 animate-pulse rounded-full bg-paper-2" />
        <div className="mt-8 h-40 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" />
        <div className="mt-3 h-24 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" />
      </div>
    </div>
  );
}
