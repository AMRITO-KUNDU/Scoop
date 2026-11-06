/**
 * The text handed over by a share from another app.
 *
 * A module-level variable rather than route params: the share lands on
 * `handle-share`, which forwards to the capture screen, and a school newsletter
 * is up to 6,000 characters — far too long for a URL. This survives the
 * navigation and is consumed once.
 */
let pending: string | null = null;

export function setPendingShare(text: string): void {
  pending = text;
}

/** Read the shared text, clearing it so it is only used once. */
export function takePendingShare(): string | null {
  const text = pending;
  pending = null;
  return text;
}
