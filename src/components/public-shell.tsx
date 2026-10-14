import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ScanText } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const FOOTER_LINKS = [
  { to: "/how-it-works" as const, label: "How it works" },
  { to: "/about" as const, label: "About" },
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
];

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-thick border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" aria-label="SCOOP home" className="shrink-0">
          <Wordmark />
        </Link>
        <AccountMenu showSignup={false} />
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t-thick border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-sm font-black uppercase tracking-tight">
          Paste the chaos. Get the plan.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-display text-xs font-bold uppercase tracking-wider text-mute hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/**
 * Public (marketing / legal) page shell: a sticky header with the wordmark and
 * account controls, and a footer linking the public pages. Used by every route
 * that is meant to be crawled — unlike `AppShell`, it never gates on sign-in.
 */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

/** Panel section used by the legal pages (privacy, terms). */
export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="panel p-6">
      <h2 className="font-display text-xl font-black uppercase tracking-tight">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-mute">{children}</div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  tone = "bg-cyan",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: string;
}) {
  return (
    <section className="border-b-thick border-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className={`sticker inline-flex rounded-full px-3 py-1 text-xs ${tone}`}>{eyebrow}</p>
        <h1 className="mt-4 font-display text-title font-black uppercase tracking-tight">{title}</h1>
        {lead ? <p className="mt-3 max-w-xl text-lead font-medium text-mute">{lead}</p> : null}
      </div>
    </section>
  );
}

export function CtaBand() {
  const { user, isPending } = useCurrentUserState();
  const destination = !isPending && user ? "/capture" : "/signup";

  return (
    <section className="border-b-thick border-ink bg-grape px-4 py-14 text-paper">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-title font-black uppercase tracking-tight">
          Stop carrying it
          <br />
          alone.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium text-paper/85">
          Sign up, paste the next school email, and keep the plan in one place.
        </p>
        <Button asChild size="lg" variant="yolk" className="mt-8">
          <Link to={destination}>
            Start with SCOOP
            <ScanText className="size-5" strokeWidth={2.4} />
          </Link>
        </Button>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-paper/70">
          No credit card. Works on your phone.
        </p>
      </div>
    </section>
  );
}
