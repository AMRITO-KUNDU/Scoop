import { Link } from "@tanstack/react-router";
import { SignIn, SignUp } from "@clerk/tanstack-start";
import { Wordmark } from "@/components/logo";

const clerkPublishableKey =
  (typeof process !== "undefined"
    ? process.env.VITE_CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY
    : undefined) ||
  (import.meta as { env?: Record<string, string> }).env?.VITE_CLERK_PUBLISHABLE_KEY ||
  (import.meta as { env?: Record<string, string> }).env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  (import.meta as { env?: Record<string, string> }).env?.CLERK_PUBLISHABLE_KEY;

export function AuthPanel({ mode }: { mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-md">
      <Link to="/" className="mb-8 inline-flex">
        <Wordmark />
      </Link>
      <div className="panel rotate-1 p-6 sm:p-8 flex flex-col items-center">
        <p className="sticker mb-3 inline-flex rounded-full bg-cyan px-3 py-1 text-xs">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-center mb-6">
          {isSignup ? "Get organised" : "Sign in"}
        </h1>

        {clerkPublishableKey ? (
          <div className="w-full flex justify-center">
            {isSignup ? (
              <SignUp routing="path" path="/signup" fallbackRedirectUrl="/capture" />
            ) : (
              <SignIn routing="path" path="/login" fallbackRedirectUrl="/capture" />
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-mute">
              Clerk authentication is enabled!
            </p>
            <div className="rounded-xl border-thick border-ink bg-paper-2 p-4 text-xs font-mono text-left">
              Paste your keys into <code className="font-bold">.env</code>:
              <br />
              VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
              <br />
              CLERK_SECRET_KEY="sk_test_..."
            </div>
            <Link
              to="/capture"
              className="inline-flex h-10 items-center justify-center rounded-full bg-yolk px-5 font-display text-sm font-bold border-thick border-ink shadow-hard-sm"
            >
              Continue as Dev User
            </Link>
          </div>
        )}
      </div>
      <p className="mt-5 text-center text-sm text-mute">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-ink underline decoration-2 underline-offset-4">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link to="/signup" className="font-bold text-ink underline decoration-2 underline-offset-4">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
