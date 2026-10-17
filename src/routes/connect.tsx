import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Loader2, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import type { ConnectorId, ConnectorState, ConnectorStatus } from "@/lib/connectors";
import { connectGoogleCalendar, getConnectors, syncPlanToCalendar } from "@/lib/server/connectors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [{ title: "Connectors | SCOOP" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ConnectorsPage,
});

const CONNECTOR_ICON: Record<ConnectorId, LucideIcon> = {
  googlecalendar: CalendarPlus,
};

const STATE_LABEL: Record<ConnectorState, string> = {
  not_configured: "Not configured",
  ready: "Not connected",
  connected: "Connected",
};

function ConnectorsPage() {
  return (
    <AppShell>
      <ConnectorsScreen />
    </AppShell>
  );
}

function ConnectorsScreen() {
  const [connectors, setConnectors] = useState<ConnectorStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<ConnectorId | null>(null);

  useEffect(() => {
    let alive = true;
    void getConnectors()
      .then((rows) => {
        if (alive) setConnectors(rows);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "Could not load connectors.");
      });
    return () => {
      alive = false;
    };
  }, []);

  function refresh() {
    void getConnectors()
      .then(setConnectors)
      .catch(() => toast.error("Could not refresh connectors."));
  }

  async function onConnect(id: ConnectorId) {
    setBusy(id);
    try {
      const { url } = await connectGoogleCalendar();
      window.location.assign(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the connection.");
      setBusy(null);
    }
  }

  async function onSync(id: ConnectorId) {
    setBusy(id);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const result = await syncPlanToCalendar({ data: { timezone } });
      if (result.synced === 0 && result.failed === 0) {
        toast.success("Everything is already in your calendar.");
      } else if (result.failed > 0) {
        toast.error(`Synced ${result.synced}, ${result.failed} failed. Try again in a moment.`);
      } else {
        toast.success(`Synced ${result.synced} item${result.synced === 1 ? "" : "s"}.`);
      }
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sync to Google Calendar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <p className="sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper">
        Connectors
      </p>
      <h1 className="mt-3 font-display text-title font-black uppercase tracking-tight">
        Connectors.
      </h1>
      <p className="mt-2 max-w-lg text-sm font-medium text-mute">
        Link the services SCOOP works with. Connect one and it keeps itself in step with your plan.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border-thick border-ink bg-hot/15 px-3 py-2 text-sm font-semibold">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4">
        {connectors
          ? connectors.map((connector) => (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                busy={busy === connector.id}
                onConnect={() => void onConnect(connector.id)}
                onSync={() => void onSync(connector.id)}
              />
            ))
          : [0, 1].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border-thick border-ink bg-paper-2"
              />
            ))}
      </div>

      <p className="mt-6 text-xs font-medium text-mute">
        More connectors are on the way. Tell us which one you want next.
      </p>
    </div>
  );
}

function ConnectorCard({
  connector,
  busy,
  onConnect,
  onSync,
}: {
  connector: ConnectorStatus;
  busy: boolean;
  onConnect: () => void;
  onSync: () => void;
}) {
  const Icon = CONNECTOR_ICON[connector.id];
  const connected = connector.state === "connected";

  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-xl border-thick border-ink shadow-hard-sm",
              connected ? "bg-cyan" : "bg-paper-2",
            )}
          >
            <Icon className="size-5" strokeWidth={2.4} />
          </span>
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight">
              {connector.name}
            </h2>
            <p className="text-sm font-medium text-mute">{connector.description}</p>
          </div>
        </div>
        <span
          className={cn(
            "sticker shrink-0 rounded-full px-3 py-1 text-xs",
            connected ? "bg-cyan" : "bg-paper-2",
          )}
        >
          {STATE_LABEL[connector.state]}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-mute">{connector.detail}</p>

      {connected ? (
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-mute">
          {connector.syncedCount} synced · {connector.pendingCount} waiting
        </p>
      ) : null}

      {connector.state === "not_configured" ? (
        <div className="mt-4 space-y-2">
          {connector.requires.map((name) => (
            <EnvRow key={name} name={name} hint={envHint(name)} />
          ))}
          <p className="text-xs font-medium text-mute">
            Add these to your environment, then reload this page.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          {connected ? (
            <Button variant="ink" onClick={onSync} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                  Syncing…
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" strokeWidth={2.4} />
                  Sync to Google Calendar
                </>
              )}
            </Button>
          ) : (
            <Button variant="yolk" onClick={onConnect} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                  Opening Google…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" strokeWidth={2.4} />
                  Connect Google Calendar
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function envHint(name: string) {
  if (name === "COMPOSIO_API_KEY") return "from app.composio.dev → API keys";
  if (name === "COMPOSIO_GCAL_AUTH_CONFIG_ID") return "ac_… for the Google Calendar auth config";
  return "";
}

function EnvRow({ name, hint }: { name: string; hint: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-thick border-ink bg-paper-2 px-3 py-2">
      <code className="min-w-0 flex-1 truncate font-display text-sm font-bold">{name}</code>
      {hint ? <span className="hidden text-xs font-medium text-mute sm:inline">{hint}</span> : null}
    </div>
  );
}
