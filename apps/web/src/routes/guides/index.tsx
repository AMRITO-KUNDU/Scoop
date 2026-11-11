import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, PublicShell } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/guides`;
const PAGE_TITLE = "Guides for the family admin | SCOOP";
const PAGE_DESCRIPTION =
  "Practical guides for the parent who keeps the family calendar: school email, permission slips and the class WhatsApp group. Short systems, no productivity theatre.";

const GUIDES = [
  {
    to: "/guides/school-emails" as const,
    title: "Stop drowning in school emails",
    blurb:
      "Read it once, pull out the actions, and put the dates somewhere you will actually trip over them.",
  },
  {
    to: "/guides/permission-slips" as const,
    title: "Never miss a permission slip again",
    blurb:
      "The slip is never the hard part. It is the channel it arrived on and the deadline buried three paragraphs down.",
  },
  {
    to: "/guides/whatsapp-school-groups" as const,
    title: "The school WhatsApp group, without the chaos",
    blurb:
      "Eighty-four unread messages, one decision and four repeated questions. How to read it in two minutes a day.",
  },
];

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: PAGE_TITLE,
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
          isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
          hasPart: GUIDES.map((guide) => ({
            "@type": "Article",
            headline: guide.title,
            url: `${SITE_URL}${guide.to}`,
          })),
        }),
      },
    ],
  }),
  component: Guides,
});

function Guides() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Guides"
          title="For whoever keeps the calendar."
          lead="In most families that is one person, and it was never a job anyone applied for. These are the systems that make it survivable."
          tone="bg-cyan"
        />

        <section className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium leading-relaxed text-ink">
              None of this is complicated. It is just spread out: a newsletter on Monday, a form on
              Wednesday, a party in a group chat on Friday, and a payment reminder somewhere in
              between. Each guide takes one of those channels and gives you a routine for it that
              survives a busy week.
            </p>

            <div className="mt-8 grid gap-4">
              {GUIDES.map((guide) => (
                <Link
                  key={guide.to}
                  to={guide.to}
                  className="panel block p-5 hover:bg-paper-2"
                >
                  <h2 className="font-display text-xl font-black tracking-tight">{guide.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-mute">{guide.blurb}</p>
                  <p className="mt-3 font-display text-xs font-black uppercase tracking-widest">
                    Read the guide →
                  </p>
                </Link>
              ))}
            </div>

            <p className="mt-8 text-sm font-medium text-mute">
              {"Or see "}
              <Link
                to="/how-it-works"
                className="font-bold text-ink underline decoration-2 underline-offset-4"
              >
                how SCOOP handles this for you
              </Link>
              {"."}
            </p>
          </div>
        </section>

        <CtaBand />
      </main>
    </PublicShell>
  );
}
