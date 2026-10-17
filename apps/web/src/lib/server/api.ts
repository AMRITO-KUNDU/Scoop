/**
 * Helpers for the JSON API that the mobile app talks to.
 *
 * The web app's own screens use server functions directly; the mobile client
 * can't (server functions are same-origin RPC and deliberately not for external
 * callers), so `src/routes/api/*` exposes the same operations over plain HTTP.
 * Those routes are thin adapters: they call the very same server functions, so
 * validation, auth and business rules stay in one place.
 *
 * Requests arrive cross-origin from a native app, so there is no session cookie:
 * the client sends the Clerk session token as `Authorization: Bearer <token>`,
 * which `clerkMiddleware()` accepts.
 */

import { UnauthorizedError } from "@/lib/auth/verify.server";

/**
 * Turn a thrown error into a JSON response.
 *
 * Errors thrown inside a server function surface here unchanged, so an
 * unauthenticated caller becomes a 401 rather than a 500. The check is
 * deliberately loose — anything carrying a 401 status or the error's name is
 * treated as unauthorised, in case the error crosses a boundary and loses its
 * prototype.
 */
export function apiError(err: unknown): Response {
  const status =
    err instanceof UnauthorizedError
      ? 401
      : typeof (err as { status?: unknown })?.status === "number"
        ? (err as { status: number }).status
        : (err as { name?: string })?.name === "UnauthorizedError"
          ? 401
          : 400;

  const message =
    status === 401
      ? "Unauthorized"
      : err instanceof Error
        ? err.message
        : "Something went wrong.";

  return Response.json({ error: message }, { status });
}

/** Read a JSON body, tolerating an empty one. */
export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}
