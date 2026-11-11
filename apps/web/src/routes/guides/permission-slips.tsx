import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, PublicShell, Section } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/guides/permission-slips`;
const PAGE_TITLE = "Never miss a permission slip again | SCOOP";
const PAGE_DESCRIPTION =
  "Why permission slips get missed, what a slip usually needs, and a routine that catches them on the day they arrive instead of the morning they are due.";

export const Route = createFileRoute("/guides/permission-slips")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESCRIPTION },
      { property: "og:url", content: PAGE_URL },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Never miss a permission slip again",
          description: PAGE_DESCRIPTION,
          url: PAGE_URL,
          isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
          publisher: { "@type": "Organization", name: "SCOOP", url: `${SITE_URL}/` },
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Guide"
          title="Never miss a permission slip again."
          lead="The slip is never the hard part. The hard part is that it arrived in one place, the deadline is in another, and nobody tells you when they meet."
          tone="bg-hot"
        />

        <div className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <Section heading="The slip is never the problem">
              <p>
                A permission slip is one piece of paper. But it reaches you through one of four
                channels — a printed letter in a book bag, an attachment in an email, a photo in the
                class group, or a link in a portal you have a login for and never remember. The
                deadline is in a different sentence from the ask, and often in a different message
                entirely.
              </p>
              <p>
                So the failure is never "I forgot to sign it". It is "I never saw that it was due
                on Thursday".
              </p>
            </Section>

            <Section heading="Catch it on the day it arrives">
              <p>
                The single change that matters: when a slip appears, the date goes somewhere
                permanent within the same minute. Not "later tonight" — later tonight is where good
                intentions go to die. If you cannot do it immediately, put a placeholder with the due
                date on it, and fill in the rest when you are at a table.
              </p>
              <p>
                Printed slips are the awkward case, because the paper is the reminder. Take a photo
                of it before it goes in the bag, and the paper stops being load-bearing.
              </p>
            </Section>

            <Section heading="One place, not four">
              <p>
                If trips live in email, payments in a portal and non-uniform days in WhatsApp, you
                will miss something — not because you are disorganised, but because checking four
                places every day is a job. The rule that works: every date ends up in one list, and
                that list is the only thing you check.
              </p>
            </Section>

            <Section heading="What a slip usually needs">
              <p>
                Before you sign, four things are usually being asked for, and they are rarely
                together in one paragraph:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>a signature and a date</li>
                <li>a payment, sometimes with a reference</li>
                <li>medical or dietary notes, if there is food or travel involved</li>
                <li>a packed lunch, a coat, or a specific kit on the day</li>
              </ul>
              <p>
                Treat them as four separate items rather than one slip. The signature is a two-minute
                job; the payment is a five-minute job; the packed lunch is a morning-of job. Bundling
                them is what makes the whole thing feel bigger than it is.
              </p>
            </Section>

            <Section heading="Where SCOOP fits">
              <p>
                Paste the letter, or share it in from your phone, and SCOOP splits it into exactly
                those pieces — a deadline for the form, a task for the payment, an event for the day
                itself — so nothing sits inside a paragraph waiting to be noticed.
              </p>
              <p>
                {"See "}
                <Link
                  to="/how-it-works"
                  className="font-bold text-ink underline decoration-2 underline-offset-4"
                >
                  how it works
                </Link>
                {", or read "}
                <Link
                  to="/guides/school-emails"
                  className="font-bold text-ink underline decoration-2 underline-offset-4"
                >
                  how to handle school email
                </Link>
                {"."}
              </p>
            </Section>
          </div>
        </div>

        <CtaBand />
      </main>
    </PublicShell>
  );
}
