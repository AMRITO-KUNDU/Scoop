import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Check, MapPin, ScanText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import {
  formatWhen,
  matchesFilter,
  type PlanFilter,
  type PlanItem,
} from "@/lib/plan";
import {
  deletePlanItem,
  listPlanItems,
  setPlanItemDone,
} from "@/lib/server/plan-items";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({ component: PlanPage });

const FILTERS: { id: PlanFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "all", label: "All" },
];

function PlanPage() {
  return (
    <AppShell>
      <PlanScreen />
    </AppShell>
  );
}

function PlanScreen() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PlanFilter>("all");

  async function reload() {
    try {
      const rows = await listPlanItems();
      setItems(rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load plan.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const visible = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter],
  );

  async function toggleDone(item: PlanItem) {
    const next = !item.done;
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, done: next } : row)),
    );
    try {
      await setPlanItemDone({ data: { id: item.id, done: next } });
    } catch {
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, done: item.done } : row)),
      );
      toast.error("Couldn’t update that item.");
    }
  }

  async function remove(item: PlanItem) {
    const snapshot = items;
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    try {
      await deletePlanItem({ data: { id: item.id } });
    } catch {
      setItems(snapshot);
      toast.error("Couldn’t delete that item.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper">
          Plan
        </p>
        <h1 className="mt-3 font-display text-title font-black uppercase tracking-tight">
          Your plan.
        </h1>
        <p className="mt-1 text-sm font-medium text-mute">
          What’s on — today, this week, or everything.
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-full border-thick border-ink bg-paper p-1 shadow-hard-sm">
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-10 rounded-full px-4 font-display text-sm font-black",
                on ? "bg-cyan text-ink" : "text-ink hover:bg-paper-2",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" />
          <div className="h-24 animate-pulse rounded-2xl border-thick border-ink bg-paper-2" />
        </div>
      ) : visible.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<CalendarDays className="size-6" strokeWidth={2.4} />}
            title={items.length ? "Nothing in this view" : "Your plan is empty"}
            body={
              items.length
                ? "Try another filter, or capture a new message."
                : "Dump a school message and add the bits that matter."
            }
            action={
              <Button asChild variant="yolk">
                <Link to="/capture">
                  <ScanText className="size-4" strokeWidth={2.4} />
                  Go to Capture
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li key={item.id} className="panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <TypeBadge type={item.type} />
                  <h2
                    className={cn(
                      "mt-2 font-display text-lg font-bold tracking-tight",
                      item.done && "text-mute line-through",
                    )}
                  >
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-mute tabular-nums">
                    {formatWhen(item)}
                  </p>
                  {item.location ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-mute">
                      <MapPin className="size-3.5 shrink-0" />
                      {item.location}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => void toggleDone(item)}
                    className={cn(
                      "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink px-3 font-display text-sm font-bold sm:flex-none",
                      item.done ? "bg-yolk" : "bg-paper hover:bg-paper-2",
                    )}
                  >
                    <Check className="size-4" strokeWidth={2.6} />
                    {item.done ? "Done" : "Mark done"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border-thick border-ink bg-paper px-3 font-display text-sm font-bold hover:bg-hot hover:text-paper sm:flex-none"
                  >
                    <Trash2 className="size-4" strokeWidth={2.4} />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
