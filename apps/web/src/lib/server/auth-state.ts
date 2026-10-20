import { createServerFn } from "@tanstack/react-start";
import { getSessionUser } from "@/lib/auth/verify.server";

/**
 * Server-side "is anyone signed in?" check.
 *
 * `createServerFn` runs on the server during SSR, so a route's `beforeLoad` can
 * use this to redirect an authenticated visitor *before* any HTML is sent —
 * which is what stops the marketing page from flashing past on the way to the
 * app. Crawlers carry no session cookie, so they always get the landing page
 * rendered as usual.
 *
 * Fails open: if Clerk is unconfigured or the check throws, `getSessionUser()`
 * returns null, so the caller just falls through to normal rendering.
 */
export const getSignedInState = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser();
  return { signedIn: Boolean(user) };
});
