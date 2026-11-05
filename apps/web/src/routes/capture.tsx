import { useState, type ClipboardEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { DraftCard } from "@/components/draft-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DraftItem } from "@/lib/plan";
import { extractItems, type ExtractEngine } from "@/lib/server/extract";
import { addPlanItems } from "@/lib/server/plan-items";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [{ title: "Capture | SCOOP" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CapturePage,
});

function newKey() {
  return crypto.randomUUID();
}

function engineLabel(engine: ExtractEngine | null): string {
  return engine ? "Read by SCOOP" : "Review";
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
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [engine, setEngine] = useState<ExtractEngine | null>(null);
  // A pasted message is a document, not a form field. Collapse it into a card so
  // the screen still reads as a form.
  const [collapsed, setCollapsed] = useState(false);

  const canExtract = text.trim().length >= 8 && !extracting;
  const showEmpty = !extracting && drafts === null && text.trim().length === 0;

  async function onExtract() {
    if (!canExtract) return;
    setExtracting(true);
    setDrafts(null);
    setEngine(null);
    try {
      const result = await extractItems({ data: { text } });
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
      const result = await addPlanItems({
        data: {
          items: drafts.map(({ key: _key, ...item }) => item),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      const synced = result.synced ? ` ${result.synced} synced.` : "";
      if (result.added === 0) {
        toast.error("These items are already in your plan.");
      } else if (result.added < drafts.length) {
        toast.success(
          `${result.added} new item(s) added to your plan. ${drafts.length - result.added} duplicate(s) skipped.${synced}`,
        );
      } else {
        toast.success(`Added to your plan.${synced}`);
      }
      await navigate({ to: "/plan" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not add items.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const trimmed = text.trim();
  const charCount = trimmed.length;
  const lineCount = trimmed ? trimmed.split(/\n+/).length : 0;
  const preview = trimmed.split(/\n+/)[0]?.slice(0, 90) ?? "";

  /** Long pastes become a card instead of a wall of text in the box. */
  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    if (pasted.trim().length < 200) return;
    e.preventDefault();
    setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${pasted}` : pasted));
    setDrafts(null);
    setEngine(null);
    setCollapsed(true);
  }

  function clearMessage() {
    setText("");
    setCollapsed(false);
    setDrafts(null);
    setEngine(null);
  }

  return (
    <div>
      <div className="mb-6">
        <p className="sticker inline-flex rounded-full bg-cyan px-3 py-1 text-xs">Capture</p>
        <h1 className="mt-3 font-display text-title font-black uppercase tracking-tight">
          Dump the chaos.
        </h1>
        <p className="mt-2 max-w-lg text-sm font-medium text-mute">
          Paste a school email, WhatsApp, newsletter or flyer. We’ll make the plan.
        </p>
      </div>

      {collapsed ? (
        <div className="panel flex items-start gap-3 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border-thick border-ink bg-cyan">
            <FileText className="size-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-black uppercase tracking-tight">
              Pasted message
            </p>
            <p className="mt-1 truncate text-sm font-medium text-mute">{preview}…</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-mute">
              {charCount.toLocaleString()} characters · {lineCount} line
              {lineCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="h-9 rounded-full border-thick border-ink bg-paper px-3 font-display text-xs font-bold hover:bg-paper-2"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={clearMessage}
              className="h-9 rounded-full border-thick border-ink bg-paper px-3 font-display text-xs font-bold hover:bg-hot hover:text-paper"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <Label htmlFor="capture-text" className="sr-only">
            Paste a school message
          </Label>
          <Textarea
            id="capture-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            rows={9}
            placeholder="Paste any school email, WhatsApp message, newsletter or flyer text…"
            className="min-h-48 rounded-none border-0 shadow-none focus:shadow-none sm:min-h-56 sm:text-base"
          />
        </div>
      )}

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
              body="Drop in a messy school email, a group chat or a flyer. We’ll pull out the events, deadlines, tasks and RSVPs."
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
            <p className="mt-1 text-sm font-medium">Pulling out the dates.</p>
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
                {drafts.length} item{drafts.length === 1 ? "" : "s"} — tweak anything before it goes
                in.
              </p>
            ) : (
              <p className="mt-1 text-sm font-medium text-mute">
                Try a shorter excerpt — the important part of the message usually works best.
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
                setDrafts((prev) => (prev ? prev.filter((d) => d.key !== item.key) : prev))
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
