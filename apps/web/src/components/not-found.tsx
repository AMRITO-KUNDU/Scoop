import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/logo";

/**
 * 404 screen, wired up as the router's `defaultNotFoundComponent`.
 *
 * TanStack Start serves this with a real 404 status for any URL that matches no
 * route, so unknown links get a proper not-found response instead of a soft 200.
 * No page metadata is needed: a 404 is not indexed.
 */
export function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <Wordmark />
        <h1 className="font-display text-title font-black uppercase tracking-tight">
          Page not found
        </h1>
        <p className="max-w-md text-sm font-medium text-mute">
          That link does not go anywhere. The chaos lives on the home page.
        </p>
        <Link
          to="/"
          className="chunky inline-flex h-11 items-center rounded-full bg-yolk px-5 font-display text-sm font-bold"
        >
          Back to SCOOP
        </Link>
      </div>
    </main>
  );
}
