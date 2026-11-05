import { auth } from "@clerk/tanstack-react-start/server";

const clerkSecret = process.env.CLERK_SECRET_KEY?.trim();
const clerkPub =
  process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || process.env.CLERK_PUBLISHABLE_KEY?.trim();

export const isProduction = process.env.NODE_ENV === "production";

export function validateClerkKeys(
  pub?: string,
  secret?: string,
): { valid: boolean; error?: string } {
  if (!pub && !secret) return { valid: false, error: "Clerk publishable and secret keys are missing." };
  if (!pub || !secret)
    return { valid: false, error: "Both Clerk publishable key and secret key are required." };

  const isPubLive = pub.startsWith("pk_live_");
  const isPubTest = pub.startsWith("pk_test_");
  const isSecretLive = secret.startsWith("sk_live_");
  const isSecretTest = secret.startsWith("sk_test_");

  if (!isPubLive && !isPubTest)
    return { valid: false, error: "Invalid Clerk publishable key format (must start with pk_live_ or pk_test_)." };
  if (!isSecretLive && !isSecretTest)
    return { valid: false, error: "Invalid Clerk secret key format (must start with sk_live_ or sk_test_)." };

  if ((isPubLive && !isSecretLive) || (isPubTest && !isSecretTest)) {
    return { valid: false, error: "Clerk publishable and secret key environment scopes do not match." };
  }

  return { valid: true };
}

export const authConfigured = validateClerkKeys(clerkPub, clerkSecret).valid;
const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

export const DEV_USER_ID = "dev-user";

/**
 * The Clerk frontend API this deployment verifies tokens against, e.g.
 * "your-app.clerk.accounts.dev".
 *
 * A publishable key is `pk_test_`/`pk_live_` followed by the base64 of
 * "<frontend-api>$". It is public by design — every browser that loads the app
 * gets it — so echoing it back on an auth failure leaks nothing, and it is the
 * only way a native client can tell "my token is fine, I am just pointed at a
 * different Clerk instance" apart from "my session is gone".
 */
export function frontendApiFromPublishableKey(key: string | undefined): string | null {
  const match = /^pk_(?:test|live)_(.+)$/.exec(key?.trim() ?? "");
  if (!match) return null;
  try {
    const host = Buffer.from(match[1], "base64").toString("utf8").split("$")[0]?.trim();
    return host || null;
  } catch {
    return null;
  }
}

export const expectedFrontendApi = frontendApiFromPublishableKey(clerkPub);

export type AuthFailureReason = "auth_unconfigured" | "auth_error" | "no_valid_session";

export class UnauthorizedError extends Error {
  readonly status = 401;
  readonly reason: AuthFailureReason;
  constructor(message = "Unauthorized", reason: AuthFailureReason = "no_valid_session") {
    super(message);
    this.name = "UnauthorizedError";
    this.reason = reason;
  }
}

export type VerifiedUser = { id: string; email: string | null };

/** The slice of `auth()`'s return value we read. */
type ClerkAuthState = {
  userId?: string | null;
  subject?: string | null;
  tokenType?: string | null;
} | null;

/**
 * Resolve the caller — and say *why* it failed when it does.
 *
 * `clerkMiddleware()` authenticates with `acceptsToken: "any"`, so a bearer token
 * is accepted whatever its type. A session token carries `userId`; a JWT-template
 * or OAuth token carries the same identity in `subject` and no `userId` at all —
 * reading only `userId` turns a perfectly valid native token into a 401.
 */
export async function resolveSession(): Promise<{
  user: VerifiedUser | null;
  reason: AuthFailureReason | null;
}> {
  if (!authConfigured) return { user: null, reason: "auth_unconfigured" };

  let authState: ClerkAuthState;
  try {
    authState = (await auth()) as unknown as ClerkAuthState;
  } catch (err) {
    // Never silent: a thrown verification error means the keys, the instance or
    // the token is wrong, and swallowing it makes all three look like a plain
    // "Unauthorized" in the app.
    console.error("[auth] Clerk could not verify the request:", err);
    return { user: null, reason: "auth_error" };
  }

  if (authState?.userId) return { user: { id: authState.userId, email: null }, reason: null };

  // Non-session token: the identity is the token's subject. Only trust it when it
  // looks like a Clerk user id, so an OAuth token's external subject can never be
  // mistaken for one of our users.
  const subject = authState?.subject;
  if (subject && subject.startsWith("user_")) {
    return { user: { id: subject, email: null }, reason: null };
  }

  return { user: null, reason: "no_valid_session" };
}

export async function getSessionUser(): Promise<VerifiedUser | null> {
  return (await resolveSession()).user;
}

export async function requireUserId(): Promise<string> {
  const { user, reason } = await resolveSession();
  if (user) return user.id;

  if (isProduction) {
    // Production must fail closed. Never fall back to DEV_USER_ID.
    throw new UnauthorizedError(
      reason === "auth_unconfigured"
        ? "CLERK_SECRET_KEY is not configured on the server."
        : "Production requires verified server authentication.",
      reason ?? "no_valid_session",
    );
  }

  if (!authConfigured && process.env.VITE_AUTH_ENABLED === "false") {
    if (databaseConfigured) {
      throw new Error(
        "Auth is disabled (VITE_AUTH_ENABLED=false) but DATABASE_URL is set — " +
          "refusing to fall back to the shared dev user against a real database.",
      );
    }
    return DEV_USER_ID;
  }

  if (!authConfigured && !databaseConfigured) {
    return DEV_USER_ID;
  }

  throw new UnauthorizedError();
}
