import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import appCss from "../styles.css?url";
import { SITE_URL } from "@/lib/site";

const APP_NAME = "SCOOP";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Paste the chaos. Get the plan. SCOOP turns school letters, party invites and WhatsApp messages into a calm family plan.",
      },
      { name: "theme-color", content: "#FAF6F0" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:secure_url", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SCOOP — paste the chaos, get the plan" },
      { property: "og:locale", content: "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:image:alt", content: "SCOOP — paste the chaos, get the plan" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/space-grotesk-400.woff2",
        crossOrigin: "anonymous",
      },
      // The landing headline is the LCP element and uses the 700-900 face, so
      // preload that file too — otherwise it is only discovered after the CSS
      // is parsed and the headline paints late in the fallback font.
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/space-grotesk-700.woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "SCOOP",
              url: `${SITE_URL}/`,
              logo: `${SITE_URL}/og-image.png`,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "amritokundu719@gmail.com",
              },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: "SCOOP",
              url: `${SITE_URL}/`,
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-paper">
        <AuthProvider>
          <Outlet />
          <Toaster position="bottom-center" toastOptions={{ className: "brutal-toast" }} />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
