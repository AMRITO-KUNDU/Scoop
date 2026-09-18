import { useState, type FormEvent } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { GoogleMark, XMark } from "@/components/brand-marks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/logo";

function ProviderIcon({ label }: { label: string }) {
  if (label === "Google") return <GoogleMark className="size-5" />;
  if (label === "X") return <XMark className="size-4" />;
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
            ? "Real Google, X, or email. Your plan stays with your account."
            : "Google, X, or the email you signed up with."}
        </p>

        {authEnabled ? (
          <div className="mt-6 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                variant={p.label === "Google" ? "yolk" : "paper"}
                className="w-full"
                size="lg"
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
          <Button type="submit" className="w-full" size="lg" disabled={busy} variant="ink">
            {busy ? "Working…" : isSignup ? "Start your SCOOP" : "Sign in with email"}
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
