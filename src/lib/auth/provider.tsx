import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-react-start";

const clerkPublishableKey =
  (typeof process !== "undefined"
    ? process.env.VITE_CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY
    : undefined) ||
  (import.meta as { env?: Record<string, string> }).env?.VITE_CLERK_PUBLISHABLE_KEY ||
  (import.meta as { env?: Record<string, string> }).env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  (import.meta as { env?: Record<string, string> }).env?.CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }: { children: ReactNode }) {
  const isKeyValid =
    Boolean(clerkPublishableKey) &&
    (clerkPublishableKey.startsWith("pk_live_") || clerkPublishableKey.startsWith("pk_test_"));

  if (isKeyValid) {
    return <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>;
  }

  // If publishable key is not set or invalid, render children directly without ClerkProvider
  return <>{children}</>;
}

