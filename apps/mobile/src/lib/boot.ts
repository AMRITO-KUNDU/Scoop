/**
 * A one-shot "the first screen has settled" signal.
 *
 * The splash needs to know when there's real content behind it, not just when
 * React has mounted. Otherwise it fades away to reveal a loading state — the
 * flash this exists to prevent.
 *
 * Deliberately tiny and dependency-free: a module-level flag plus subscribers,
 * rather than a context, so the screen that loads the data doesn't have to be
 * inside any particular provider to report readiness.
 */

let contentReady = false;
const listeners = new Set<() => void>();

/** Called once by the first screen, whether its load succeeded or failed. */
export function markContentReady(): void {
  if (contentReady) return;
  contentReady = true;
  for (const listener of listeners) listener();
}

export function isContentReady(): boolean {
  return contentReady;
}

export function subscribeContentReady(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
