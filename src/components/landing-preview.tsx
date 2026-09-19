import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { TypeBadge } from "@/components/type-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_CHIPS, LANDING_CHIPS } from "@/lib/examples";
import { localExtract } from "@/lib/local-extract";
import { formatWhen } from "@/lib/plan";
import { cn } from "@/lib/utils";

import { useCurrentUserState } from "@/lib/auth/use-current-user";

const DEMO_CHIPS = LANDING_CHIPS.length ? LANDING_CHIPS : EXAMPLE_CHIPS.slice(0, 4);

export function LandingPreview() {
  const { user, isPending } = useCurrentUserState();
  const destination = !isPending && user ? "/capture" : "/signup";
  const [text, setText] = useState(DEMO_CHIPS[0]?.text ?? "");
  const [active, setActive] = useState<string | null>(DEMO_CHIPS[0]?.id ?? null);
  const [sorted, setSorted] = useState(false);

  const items = useMemo(() => localExtract(text).slice(0, 4), [text]);

  return (
    <div className="relative mx-auto w-full max-w-md px-2 pt-3 lg:max-w-none">
      <div className="sticker absolute top-0 left-3 z-10 rotate-[-8deg] rounded-full bg-hot px-3 py-1 text-xs text-paper">
        Live demo
      </div>

      <div className="panel overflow-hidden bg-paper">
        <div className="flex items-center justify-between border-b-thick border-ink bg-yolk px-4 py-3">
          <span className="font-display text-sm font-black uppercase tracking-wide">
            Dump the chaos
          </span>
          <span className="rounded-full border-thick border-ink bg-paper px-2.5 py-0.5 text-xs font-black uppercase tracking-wide">
            Ready
          </span>
        </div>

        <div className="space-y-3 p-4">
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setActive(null);
              setSorted(false);
            }}
            rows={5}
            placeholder="Paste any school email, WhatsApp message, newsletter or flyer text…"
            className="min-h-28 text-sm"
          />

          <div className="flex flex-wrap gap-2">
            {DEMO_CHIPS.map((chip) => {
              const on = active === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setText(chip.text);
                    setActive(chip.id);
                    setSorted(false);
                  }}
                  className={cn(
                    "h-10 rounded-full border-thick border-ink px-3 font-display text-sm font-bold shadow-hard-sm",
                    on ? "bg-yolk" : "bg-paper hover:bg-paper-2",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={text.trim().length < 8}
            onClick={() => setSorted(true)}
          >
            Sort it for me
            <ArrowRight className="size-5" strokeWidth={2.6} />
          </Button>

          {sorted ? (
            <div className="space-y-3 border-t-thick border-ink pt-4">
              <p className="font-display text-xs font-black uppercase tracking-widest text-mute">
                We made a plan!
              </p>
              {items.length ? (
                items.map((item) => (
                  <div
                    key={`${item.type}-${item.title}`}
                    className="rounded-xl border-thick border-ink bg-paper-2 p-3 shadow-hard-sm"
                  >
                    <TypeBadge type={item.type} />
                    <p className="mt-2 font-display text-base font-bold leading-snug tracking-tight">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-mute">
                      {formatWhen(item)}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-mute">
                  Nothing to pull from that one — try a chip.
                </p>
              )}
              {items.length ? (
                <Button asChild variant="ink" className="w-full" size="lg">
                  <Link to={destination}>
                    Looks Good — save my plan
                    <Sparkles className="size-4" strokeWidth={2.4} />
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
