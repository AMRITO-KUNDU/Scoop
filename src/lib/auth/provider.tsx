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
  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        {children}
      </ClerkProvider>
    );
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
