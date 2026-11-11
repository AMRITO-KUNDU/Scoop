import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero, PublicShell, Section } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/guides/whatsapp-school-groups`;
const PAGE_TITLE = "The school WhatsApp group, without the chaos | SCOOP";
const PAGE_DESCRIPTION =
  "Eighty-four unread messages, one actual decision. How to read a class group in two minutes a day and stop the important message scrolling past.";

export const Route = createFileRoute("/guides/whatsapp-school-groups")({
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
          headline: "The school WhatsApp group, without the chaos",
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
          title="The group, without the chaos."
          lead="One decision, four repeated questions and a photo of a lost cardigan, all in eighty-four messages. You do not need to read all of it."
          tone="bg-grape"
        />

        <div className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <Section heading="Why the group is exhausting">
              <p>
                A class group is three different things wearing one costume: an announcement channel,
                a social space, and a lost-property board. Announcements need you. The other two do
                not, but they arrive in the same stream, at the same volume, so the one message that
                matters scrolls past between a birthday invitation and a picture of someone's
                car boot.
              </p>
            </Section>

            <Section heading="Mute it, and check it twice">
              <p>
                Turn notifications off. Not because the group is unimportant, but because a
                notification you cannot act on is just noise with a badge attached. Then check it
                twice a day — once after the school run, once in the evening. Anything genuinely
                urgent in a class group is rare, and the school will phone you for it.
              </p>
              <p>
                Two checks a day also means the unread count is a manageable scroll rather than a
                guilt pile you avoid for a week.
              </p>
            </Section>

            <Section heading="Turn the message into an item, then forget it">
              <p>
                When a message contains a date, a reply or something to bring, the message has done
                its job — it delivered an action. Move the action somewhere that will still exist
                when the chat has scrolled a thousand messages further on. A pinned message is not a
                plan; nobody scrolls back to the pin.
              </p>
              <p>
                Everything else — the thanks, the jokes, the lost cardigan — can pass without a
                response from you.
              </p>
            </Section>

            <Section heading="Reply less than you think you should">
              <p>
                Most group messages need no reply. A thumbs-up is not a commitment, and answering a
                question that four other people have already answered adds noise for everyone. If the
                organiser needs a number, give them a number, once, clearly. That is the whole
                obligation.
              </p>
            </Section>

            <Section heading="Where SCOOP fits">
              <p>
                On Android, long-press the message, choose Share and pick SCOOP. The message arrives
                in the app already read — the dates and to-dos pulled out, waiting for you to check
                them. You never open SCOOP to paste anything, which is the difference between doing
                it in three seconds and doing it later, which means never.
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
