import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Code2, Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";
import { CtaBand, PageHero, PublicShell } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/about`;
const PAGE_TITLE = "About SCOOP — the family admin app for school life";
const PAGE_DESCRIPTION =
  "SCOOP turns school emails, WhatsApp messages, newsletters and flyers into one calm, editable family plan. Here's what it is, who it's for and how it's built.";

const HERE_TODAY = [
  "Paste any school message — email, WhatsApp thread, newsletter or flyer text.",
  "AI extraction (Groq tool calling) with a built-in on-device fallback.",
  "Review and edit every item before it’s saved.",
  "A plan with events, deadlines, tasks and RSVPs.",
  "Tick items off, delete them, and filter to Today, This Week or All.",
  "Push dated items to Google Calendar, or download them as .ics files.",
];

const NOT_YET = [
  "Forwarding emails straight into SCOOP",
  "Scanning paper flyers from a photo",
  "A WhatsApp integration",
  "Reminders and notifications",
];

const STACK = [
  { icon: Code2, label: "TanStack Start + React", body: "The app and its server functions." },
  { icon: ShieldCheck, label: "Clerk", body: "Sign-in and account sessions." },
  { icon: Sparkles, label: "Groq", body: "Structured AI extraction of pasted text." },
  { icon: Users, label: "Postgres", body: "Stores your plan items — Neon in production." },
];

export const Route = createFileRoute("/about")({
  // Static marketing content — safe to cache at the CDN edge for a faster TTFB.
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  }),
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
            { "@type": "ListItem", position: 2, name: "About", item: PAGE_URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: PAGE_TITLE,
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
          mainEntity: {
            "@type": "Organization",
            name: "SCOOP",
            url: `${SITE_URL}/`,
            description: "A family admin app that turns school messages into a calm family plan.",
          },
        }),
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="About"
          title="Less chaos. Fewer forgotten permission slips."
          lead="SCOOP is a small app for one of the most under-served jobs in family life: keeping track of school."
          tone="bg-grape text-paper"
        />

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
            <div className="panel p-6">
              <span className="grid size-12 place-items-center rounded-full border-thick border-ink bg-hot text-paper">
                <Lightbulb className="size-6" strokeWidth={2.4} />
              </span>
              <h2 className="mt-4 font-display text-xl font-black uppercase tracking-tight">
                The problem
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                School life arrives scattered across emails, group chats, newsletters and paper
                flyers. Dates get lost, slips go unsigned, and two things land on the same
                afternoon. The information exists — it’s just spread out and easy to miss.
              </p>
            </div>
            <div className="panel p-6">
              <span className="grid size-12 place-items-center rounded-full border-thick border-ink bg-cyan">
                <Sparkles className="size-6" strokeWidth={2.4} />
              </span>
              <h2 className="mt-4 font-display text-xl font-black uppercase tracking-tight">
                What SCOOP does
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                You paste the message. SCOOP pulls out the events, deadlines, tasks and RSVPs, and
                drops them into one plan you can edit, tick off and push to your calendar — so
                nothing quietly slips through.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b-thick border-ink bg-paper-2 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              Who it’s for.
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium text-mute">
              Parents and carers juggling school communications — the ones who are always the
              default keeper of the family calendar.
            </p>
          </div>
        </section>

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              Where it is today.
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="panel p-6">
                <p className="sticker inline-flex rounded-full bg-yolk px-3 py-1 text-xs">
                  Working now
                </p>
                <ul className="mt-5 space-y-3">
                  {HERE_TODAY.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" strokeWidth={2.4} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel bg-paper-2 p-6">
                <p className="sticker inline-flex rounded-full bg-paper px-3 py-1 text-xs text-mute">
                  Not here yet
                </p>
                <ul className="mt-5 space-y-3">
                  {NOT_YET.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-mute">
                      <span className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-ink" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs font-medium text-mute">
                  We’d rather tell you what isn’t built than pretend it is.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-title font-black uppercase tracking-tight">
              How it’s built.
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium text-mute">
              A small, deliberately plain stack.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STACK.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="panel p-5">
                    <span className="grid size-11 place-items-center rounded-full border-thick border-ink bg-yolk">
                      <Icon className="size-5" strokeWidth={2.4} />
                    </span>
                    <h3 className="mt-4 font-display text-base font-black tracking-tight">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-mute">{item.body}</p>
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
