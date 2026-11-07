import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { TYPE_META, type PlanItem } from "@/lib/plan";
import { cn } from "@/lib/utils";

/** Colour per item type, matching the badges everywhere else. */
const TONE: Record<string, string> = {
  event: "bg-grape text-paper",
  deadline: "bg-hot text-paper",
  task: "bg-yolk text-ink",
  rsvp: "bg-cyan text-ink",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHIPS_PER_DAY = 3;

function iso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** Every day an item covers, so a four-day closure shows on four squares. */
function daysCovered(item: PlanItem): string[] {
  if (!item.date) return [];
  const start = new Date(`${item.date}T00:00:00`);
  if (Number.isNaN(start.getTime())) return [];

  const end = item.endDate ? new Date(`${item.endDate}T00:00:00`) : start;
  const last = !Number.isNaN(end.getTime()) && end > start ? end : start;

  const days: string[] = [];
  const cursor = new Date(start);
  // A runaway range should not lock up the render.
  for (let i = 0; i < 90 && cursor <= last; i += 1) {
    days.push(iso(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function MonthCalendar({
  month,
  items,
  onMonthChange,
  onToday,
  onEditItem,
}: {
  /** Any date inside the month being shown. */
  month: Date;
  items: PlanItem[];
  onMonthChange: (next: Date) => void;
  onToday: () => void;
  onEditItem: (item: PlanItem) => void;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  // Monday-first grid, padded to whole weeks.
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);

  const byDay = new Map<string, PlanItem[]>();
  for (const item of items) {
    for (const day of daysCovered(item)) {
      const list = byDay.get(day) ?? [];
      list.push(item);
      byDay.set(day, list);
    }
  }

  const todayIso = iso(new Date());
  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  return (
    <section className="panel overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b-thick border-ink px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4" strokeWidth={2.6} />
          <h2 className="font-display text-base font-black uppercase tracking-tight">
            {monthLabel}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="grid size-9 place-items-center rounded-full border-thick border-ink bg-paper hover:bg-paper-2"
          >
            <ChevronLeft className="size-4" strokeWidth={2.6} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="h-9 rounded-full border-thick border-ink bg-paper px-3 font-display text-xs font-bold hover:bg-paper-2"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            aria-label="Next month"
            className="grid size-9 place-items-center rounded-full border-thick border-ink bg-paper hover:bg-paper-2"
          >
            <ChevronRight className="size-4" strokeWidth={2.6} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b-thick border-ink bg-paper-2">
        {WEEKDAYS.map((day) => (
          <p
            key={day}
            className="px-1 py-1.5 text-center font-display text-[10px] font-black uppercase tracking-widest text-mute"
          >
            {day}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((date) => {
          const key = iso(date);
          const inMonth = date.getMonth() === month.getMonth();
          const isToday = key === todayIso;
          const dayItems = byDay.get(key) ?? [];
          const shown = dayItems.slice(0, CHIPS_PER_DAY);

          return (
            <div
              key={key}
              className={cn(
                "min-h-24 border-r border-b border-ink/15 p-1.5 last:border-r-0",
                !inMonth && "bg-paper-2/60",
              )}
            >
              <p
                className={cn(
                  "mb-1 inline-grid size-6 place-items-center rounded-full font-display text-[11px] font-black",
                  !inMonth && "text-mute",
                  isToday && "bg-ink text-paper",
                )}
              >
                {date.getDate()}
              </p>

              <div className="space-y-1">
                {shown.map((item) => (
                  <button
                    key={`${key}-${item.id}`}
                    type="button"
                    onClick={() => onEditItem(item)}
                    title={`${item.title} · ${TYPE_META[item.type].label}`}
                    className={cn(
                      "block w-full truncate rounded-md border border-ink px-1 py-0.5 text-left font-display text-[10px] font-bold",
                      TONE[item.type],
                      item.done && "opacity-50 line-through",
                    )}
                  >
                    {item.title}
                  </button>
                ))}
                {dayItems.length > shown.length ? (
                  <p className="px-1 text-[10px] font-bold text-mute">
                    +{dayItems.length - shown.length} more
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
