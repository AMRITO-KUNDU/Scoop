import { MapPin, Trash2 } from "lucide-react";
import { ITEM_TYPES, TYPE_META, type DraftItem, type ItemType } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TypeBadge } from "@/components/type-badge";

const TONE_ACTIVE: Record<ItemType, string> = {
  event: "bg-grape text-paper",
  deadline: "bg-hot text-paper",
  task: "bg-yolk text-ink",
  rsvp: "bg-cyan text-ink",
};

export function DraftCard({
  item,
  onChange,
  onRemove,
}: {
  item: DraftItem;
  onChange: (next: DraftItem) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof DraftItem>(key: K, value: DraftItem[K]) =>
    onChange({ ...item, [key]: value });

  return (
    <article className="panel p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <TypeBadge type={item.type} />
        <button
          type="button"
          onClick={onRemove}
          className="grid size-11 place-items-center rounded-xl border-thick border-ink bg-paper hover:bg-hot hover:text-paper"
          aria-label="Remove item"
        >
          <Trash2 className="size-4" strokeWidth={2.4} />
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {ITEM_TYPES.map((type) => {
          const active = item.type === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => set("type", type)}
              className={cn(
                "h-10 rounded-full border-thick border-ink px-3 font-display text-xs font-black uppercase tracking-wide",
                active ? TONE_ACTIVE[type] : "bg-paper text-ink hover:bg-paper-2",
              )}
            >
              {TYPE_META[type].label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`title-${item.key}`}>Title</Label>
          <Input
            id={`title-${item.key}`}
            value={item.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`date-${item.key}`}>Date</Label>
            <Input
              id={`date-${item.key}`}
              type="date"
              value={item.date ?? ""}
              onChange={(e) => set("date", e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`time-${item.key}`}>Time</Label>
            <Input
              id={`time-${item.key}`}
              type="time"
              value={item.time ?? ""}
              onChange={(e) => set("time", e.target.value || null)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`loc-${item.key}`}>Location</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
            <Input
              id={`loc-${item.key}`}
              className="pl-9"
              value={item.location ?? ""}
              onChange={(e) => set("location", e.target.value || null)}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`notes-${item.key}`}>Notes</Label>
          <Textarea
            id={`notes-${item.key}`}
            rows={2}
            value={item.notes ?? ""}
            onChange={(e) => set("notes", e.target.value || null)}
            placeholder="Optional"
          />
        </div>
      </div>
    </article>
  );
}
