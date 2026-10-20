import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicShell, Section } from "@/components/public-shell";
import { SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/terms`;
const PAGE_TITLE = "Terms of use | SCOOP";
const PAGE_DESCRIPTION =
  "The terms that apply when you use SCOOP, including how AI-extracted items should be treated.";

const CONTACT_EMAIL = "amritokundu719@gmail.com";
// Default jurisdiction — change if the operator is established elsewhere.
const GOVERNING_LAW = "the laws of India";
const LAST_UPDATED = "14 October 2026";

export const Route = createFileRoute("/terms")({
  // Static legal content — safe to cache at the CDN edge for a faster TTFB.
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
            { "@type": "ListItem", position: 2, name: "Terms", item: PAGE_URL },
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
  component: Terms,
});

function Terms() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Terms"
          title="Terms of use"
          lead="The ground rules for using SCOOP."
          tone="bg-grape text-paper"
        />

        <div className="border-b-thick border-ink px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-mute">
              Last updated: {LAST_UPDATED}
            </p>

            <Section heading="Acceptance">
              <p>By using SCOOP, you agree to these terms. If you don't agree, please don't use it.</p>
            </Section>

            <Section heading="What SCOOP is">
              <p>
                SCOOP is a tool that extracts items from text you paste and organises them into a
                plan. It is not a substitute for your school's official communications — always
                check the original message and your school for anything important.
              </p>
            </Section>

            <Section heading="Your account">
              <p>
                You're responsible for keeping your sign-in secure and for activity that happens on
                your account. Let us know if you believe your account has been compromised.
              </p>
            </Section>

            <Section heading="Acceptable use">
              <p>
                Don't misuse the service: no attempting to break, overload or bypass it, and no
                using it for anything unlawful or to process content you don't have the right to
                share.
              </p>
            </Section>

            <Section heading="AI output">
              <p>
                Extraction is automated and can be wrong or incomplete. Every item is shown for
                review before it's saved, and you're responsible for what you rely on. SCOOP is a
                helper, not an authority.
              </p>
            </Section>

            <Section heading="Availability">
              <p>
                SCOOP is provided “as is” and “as available”, without warranties of any kind. We may
                change, suspend or stop it at any time.
              </p>
            </Section>

            <Section heading="Limitation of liability">
              <p>
                To the extent permitted by law, we're not liable for indirect or consequential
                losses arising from your use of SCOOP, including anything missed because an
                extracted item was wrong or incomplete.
              </p>
            </Section>

            <Section heading="Changes">
              <p>
                We may update these terms. If we do, we'll change the date at the top, and continued
                use means you accept the new version.
              </p>
            </Section>

            <Section heading="Governing law">
              <p>These terms are governed by {GOVERNING_LAW}.</p>
            </Section>

            <Section heading="Contact">
              <p>
                Questions about these terms? Email{" "}
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
