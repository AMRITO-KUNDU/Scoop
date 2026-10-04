import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <span
        className="grid size-16 place-items-center rounded-full border-thick border-ink bg-hot text-paper shadow-hard-sm"
        aria-hidden
      >
        <TriangleAlert className="size-7" strokeWidth={2.4} />
      </span>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm break-words text-mute">{errorMessage(error)}</p>
    </main>
  );
}
