import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Database, KeyRound, Sparkles, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getIntegrationsStatus } from "@/lib/server/integrations";
import type { ServiceStatus } from "@/lib/integrations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/connect")({ component: ConnectPage });

function ConnectPage() {
  return (
    <AppShell>
      <ConnectScreen />
    </AppShell>
  );
}

function ConnectScreen() {
  const [services, setServices] = useState<ServiceStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void getIntegrationsStatus()
      .then((status) => {
        if (!alive) return;
        setServices([status.google, status.neon, status.groq, status.grok]);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Could not load status.");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <p className="sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper">
        Stack
      </p>
      <h1 className="mt-3 font-display text-title font-black uppercase tracking-tight">
        The real product stack.
      </h1>
      <p className="mt-2 max-w-lg text-sm font-medium text-mute">
        Paste keys into the nested <code className="font-bold">env</code> object
        in the app env file, or the host env. Empty values stay off. Restart
        after you paste.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border-thick border-ink bg-hot/15 px-3 py-2 text-sm font-semibold">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4">
        {services
          ? services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          : [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border-thick border-ink bg-paper-2"
              />
            ))}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceStatus }) {
  const Icon =
    service.id === "google"
      ? KeyRound
      : service.id === "neon"
        ? Database
        : service.id === "groq"
          ? Zap
          : Sparkles;
  const tone =
    service.id === "google"
      ? "bg-cyan"
      : service.id === "neon"
        ? "bg-yolk"
        : service.id === "groq"
          ? "bg-hot text-paper"
          : "bg-grape text-paper";

  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-xl border-thick border-ink shadow-hard-sm",
              tone,
            )}
          >
            <Icon className="size-5" strokeWidth={2.4} />
          </span>
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight">
              {service.label}
            </h2>
            <p className="text-sm font-medium text-mute">{service.detail}</p>
          </div>
        </div>
        <span
          className={cn(
            "sticker shrink-0 rounded-full px-3 py-1 text-xs",
            service.wired ? "bg-cyan" : "bg-paper-2",
          )}
        >
          {service.wired ? "Live" : "Waiting"}
        </span>
      </div>

      {service.envVar ? (
        <div className="mt-4 space-y-2">
          <EnvRow name={service.envVar} hint={envHint(service.envVar)} />
          {service.extraEnvVar ? (
            <EnvRow
              name={service.extraEnvVar}
              hint="optional — defaults to llama-3.3-70b-versatile"
            />
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border-thick border-ink bg-paper-2 px-3 py-2 text-sm font-semibold">
          Continue with Google is already on. Email and X work too.
        </p>
      )}
    </section>
  );
}

function envHint(name: string) {
  if (name === "DATABASE_URL") return "postgres://…neon.tech/…?sslmode=require";
  if (name === "GROQ_API_KEY") return "gsk_… from console.groq.com";
  if (name === "XAI_API_KEY") return "injected automatically when available";
  return "";
}

function EnvRow({ name, hint }: { name: string; hint: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-xl border-thick border-ink bg-paper-2 px-3 py-2">
      <code className="min-w-0 flex-1 truncate font-display text-sm font-bold">
        {name}
      </code>
      {hint ? (
        <span className="hidden text-xs font-medium text-mute sm:inline">{hint}</span>
      ) : null}
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-lg border-thick border-ink bg-paper hover:bg-yolk"
        aria-label={`Copy ${name}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(name);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? (
          <Check className="size-4" strokeWidth={2.6} />
        ) : (
          <Copy className="size-4" strokeWidth={2.4} />
        )}
      </button>
    </div>
  );
}
