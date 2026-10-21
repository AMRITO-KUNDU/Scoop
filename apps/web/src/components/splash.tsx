import { Logo } from "@/components/logo";

/**
 * Loading state for the app shell while the session resolves: just the SCOOP
 * mark, centred on the paper background. No loading copy, no animation.
 */
export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper">
      <Logo />
    </div>
  );
}
