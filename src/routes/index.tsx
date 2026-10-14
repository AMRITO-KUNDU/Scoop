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
import { LandingPreview } from "@/components/landing-preview";
import { CtaBand, PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SCOOP — Turn school emails & WhatsApp chaos into a family plan" },
      {
        name: "description",
        content:
          "SCOOP is the family admin app that turns school letters, party invites and WhatsApp messages into a calm family plan with events, deadlines, tasks and RSVPs.",
      },
      { property: "og:title", content: "SCOOP — Paste the chaos. Get the plan." },
      {
        property: "og:description",
        content:
          "Turn school emails, party invites and WhatsApp chaos into a calm family plan in seconds.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:title", content: "SCOOP — Paste the chaos. Get the plan." },
      {
        name: "twitter:description",
        content:
          "Turn school emails, party invites and WhatsApp chaos into a calm family plan in seconds.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "SCOOP",
          url: `${SITE_URL}/`,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any (web, mobile-first)",
          description:
            "Family admin app that extracts events, deadlines, tasks and RSVPs from school emails, WhatsApp messages and flyers.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Home,
});

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
  // IMPORTANT: never block the landing page on auth. Clerk resolves on the client
  // only, so during SSR `isPending` is always true. Rendering a skeleton here
  // meant crawlers, link previews and scrapers received an empty page.
  // Signed-in users are redirected once the session is known.
  if (user) return <Navigate to="/capture" />;
  return <Landing user={user} isPending={isPending} />;
}

function Landing({
  user,
  isPending,
}: {
  user: ReturnType<typeof useCurrentUserState>["user"];
  isPending: boolean;
}) {
  const destination = !isPending && user ? "/capture" : "/signup";

  return (
    <PublicShell>
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
                SCOOP turns school letters, party invites and WhatsApp chaos into a calm family plan
                — in seconds.
              </p>
              <Button asChild size="lg" variant="yolk" className="mt-8 w-full sm:w-auto">
                <Link to={destination}>
                  Start with SCOOP
                  <ScanText className="size-5" strokeWidth={2.4} />
                </Link>
              </Button>
              <p className="mt-4 text-sm font-medium text-mute">Paste the chaos. Get the plan.</p>
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
                <div key={step.title} className={`panel ${step.tone} ${step.tilt} p-5`}>
                  <p className="font-display text-xs font-black tracking-widest uppercase opacity-80">
                    {step.num}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-black tracking-tight uppercase">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed">{step.body}</p>
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
                    <p className="font-display text-sm font-bold leading-snug">{feature.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
    </PublicShell>
  );
}
