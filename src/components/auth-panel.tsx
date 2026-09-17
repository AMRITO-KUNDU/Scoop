import { useState, type FormEvent } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/logo";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.06-1.28-.2-1.84H12v3.34h5.5c-.11.9-.72 2.26-2.07 3.17l-.02.12 3 2.3.21.02c1.9-1.75 3-4.33 3-7.11z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.15-2.42c-.85.6-1.99 1.02-3.47 1.02-2.65 0-4.9-1.75-5.7-4.17l-.12.01-3.08 2.38-.04.11C4.67 19.98 8.09 22 12 22z"
      />
      <path
        fill="currentColor"
        d="M6.3 13.99A5.99 5.99 0 0 1 6 12c0-.69.11-1.36.29-1.99l-.01-.13-3.12-2.42-.1.05A9.98 9.98 0 0 0 2 12c0 1.61.39 3.13 1.06 4.49l3.24-2.5z"
      />
      <path
        fill="currentColor"
        d="M12 5.84c1.88 0 3.15.81 3.87 1.49l2.83-2.76C16.95 2.91 14.7 2 12 2 8.09 2 4.67 4.02 3.06 7.51l3.22 2.5C7.1 7.59 9.35 5.84 12 5.84z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.84 7.82L23.2 22h-6.5l-5.09-6.65L5.2 22H2.08l7.32-8.36L.8 2h6.66l4.6 6.08L18.9 2Zm-1.14 18h1.8L6.33 3.91H4.4L17.76 20Z"
      />
    </svg>
  );
}

function ProviderIcon({ label }: { label: string }) {
  if (label === "Google") return <GoogleMark />;
  if (label === "X") return <XMark />;
  return null;
}

export function AuthPanel({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignup) {
        const { error: err } = await authClient.signUp.email({
          name: name.trim() || email.split("@")[0],
          email,
          password,
        });
        if (err) throw new Error(err.message ?? "Could not create account.");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message ?? "Could not sign in.");
      }
      try {
        await authClient.getSession();
      } catch {
        /* store recovers */
      }
      await router.invalidate();
      await navigate({ to: "/capture" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link to="/" className="mb-8 inline-flex">
        <Wordmark />
      </Link>
      <div className="panel rotate-1 p-6 sm:p-8">
        <p className="sticker mb-3 inline-flex rounded-full bg-cyan px-3 py-1 text-xs">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">
          {isSignup ? "Get organised" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm font-medium text-mute">
          {isSignup
            ? "Get your family organised with SCOOP."
            : "Sign in to your SCOOP account."}
        </p>

        {authEnabled ? (
          <div className="mt-6 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                variant="paper"
                className="w-full"
                onClick={() => {
                  void signIn(p.providerId, { callbackURL: "/capture" }).catch(
                    (err: unknown) =>
                      setError(err instanceof Error ? err.message : "Sign-in failed."),
                  );
                }}
              >
                <ProviderIcon label={p.label} />
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-mute">Sign-in is disabled.</p>
        )}

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-ink" />
          <span className="text-xs font-bold uppercase tracking-wider text-mute">
            or email
          </span>
          <span className="h-px flex-1 bg-ink" />
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          {isSignup ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          {error ? (
            <p className="rounded-xl border-thick border-ink bg-hot/15 px-3 py-2 text-sm font-semibold">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Working…" : isSignup ? "Start your SCOOP" : "Sign in"}
          </Button>
        </form>
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
