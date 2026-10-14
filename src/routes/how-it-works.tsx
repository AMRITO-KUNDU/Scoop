import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ClipboardPaste,
  ListChecks,
  Mail,
  ScanText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, PublicShell } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/how-it-works`;
const PAGE_TITLE = "How it works — turn school messages into a family plan | SCOOP";
const PAGE_DESCRIPTION =
  "Paste a school email, WhatsApp thread, newsletter or flyer and SCOOP pulls out events, deadlines, tasks and RSVPs into one editable family plan.";

const STEPS = [
  {
    num: "01",
    title: "Dump the chaos",
    body: "Paste a WhatsApp message, forward a school email, or type what’s in your head. Any messy text works.",
    tone: "bg-cyan",
    tilt: "-rotate-1",
  },
  {
    num: "02",
    title: "AI makes sense of it",
    body: "SCOOP reads the message and pulls out events, deadlines, tasks and RSVPs you can edit before saving.",
    tone: "bg-hot text-paper",
    tilt: "rotate-1",
  },
  {
    num: "03",
    title: "Your family gets the plan",
    body: "One tap to confirm. Everything lands in your plan — tick things off when they’re done.",
    tone: "bg-grape text-paper",
    tilt: "-rotate-1",
  },
];

const CATEGORIES = [
  {
    icon: CalendarCheck,
    label: "Events",
    tone: "bg-grape text-paper",
    body: "Trips, parties, parent-teacher evenings, clubs and school photos — anything that happens on a date.",
  },
  {
    icon: Bell,
    label: "Deadlines",
    tone: "bg-hot text-paper",
    body: "Return slips, payment due dates, forms and supply lists — the things that are due by a certain day.",
  },
  {
    icon: ClipboardPaste,
    label: "Tasks",
    tone: "bg-yolk",
    body: "Pack the lunch, buy the uniform, bring a water bottle — actions with no fixed calendar slot.",
  },
  {
    icon: Mail,
    label: "RSVPs",
    tone: "bg-cyan",
    body: "Reply to a party, reserve a club spot, confirm a bus seat — anything that needs an answer.",
  },
];

const PLAN_FEATURES = [
  { icon: CheckCircle2, text: "Filter your plan to Today, This Week or All." },
  { icon: ListChecks, text: "Mark items done or delete them — your plan stays current." },
  { icon: CalendarPlus, text: "Push a dated item to Google Calendar, or download it as an .ics file." },
  { icon: Sparkles, text: "Duplicate items are skipped automatically when you add to your plan." },
];

const FAQ = [
  {
    q: "How does SCOOP extract school information?",
    a: "When an AI key is configured, SCOOP uses Groq tool calling — a structured extraction model — to pull events, deadlines, tasks and RSVPs out of the text you paste. With no key configured, or if the AI call fails, a built-in on-device parser does the same job without sending your text anywhere.",
  },
  {
    q: "What if the AI gets something wrong?",
    a: "Every extracted item is shown for review before it goes into your plan. You can edit the title, date, time, location and notes, remove anything you don’t want, and only then add it. Nothing is saved until you confirm.",
  },
  {
    q: "Can I use SCOOP for things that aren’t school-related?",
    a: "Yes. It’s built around school life, but it works for any family logistics — clubs, appointments, parties, trips and reminders.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. Your plan is tied to your account so it’s there when you come back. Signing in is handled by our authentication provider.",
  },
  {
    q: "What can I do with an item once it’s in my plan?",
    a: "Filter to Today, This Week or All, mark items done or delete them, and push a dated item straight to Google Calendar or download it as an .ics file.",
  },
];

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "How it works", item: PAGE_URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Turn a school message into a family plan with SCOOP",
          description: PAGE_DESCRIPTION,
          step: STEPS.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.body,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((entry) => ({
            "@type": "Question",
            name: entry.q,
            acceptedAnswer: { "@type": "Answer", text: entry.a },
          })),
        }),
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="How it works"
          title="From messy message to family plan."
          lead="Paste a school email, a WhatsApp thread, a newsletter or a flyer. SCOOP pulls out what actually matters and puts it in one place."
          tone="bg-cyan"
        />

        <section className="border-b-thick border-ink bg-hot px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="sticker mb-8 inline-flex rounded-full bg-yolk px-3 py-1 text-xs text-ink">
              Three steps
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
              What it pulls out.
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium text-mute">
              Every item is sorted into one of four types, so you know at a glance what needs doing.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.label} className="panel flex items-start gap-4 p-5">
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-full border-thick border-ink ${category.tone}`}
                    >
                      <Icon className="size-6" strokeWidth={2.4} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-black uppercase tracking-tight">
                        {category.label}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-mute">{category.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              Two ways it reads your message.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="panel bg-paper-2 p-6">
                <p className="sticker inline-flex rounded-full bg-grape px-3 py-1 text-xs text-paper">
                  With an AI key
                </p>
                <h3 className="mt-4 font-display text-xl font-black uppercase tracking-tight">
                  Groq tool calling
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  SCOOP asks a structured extraction model to return items in a fixed shape — type,
                  title, date, time, location and notes. It’s precise because the model fills a
                  schema rather than writing prose.
                </p>
              </div>
              <div className="panel bg-paper-2 p-6">
                <p className="sticker inline-flex rounded-full bg-cyan px-3 py-1 text-xs">
                  Always available
                </p>
                <h3 className="mt-4 font-display text-xl font-black uppercase tracking-tight">
                  On-device parser
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  With no AI key configured — or if the AI call fails — a built-in rule-based parser
                  handles extraction right on your device. It reads dates, times and locations, and
                  still sorts everything into the four types.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              In your plan.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {PLAN_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.text}
                    className="flex items-center gap-3 rounded-xl border-thick border-ink bg-paper p-4 shadow-hard-sm"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border-thick border-ink bg-yolk">
                      <Icon className="size-5" strokeWidth={2.4} />
                    </span>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              Questions, answered.
            </h2>
            <dl className="mt-8 space-y-4">
              {FAQ.map((entry) => (
                <div key={entry.q} className="panel p-5">
                  <dt className="font-display text-lg font-black tracking-tight">{entry.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-mute">{entry.a}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <Button asChild variant="ink" size="lg">
                <Link to="/capture">
                  Try it with a school email
                  <ScanText className="size-5" strokeWidth={2.4} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
    </PublicShell>
  );
}
