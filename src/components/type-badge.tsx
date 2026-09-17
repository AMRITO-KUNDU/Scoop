import { cn } from "@/lib/utils";
import { TYPE_META, type ItemType, type TypeTone } from "@/lib/plan";

const TONE: Record<TypeTone, string> = {
  cyan: "bg-cyan text-ink",
  hot: "bg-hot text-paper",
  yolk: "bg-yolk text-ink",
  grape: "bg-grape text-paper",
};

export function TypeBadge({
  type,
  className,
}: {
  type: ItemType;
  className?: string;
}) {
  const meta = TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-thick border-ink px-2.5 py-0.5 font-display text-xs font-black uppercase tracking-wide",
        TONE[meta.tone],
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
