import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarCheck,
  ClipboardPaste,
  Mail,
  ScanText,
  Share2,
  Smartphone,
} from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { LandingPreview } from "@/components/landing-preview";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  {
    num: "01",
    title: "Dump the chaos",
    body: "Paste a WhatsApp message, forward a school email, or type what’s in your head.",
    tone: "bg-cyan",
    tilt: "-rotate-1",
  },
  {
    num: "02",
    title: "AI makes sense of it",
    body: "SCOOP pulls out events, deadlines, tasks and RSVPs you can edit.",
    tone: "bg-hot text-paper",
    tilt: "rotate-1",
  },
  {
    num: "03",
    title: "Your family gets the plan",
    body: "One tap to confirm. Into your plan — tick things off when they’re done.",
    tone: "bg-grape text-paper",
    tilt: "-rotate-1",
  },
];

const FEATURES = [
  { icon: Mail, title: "School emails", tone: "bg-cyan" },
  { icon: CalendarCheck, title: "Events & deadlines", tone: "bg-hot text-paper" },
  { icon: Bell, title: "RSVPs & slips", tone: "bg-yolk" },
  { icon: ClipboardPaste, title: "WhatsApp chaos", tone: "bg-grape text-paper" },
  { icon: Smartphone, title: "Phone-first", tone: "bg-cyan" },
  { icon: Share2, title: "Share the load", tone: "bg-hot text-paper" },
];

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (user) return <Navigate to="/capture" />;
  return <Landing pending={isPending} />;
}

function Landing({ pending = false }: { pending?: boolean }) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b-thick border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="SCOOP">
            <Wordmark />
          </Link>
          {pending ? (
            <div className="h-10 w-24 animate-pulse rounded-xl border-thick border-ink bg-paper-2" />
          ) : (
            <AccountMenu showSignup={false} />
          )}
        </div>
      </header>

      <main>
        <section className="relative border-b-thick border-ink">
          <span className="dot-shape absolute top-10 right-8 hidden size-8 bg-hot sm:block" />
          <span className="sq-shape absolute bottom-16 left-6 hidden size-7 rotate-12 bg-cyan md:block" />
          <span className="dot-shape absolute top-1/2 right-1/4 hidden size-4 bg-yolk lg:block" />

          <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
            <div>
              <p className="sticker mb-5 inline-flex items-center rounded-full bg-paper px-3 py-1 text-xs">
                The family admin app
              </p>
              <h1 className="font-display text-display font-black uppercase leading-[0.9] tracking-tight">
                Stop
                <br />
                sweating the
                <br />
                <span className="text-grape">school stuff.</span>
              </h1>
              <p className="mt-5 max-w-md text-lead font-medium">
                SCOOP turns school letters, party invites and WhatsApp chaos into
                a calm family plan — in seconds.
              </p>
              <Button asChild size="lg" variant="yolk" className="mt-8">
                <Link to="/signup">
                  Start your SCOOP
                  <ScanText className="size-5" strokeWidth={2.4} />
                </Link>
              </Button>
              <p className="mt-4 text-sm font-medium text-mute">
                Paste the chaos. Get the plan.
              </p>
            </div>
            <LandingPreview />
          </div>
        </section>

        <section className="border-b-thick border-ink bg-hot px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="sticker mb-8 inline-flex rounded-full bg-yolk px-3 py-1 text-xs text-ink">
              How it works
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.title}
                  className={`panel ${step.tone} ${step.tilt} p-5`}
                >
                  <p className="font-display text-xs font-black tracking-widest uppercase opacity-80">
                    {step.num}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-black tracking-tight uppercase">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              Built for the school run brain.
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-center gap-3 rounded-xl border-thick border-ink bg-paper p-3 shadow-hard-sm"
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-full border-thick border-ink ${feature.tone}`}
                    >
                      <Icon className="size-5" strokeWidth={2.4} />
                    </span>
                    <p className="font-display text-sm font-bold leading-snug">
                      {feature.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b-thick border-ink bg-grape px-4 py-14 text-paper">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              Stop carrying it
              <br />
              alone.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium text-paper/85">
              Sign up, paste the next school email, and keep the plan in one
              place.
            </p>
            <Button asChild size="lg" variant="yolk" className="mt-8">
              <Link to="/signup">
                Start your SCOOP
                <ScanText className="size-5" strokeWidth={2.4} />
              </Link>
            </Button>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-paper/70">
              No credit card. Works on your phone.
            </p>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 sm:flex-row sm:items-center">
          <p className="font-display text-sm font-black uppercase tracking-tight">
            Paste the chaos. Get the plan.
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-mute">
            Welcome letters · clubs · bus times · supplies · trips
          </p>
        </footer>
      </main>
    </div>
  );
}
