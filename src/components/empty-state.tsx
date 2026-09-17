import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 grid size-16 place-items-center rounded-full border-thick border-ink bg-yolk shadow-hard-sm">
        {icon}
      </div>
      <h3 className="font-display text-xl font-black tracking-tight uppercase">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
