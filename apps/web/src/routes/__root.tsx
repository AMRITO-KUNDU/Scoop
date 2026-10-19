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
      // Raster fallbacks. Bing does not render SVG favicons, so without these it
      // shows a generic globe beside the result.
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/space-grotesk-400.woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
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
