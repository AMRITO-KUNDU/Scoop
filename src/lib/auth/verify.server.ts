import { getAuth } from "@clerk/tanstack-start/server";
import { getRequest } from "@tanstack/react-start/server";

const clerkSecret = process.env.CLERK_SECRET_KEY?.trim();
const clerkPub =
  process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
  process.env.CLERK_PUBLISHABLE_KEY?.trim();

export const authConfigured = Boolean(clerkSecret || clerkPub);
const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

export const DEV_USER_ID = "dev-user";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export type VerifiedUser = { id: string; email: string | null };

export async function getSessionUser(): Promise<VerifiedUser | null> {
  const request = getRequest();
  if (!request) return null;
  try {
    const authState = await getAuth(request);
    if (authState?.userId) {
      return { id: authState.userId, email: null };
    }
  } catch {
    /* fallback */
  }
  return null;
}

export async function requireUserId(): Promise<string> {
  if (!authConfigured && process.env.VITE_AUTH_ENABLED === "false") {
    if (databaseConfigured) {
      throw new Error(
        "Auth is disabled (VITE_AUTH_ENABLED=false) but DATABASE_URL is set — " +
          "refusing to fall back to the shared dev user against a real database.",
      );
    }
    return DEV_USER_ID;
  }

  const user = await getSessionUser();
  if (user) return user.id;

  if (!authConfigured && !databaseConfigured) {
    return DEV_USER_ID;
  }

  throw new UnauthorizedError();
}
