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

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type VerifiedUser = { id: string; email: string | null };

export async function getSessionUser(): Promise<VerifiedUser | null> {
  try {
    const authState = await auth();
    if (authState?.userId) {
      return { id: authState.userId, email: null };
    }
  } catch {
    /* fallback */
  }
  return null;
}

export async function requireUserId(): Promise<string> {
  const user = await getSessionUser();
  if (user) return user.id;

  if (isProduction) {
    // Production must fail closed. Never fall back to DEV_USER_ID.
    throw new UnauthorizedError("Production requires verified server authentication.");
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

