import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicShell, Section } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/privacy`;
const PAGE_TITLE = "Privacy policy | SCOOP";
const PAGE_DESCRIPTION =
  "What SCOOP collects, how it's used, and how the AI extraction step handles the text you paste.";

const CONTACT_EMAIL = "amritokundu719@gmail.com";
const LAST_UPDATED = "14 October 2026";

export const Route = createFileRoute("/privacy")({
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
            { "@type": "ListItem", position: 2, name: "Privacy", item: PAGE_URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: PAGE_TITLE,
          url: PAGE_URL,
          description: PAGE_DESCRIPTION,
        }),
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Privacy"
          title="Privacy policy"
          lead="What SCOOP collects, why, and how it's handled."
          tone="bg-cyan"
        />

        <div className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-mute">
              Last updated: {LAST_UPDATED}
            </p>

            <Section heading="The short version">
              <p>
                SCOOP stores only what it needs to run: your account, the items in your plan, and
                the text you paste while it's being extracted. We don't sell your data or use it for
                advertising.
              </p>
            </Section>

            <Section heading="What we collect">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-ink">Account details.</strong> When you sign in, our
                  authentication provider (Clerk) gives us a user ID and — if you sign in with an
                  email address or Google — your name and email address. We never see or store your
                  password.
                </li>
                <li>
                  <strong className="text-ink">The text you paste.</strong> Used only to extract
                  items. See “The AI step” below.
                </li>
                <li>
                  <strong className="text-ink">The items you save.</strong> The type, title, date,
                  time, location and notes of each plan item, stored against your account.
                </li>
              </ul>
            </Section>

            <Section heading="The AI step">
              <p>
                When an AI key is configured, the text you paste is sent to Groq to extract items.
                It's processed to return the structured result and is not used for advertising.
              </p>
              <p>
                When no AI key is configured — or if the AI call fails — a built-in rule-based
                parser does the same extraction instead, and the text is not sent to an AI provider
                for that step.
              </p>
            </Section>

            <Section heading="How we use your data">
              <p>
                To extract items, show your plan, and keep you signed in. That's the whole purpose.
                We don't sell your data, and we don't build advertising profiles from it.
              </p>
            </Section>

            <Section heading="Where it's stored">
              <p>
                Plan items are stored in a Postgres database (Neon in production). Sign-in sessions
                are managed by Clerk.
              </p>
            </Section>

            <Section heading="Cookies">
              <p>
                We use cookies and local storage for sign-in sessions, to keep you logged in between
                visits.
              </p>
            </Section>

            <Section heading="Connectors">
              <p>
                You can connect SCOOP to Google Calendar and Google Tasks. If you do, the items
                SCOOP sends — their title, date, time, location and notes — reach that service
                through Composio, which holds the connection on your behalf. SCOOP never sees or
                stores your Google password or access token.
              </p>
              <p>
                Nothing goes to Google unless you connect a service, and you can revoke access
                from your Google account whenever you like. Items you have already sent stay in
                your Google account until you remove them there.
              </p>
            </Section>

            <Section heading="Sharing">
              <p>
                We share data only with the services that run SCOOP: Clerk (authentication), Neon
                (database) and Groq (AI extraction). If you connect a service, the items you send
                to it go to Google through Composio — see Connectors above. We do not sell
                personal data.
              </p>
            </Section>

            <Section heading="Your choices">
              <p>
                You can edit or delete any item in your plan, and sign out at any time. To delete
                your account and its data, contact us.
              </p>
            </Section>

            <Section heading="Children">
              <p>
                SCOOP is intended for use by parents and carers. An older child may use an account
                under a parent or carer's supervision.
              </p>
            </Section>

            <Section heading="Changes">
              <p>
                If this policy changes we'll update this page and the date shown at the top.
                Continued use after a change means you accept the updated policy.
              </p>
            </Section>

            <Section heading="Contact">
              <p>
                Questions about privacy? Email{" "}
                <a className="font-bold text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
