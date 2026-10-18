# SCOOP — mobile

The native app. Same plan, same connectors, same rules as the web app — it just
talks to the backend over HTTP instead of running the server itself.

## Setup

```bash
cd apps/mobile
npm install
npx expo install @clerk/expo expo-secure-store expo-auth-session expo-crypto date-fns
cp .env.example .env      # then fill it in
npx expo start --clear
```

**Always add packages with `npx expo install <package>`, not `npm install
<package>`.** `expo install` reads the project's Expo SDK and picks the version
that matches it; plain `npm install` happily pulls a release built for a
different SDK and you find out at runtime. That is how the versions in
`package.json` were chosen, so a fresh clone only needs `npm install` — the
`expo install` line is there to repair or re-resolve them, and to add anything
new the same way.

Two values are required in `.env`:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — from the Clerk dashboard.
- `EXPO_PUBLIC_API_URL` — the deployed web app's origin. The mobile app calls the
  JSON API in `apps/web/src/routes/api/*`.

Also, once per Clerk project: enable the **Native API** on the *Native
applications* page, and register `com.amritokundu.scoop` as both the iOS bundle
identifier and the Android package name. Without that, sign-in works in
development but fails in a production build.

## How it fits together

```
src/app/(tabs)/   the two main screens, as tabs: plan and capture
src/app/connect.tsx  connectors, pushed from the header button
src/lib/api.ts    the only door to the backend — Clerk token in a Bearer header
src/lib/plan.ts   item types, formatting and filters, mirroring apps/web
src/constants/    design tokens, lifted from the web app's styles.css
src/components/   the shared UI kit (Panel, Button, TypeBadge, …)
```

**Why a separate API rather than the web app's server functions.** TanStack
Start server functions are same-origin RPC and deliberately not callable from
outside the app; a native client on another origin needs real HTTP endpoints. So
`apps/web/src/routes/api/*` exposes the same operations, and those routes are
thin adapters that call the very same server functions — validation, auth and
business rules stay in one place.

**Auth.** A native app has no session cookie, so every request carries the Clerk
session token as `Authorization: Bearer …`, which the web app's
`clerkMiddleware()` accepts.

**Why tabs.** Plan and Capture are a tab navigator, so both stay mounted:
switching is instant, there's no push animation per tap, and a half-typed message
on Capture survives a look at the plan. Connectors is a pushed screen reached
from the header button, so back returns to the tab you came from.

## Not done yet

- **Full editing parity.** Drafts can be edited (title, date, time, location,
  notes, type) before saving, but items already in the plan can't be edited on
  mobile — only marked done or deleted.
- **Space Grotesk.** The web app self-hosts it as `.woff2`, which React Native
  can't load; the app uses the system font for now. Bundling the `.ttf` files via
  `expo-font` would close the gap.
- **Icons.** Lucide icons are bundled via `lucide-react-native` and `react-native-svg` matching the web design.
- **Push notifications.** Not built anywhere yet.
