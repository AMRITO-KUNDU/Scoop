import { useUser } from "@clerk/tanstack-start";

/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  /** True when this is the sandbox/dev fallback (auth not configured). */
  isDevFallback: boolean;
};

/**
 * Stable fallback user, used ONLY when auth is disabled
 * (`VITE_AUTH_ENABLED=false`).
 */
export const DEV_USER: AppUser = {
  id: "dev-user",
  displayName: "Dev User",
  primaryEmail: "dev@example.com",
  profileImageUrl: null,
  isDevFallback: true,
};

/** `useCurrentUserState()` result: the user plus the session-loading flag. */
export type CurrentUserState = {
  /** The user — `null` BOTH while the session loads and when signed out. */
  user: AppUser | null;
  /** True while the session is still resolving — don't treat `user: null` as signed out yet. */
  isPending: boolean;
};

/**
 * Current user + loading state powered by Clerk Authentication.
 */
export function useCurrentUserState(): CurrentUserState {
  let isLoaded = false;
  let isSignedIn = false;
  let user: ReturnType<typeof useUser>["user"] = null;

  try {
    const clerk = useUser();
    isLoaded = clerk.isLoaded;
    isSignedIn = Boolean(clerk.isSignedIn);
    user = clerk.user;
  } catch {
    // If rendered outside ClerkProvider or in non-browser context
    return { user: DEV_USER, isPending: false };
  }

  if (!isLoaded) {
    return { user: null, isPending: true };
  }

  if (!user || !isSignedIn) {
    if (
      (typeof process !== "undefined" && process.env.VITE_AUTH_ENABLED === "false") ||
      (typeof import.meta !== "undefined" &&
        (import.meta as { env?: Record<string, string> }).env?.VITE_AUTH_ENABLED === "false")
    ) {
      return { user: DEV_USER, isPending: false };
    }
    return { user: null, isPending: false };
  }

  return {
    user: {
      id: user.id,
      displayName: user.fullName || user.username || user.firstName || null,
      primaryEmail: user.primaryEmailAddress?.emailAddress || null,
      profileImageUrl: user.imageUrl || null,
      isDevFallback: false,
    },
    isPending: false,
  };
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}
