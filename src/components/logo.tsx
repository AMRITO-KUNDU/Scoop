import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-9 shrink-0", className)} aria-hidden>
      <span className="sq-shape absolute inset-0 translate-x-1 translate-y-1 rounded-md bg-cyan" />
      <span className="relative grid size-9 place-items-center rounded-md border-thick border-ink bg-yolk">
        <span className="font-display text-lg font-black leading-none text-ink">
          S
        </span>
      </span>
    </span>
  );
}

export function Wordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Logo />
      <span
        className={cn(
          "font-display text-xl font-black tracking-tight text-ink",
          compact && "max-lg:hidden",
        )}
      >
        SCOOP
      </span>
    </span>
  );
}
