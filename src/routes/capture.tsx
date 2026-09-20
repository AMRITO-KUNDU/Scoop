import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DraftCard } from "@/components/draft-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_CHIPS } from "@/lib/examples";
import type { DraftItem } from "@/lib/plan";
import { extractItems, type ExtractEngine } from "@/lib/server/extract";
import { getIntegrationsStatus } from "@/lib/server/integrations";
import { addPlanItems } from "@/lib/server/plan-items";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/capture")({ component: CapturePage });

function newKey() {
  return crypto.randomUUID();
}

function engineLabel(engine: ExtractEngine | null): string {
  if (engine === "groq") return "Extracted with Groq";
  if (engine === "grok") return "Extracted with Grok";
  if (engine === "local") return "Extracted on-device";
  return "Review";
}

function CapturePage() {
  return (
    <AppShell>
      <CaptureScreen />
    </AppShell>
  );
}

function CaptureScreen() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [engine, setEngine] = useState<ExtractEngine | null>(null);
  const [liveEngine, setLiveEngine] = useState<"groq" | "grok" | "local">("local");

  const canExtract = text.trim().length >= 8 && !extracting;
  const showEmpty = !extracting && drafts === null && text.trim().length === 0;

  useEffect(() => {
    let alive = true;
    void getIntegrationsStatus()
      .then((status) => {
        if (!alive) return;
        if (status.groq.wired) setLiveEngine("groq");
        else if (status.grok.wired) setLiveEngine("grok");
        else setLiveEngine("local");
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onExtract() {
    if (!canExtract) return;
    setExtracting(true);
    setDrafts(null);
    setEngine(null);
    try {
      const result = await extractItems({ data: { text } });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.warning) {
        toast.error(result.warning);
      }
      if (!result.items.length) {
        toast.error("Nothing to pull from that message.");
        setDrafts([]);
        return;
      }
      setEngine(result.engine);
      setDrafts(result.items.map((item) => ({ ...item, key: newKey() })));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Extract failed.";
      if (message === "Unauthorized") {
        await navigate({ to: "/login" });
        return;
      }
      toast.error(message);
    } finally {
      setExtracting(false);
    }
  }

  async function onAddToPlan() {
    if (!drafts?.length) return;
    setSaving(true);
    try {
      await addPlanItems({
        data: {
          items: drafts.map(({ key: _key, ...item }) => item),
        },
      });
      toast.success("Added to your plan.");
      await navigate({ to: "/plan" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not add items.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const readingCopy =
    liveEngine === "groq"
      ? "Groq is reading this."
      : liveEngine === "grok"
        ? "Grok is reading this."
        : "Pulling out the dates.";

  return (
    <div>
      <div className="mb-6">
        <p className="sticker inline-flex rounded-full bg-cyan px-3 py-1 text-xs">
          Capture
        </p>
        <h1 className="mt-3 font-display text-title font-black uppercase tracking-tight">
          Dump the chaos.
        </h1>
        <p className="mt-2 max-w-lg text-sm font-medium text-mute">
          Paste a school email, WhatsApp, newsletter or flyer. We’ll make the
          plan.
        </p>
      </div>

      <div className="panel overflow-hidden">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActiveChip(null);
          }}
          rows={9}
          placeholder="Paste any school email, WhatsApp message, newsletter or flyer text…"
          className="min-h-48 rounded-none border-0 shadow-none focus:shadow-none sm:min-h-56 sm:text-base"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((chip) => {
          const on = activeChip === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setText(chip.text);
                setActiveChip(chip.id);
                setDrafts(null);
                setEngine(null);
              }}
              className={cn(
                "h-11 rounded-full border-thick border-ink px-3.5 font-display text-sm font-bold shadow-hard-sm",
                on ? "bg-yolk" : "bg-paper hover:bg-paper-2",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <Button
        className="mt-5 w-full sm:w-auto sm:min-w-56"
        size="lg"
        disabled={!canExtract}
        onClick={() => void onExtract()}
      >
        {extracting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Making a plan…
          </>
        ) : (
          <>
            Extract
            <ArrowRight className="size-5" strokeWidth={2.6} />
          </>
        )}
      </Button>

      {showEmpty ? (
        <section className="mt-10">
          <div className="panel">
            <EmptyState
              icon={<Sparkles className="size-6" strokeWidth={2.4} />}
              title="Nothing pasted yet"
              body="Drop in a messy school email or tap a chip above. We’ll pull out events, deadlines, tasks and RSVPs."
            />
          </div>
        </section>
      ) : null}

      {extracting ? (
        <section className="mt-10" aria-live="polite">
          <div className="panel rotate-1 bg-yolk p-8 text-center">
            <Loader2 className="mx-auto size-10 animate-spin" />
            <p className="mt-4 font-display text-2xl font-black uppercase tracking-tight">
              Making a plan…
            </p>
            <p className="mt-1 text-sm font-medium">{readingCopy}</p>
          </div>
        </section>
      ) : null}

      {drafts ? (
        <section className="mt-10 space-y-4">
          <div>
            <p className="sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper">
              {engineLabel(engine)}
            </p>
            <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-tight">
              {drafts.length ? "We made a plan!" : "No items found"}
            </h2>
            {drafts.length ? (
              <p className="mt-1 text-sm font-medium text-mute">
                {drafts.length} item{drafts.length === 1 ? "" : "s"} — tweak
                anything before it goes in.
              </p>
            ) : (
              <p className="mt-1 text-sm font-medium text-mute">
                Try another excerpt, or tap a chip for a working example.
              </p>
            )}
          </div>
          {drafts.map((item) => (
            <DraftCard
              key={item.key}
              item={item}
              onChange={(next) =>
                setDrafts((prev) =>
                  prev ? prev.map((d) => (d.key === item.key ? next : d)) : prev,
                )
              }
              onRemove={() =>
                setDrafts((prev) =>
                  prev ? prev.filter((d) => d.key !== item.key) : prev,
                )
              }
            />
          ))}
          {drafts.length ? (
            <Button
              variant="ink"
              size="lg"
              className="w-full"
              disabled={saving}
              onClick={() => void onAddToPlan()}
            >
              {saving ? "Adding…" : "Looks Good – Add to Plan"}
            </Button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
