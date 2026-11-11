import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, PublicShell, Section } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/guides/school-emails`;
const PAGE_TITLE = "Stop drowning in school emails | SCOOP";
const PAGE_DESCRIPTION =
  "A short system for parents: read each school email once, pull out the actions, and keep the dates where you will see them. No inbox zero required.";

export const Route = createFileRoute("/guides/school-emails")({
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
          headline: "Stop drowning in school emails",
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
          title="Stop drowning in school emails."
          lead="The problem is not volume. It is that one email contains six different kinds of thing, and only two of them need you."
          tone="bg-cyan"
        />

        <div className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <Section heading="Why school email beats you">
              <p>
                A single Thursday message from school might contain a trip on the 3rd, a form that
                has to be back by the 24th, a reminder that Friday is non-uniform, and a note that
                the office has changed its phone number. Four things, one email, one subject line
                that says "Newsletter".
              </p>
              <p>
                So you read it, you think "I'll deal with that later", and later never arrives —
                because the action lives in a different place from the message. The email is in your
                inbox. The form is in a book bag. The date is in your head.
              </p>
            </Section>

            <Section heading="Read it once, act once">
              <p>
                Read each school email exactly once, with three questions in front of you. Does it
                have a <strong>date</strong>? Does it need a <strong>reply</strong>? Is there
                something to <strong>bring, sign or pay</strong>?
              </p>
              <p>
                If the answer to all three is no, the email is information. Read it, and let it go —
                you do not need to file it, tag it, or star it. If any answer is yes, that thing
                becomes an item with a date on it, and the email itself stops mattering. You are not
                organising messages. You are extracting actions.
              </p>
            </Section>

            <Section heading="Put the date where you will trip over it">
              <p>
                A date in an email is invisible. A date in a calendar you already look at is not.
                Anything with a day attached — a trip, a closure, a non-uniform day — belongs in the
                same place as the dentist appointment and your own meetings, not in a folder called
                School.
              </p>
              <p>
                The test is simple: on the morning it matters, will something tell you? If the answer
                depends on you remembering to check an inbox, it is not in the right place yet.
              </p>
            </Section>

            <Section heading="The Friday five minutes">
              <p>
                Once a week, open whatever holds the dates and read the next seven days. Not the
                whole month — a week is the useful horizon. Anything that needs buying, printing or
                signing gets done then, on a Friday evening, rather than at 7:40am on the day.
              </p>
            </Section>

            <Section heading="Where SCOOP fits">
              <p>
                Paste the email in, and SCOOP pulls out the four things that need you — events,
                deadlines, tasks and RSVPs — as items you can check, correct and keep. You read the
                message once, you keep the actions, and the message itself can go.
              </p>
              <p>
                {"See "}
                <Link
                  to="/how-it-works"
                  className="font-bold text-ink underline decoration-2 underline-offset-4"
                >
                  how it works
                </Link>
                {", or read the guide to "}
                <Link
                  to="/guides/permission-slips"
                  className="font-bold text-ink underline decoration-2 underline-offset-4"
                >
                  never missing a permission slip
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
