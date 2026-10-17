import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Check, Loader2, RefreshCw, type LucideIcon } from "lucide-react";
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
  unavailable: "Unavailable",
  ready: "Not connected",
  connected: "Connected",
};

function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

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

    void (async () => {
      try {
        const rows = await getConnectors();
        if (!alive) return;
        setConnectors(rows);

        // Returning from Google? Say so, then quietly bring the plan across.
        if (new URLSearchParams(window.location.search).has("connectedAccountId")) {
          window.history.replaceState({}, "", window.location.pathname);
          toast.success("Google Calendar connected.");
        }

        const google = rows.find((row) => row.id === "googlecalendar");
        if (google?.state !== "connected" || google.pendingCount === 0) return;

        // Connected, and something is waiting — push it without being asked.
        try {
          const result = await syncPlanToCalendar({ data: { timezone: timezone() } });
          if (!alive || result.synced === 0) return;
          toast.success(
            `Synced ${result.synced} item${result.synced === 1 ? "" : "s"} to your calendar.`,
          );
          setConnectors(await getConnectors());
        } catch {
          // A sync hiccup shouldn't take the page down; the button still works.
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not load connectors.");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

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
      const result = await syncPlanToCalendar({ data: { timezone: timezone() } });
      if (result.synced === 0 && result.failed === 0) {
        toast.success("Everything is already in your calendar.");
      } else if (result.failed > 0) {
        toast.error(`Synced ${result.synced}, ${result.failed} failed. Try again in a moment.`);
      } else {
        toast.success(`Synced ${result.synced} item${result.synced === 1 ? "" : "s"}.`);
      }
      setConnectors(await getConnectors());
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
          {connector.syncedCount} in your calendar
          {connector.pendingCount > 0 ? ` · ${connector.pendingCount} syncing` : ""}
        </p>
      ) : null}

      {connector.state === "unavailable" ? (
        <p className="mt-4 text-xs font-medium text-mute">
          Not available on this account right now. Please try again later.
        </p>
      ) : connected ? (
        <div className="mt-5">
          <Button variant="paper" size="sm" onClick={onSync} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                Syncing…
              </>
            ) : (
              <>
                <RefreshCw className="size-4" strokeWidth={2.4} />
                Sync again
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <Button variant="yolk" size="lg" onClick={onConnect} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="size-5 animate-spin" strokeWidth={2.4} />
                Taking you to Google…
              </>
            ) : (
              <>
                <Icon className="size-5" strokeWidth={2.4} />
                Connect Google Calendar
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-mute">
            <Check className="size-3.5 shrink-0" strokeWidth={2.6} />
            One click — you'll approve access at Google, then you're done.
          </p>
        </div>
      )}
    </section>
  );
}
