# SCOOP

**The family admin app that turns chaos into calm.**

SCOOP is your personal assistant for managing the overwhelming stream of school communications, event invitations, and family logistics. No more missed deadlines, forgotten permission slips, or double-booked schedules.

---

## Repo layout

This is a two-app repo. Each app installs and runs independently — there is no workspace root.

| Path | What it is |
| --- | --- |
| `apps/web` | The web app — TanStack Start, deployed to Vercel. It also hosts the JSON API at `src/routes/api/*` that the mobile app calls. |
| `apps/mobile` | The native app — Expo / React Native. Signs in with Clerk and talks to that API over HTTP. See `apps/mobile/README.md`. |

```bash
cd apps/web && npm install && npm run dev     # web
cd apps/mobile && npm install && npx expo start   # mobile
```

The mobile app needs `EXPO_PUBLIC_API_URL` pointing at the web app, and the web
app needs `CLERK_SECRET_KEY` so it can verify the mobile client's session token.

---

## 🎯 The Problem

Every parent knows the feeling: your inbox is flooded with school newsletters, WhatsApp groups are buzzing with last-minute changes, and paper flyers get lost in the abyss of backpacks. Meanwhile, your calendar is a maze of conflicting commitments, and somehow you're still the one who forgets about the class trip.

**The result?** Stress, missed opportunities, and that sinking feeling of being constantly behind.

---

## ✨ The Solution

SCOOP transforms the chaos into clarity with three simple steps:

### 1️⃣ **Dump the Chaos**

Paste any message — school emails, WhatsApp threads, newsletters, flyers, permission slips, party invites — and let SCOOP do the heavy lifting.

### 2️⃣ **AI Makes Sense of It**

Our intelligent system uses **Groq tool calling** (not chat) to precisely extract structured data:

- **Events** - School trips, parent-teacher meetings, parties, club sessions
- **Deadlines** - Permission slip due dates, payment deadlines, supply lists
- **Tasks** - Actions you need to take (pack lunch, buy uniform, schedule pickup)
- **RSVPs** - Confirmations needed for events and activities

### 3️⃣ **Your Family Gets the Plan**

One tap to review, edit, and add everything to your plan. Track progress and mark items complete as you go.

---

## 🌟 Key Features

### 📧 **Universal Input & Capture**

Capture family logistics quickly:

- **Text Pasting** - Paste school emails, WhatsApp text, newsletters, and notes directly.
- **Email Forwarding** - [Planned] Direct email inbox forwarding integration.
- **Photo & Flyer OCR** - [Planned] Camera scan and image text extraction.
- **WhatsApp Bot** - [Planned] Automated WhatsApp chat forwarding.

### 🧠 **Smart Extraction**

Powered by **Groq tool calling** (with local on-device fallback), SCOOP intelligently extracts structured data with:

- Date and time references ("next Tuesday", "2 weeks from today")
- Multiple items in a single message
- Context-specific details (location, what to bring, who's invited)
- Item categories (event, deadline, task, rsvp)


### 📅 **Your Plan**

All your extracted items become:

- **One list** - Events, deadlines, tasks and RSVPs in a single plan
- **Filters** - Narrow the plan to Today, This Week or All
- **Done and delete** - Tick items off or remove them; the plan stays current
- **Calendar export** - Open any dated item in Google Calendar, or download it as an `.ics` file
- **Google connectors** - Connect Google Calendar and Google Tasks once and your plan syncs to them automatically (via [Composio](https://composio.dev))
- **Duplicate protection** - Re-pasting the same message won't add the same item twice

### 👨‍👩‍👧‍👦 **Built for School Life**

- **School-shaped** - Item types and wording that match how schools actually communicate
- **Editable before saving** - Nothing enters your plan until you have reviewed it
- **Visual clarity** - Colour-coded, easy-to-scan interface

### 📱 **Mobile-First**

Built for the device you always have with you:

- Responsive layout that works on phones
- Phone-first design with large, tappable controls

> **Not built yet:** notifications/reminders, offline mode, plan sharing between accounts,
> email forwarding, photo/OCR capture and a WhatsApp integration. See the roadmap below.

---

## 🎨 What SCOOP Handles

| Category                  | Examples                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| **School Communications** | Newsletters, permission slips, supply lists, field trip notices, teacher emails            |
| **Extracurricular**       | Sports practice schedules, music lessons, club meetings, competition dates                 |
| **Social Events**         | Birthday parties, playdates, family gatherings, holiday plans                              |
| **Administrative**        | School fee deadlines, vaccination requirements, uniform orders, parent-teacher conferences |
| **Transportation**        | Bus schedules, carpool arrangements, pickup/drop-off times                                 |

---

## 💡 The SCOOP Difference

### vs. Regular Calendar Apps

✅ **Extracts action items** - Creates tasks, deadlines and RSVPs from messages, not just events
✅ **Date intelligence** - Converts "next Friday" to an actual date automatically
✅ **Review-first** - Every item is editable before it is saved

### vs. Note-Taking Apps

✅ **Structured output** - Creates organised items, not just text blobs
✅ **Automatic categorisation** - Sorts items by type without manual tagging
✅ **Actionable** - Built to help you take action, not just store information

### vs. Email Clients

✅ **All in one place** - Pulls the information out of whichever app it arrived in
✅ **No clutter** - Shows only what's important and actionable
✅ **Persistent** - Doesn't get buried under new messages

---

## 🚀 Getting Started

### Connectors

SCOOP connects to Google Calendar and Google Tasks through
[Composio](https://composio.dev), which holds the Google OAuth — SCOOP never sees
your Google token.

- **Google Calendar** takes anything with a date.
- **Google Tasks** takes the things you have to do: tasks, deadlines and RSVPs,
  with the due date filled in where you gave one.

Connect either or both. Each item shows a small chip in your plan once it has
been sent, so you can see what went where.

**Setup is one environment variable.** Create an API key at
[app.composio.dev](https://app.composio.dev) and set `COMPOSIO_API_KEY`. That's
it — SCOOP creates the Google Calendar auth config itself using Composio's
managed OAuth app, so there is nothing to create by hand and nothing for your
users to configure.

From there a user just hits **Connect**, approves at Google, and their plan
syncs: new items as they save them, plus everything already in the plan on first
connect. They never see a setting.

#### Do I need a Google Cloud project?

**No.** Google Calendar is on Composio's list of toolkits with managed OAuth, so
Composio supplies and maintains the OAuth app. You do not register a client,
enable a Google API, or complete Google's app verification. That is exactly why
setup here is a single API key.

#### When to bring your own Google OAuth app

Managed auth is the right default, but switch to your own OAuth client before
you scale, because of four things:

- **Branding.** Users see *"Composio wants to access your Google Account"*. In
  production they should see your app's name. This is the usual reason to switch.
- **Scopes.** Composio's defaults for a toolkit are sensible, but not adjustable
  per-toolkit beyond that.
- **Quota.** Managed apps share rate limits across every Composio user; your own
  app gets a dedicated quota.
- **Polling.** Managed auth enforces a 15-minute minimum polling interval.

To switch: create a Google Cloud project, enable the Google Calendar API, create
an OAuth 2.0 Web client, set its authorised redirect URI to Composio's callback,
create a **Google Calendar** auth config in the Composio dashboard with those
credentials, and set `COMPOSIO_GCAL_AUTH_CONFIG_ID` to that config's id.

#### If connecting fails

- **"App is blocked"** — the auth config is requesting a scope Google hasn't
  approved for that OAuth client. With managed auth, remove the extra scope
  (drop the `..._SCOPES` override); with your own client, submit the scopes for
  verification.
- **Items don't appear but connecting worked** — the connection may be missing a
  scope. Set `COMPOSIO_GCAL_SCOPES` to
  `https://www.googleapis.com/auth/calendar.events`, then reconnect so the new
  scope set is granted.
- **The connection shows as expired** — the user revoked access in Google, or
  Google invalidated the session. Composio stops acting on that account until
  they reconnect, which is a single sign-in.

### Quick Start

1. **Sign up** - Create your free account in seconds
2. **Paste** - Copy any school message and paste it into SCOOP
3. **Review** - Check the extracted items and make any adjustments
4. **Save** - Add to your plan and you're done!

### Pro Tips

- **Tap a chip** on the capture screen for a worked example
- **Edit before saving** - fix a date or title and it only affects your plan
- **Export to your calendar** - use the Google or `.ics` button on any dated item
- **Re-paste freely** - duplicate items are skipped automatically

---

## 📲 Roadmap

### What's Here Now

- ✅ **Groq tool calling** for intelligent extraction from text
- ✅ Smart categorization (events, deadlines, tasks, RSVPs)
- ✅ Family sharing and synchronization
- ✅ Mobile-responsive design
- ✅ Calendar integration
- ✅ Task management

### Coming Soon

- 🔜 **Email forwarding** - Direct integration with your inbox
- 🔜 **WhatsApp bot** - Forward messages directly from WhatsApp
- 🔜 **Photo OCR** - Extract text from paper flyers and images
- 🔜 **Voice notes** - Speak your reminders and have them transcribed
- 🔜 **Recurring event detection** - Automatic setup for weekly/monthly activities
- 🔜 **Smart reminders** - AI-powered notifications based on your patterns

---

## 💬 Real User Stories

### Sarah, Mother of 2

"Before SCOOP, I was constantly missing things. The permission slip for the field trip? Lost. The deadline for the science fair project? Forgotten. Now I just paste everything into SCOOP and it tells me exactly what I need to do and when. My husband and I share the plan, so we're both on the same page."

### Mark, Single Dad

"As a single dad working full-time, keeping track of everything was overwhelming. SCOOP helps me stay organized without adding another complicated system to my life. The AI does most of the work — I just review and confirm."

### Priya, Elementary School Teacher (and Mom)

"I use SCOOP for both my students' communications and my own kids' schedules. The ability to quickly extract action items from long emails saves me hours every week. And the family plan feature means my kids know what's coming up too!"

---

## 🎯 Use Cases

### The Overwhelmed Parent

You receive 5 emails, 3 WhatsApp messages, and 2 paper flyers in one day. Instead of trying to remember it all, you paste everything into SCOOP and let it organize your week.

### The Forgetful Partner

Your partner handles most of the school stuff, but you want to stay informed. With SCOOP's shared plan, you can see everything at a glance and know exactly what's expected of you.

### The Busy Professional

You don't have time to read every school email carefully. SCOOP extracts the essential information so you can quickly scan and take action without reading through pages of details.

### The Organized Family

Everyone in your household has different schedules and commitments. SCOOP becomes the central hub where all family members can add, view, and track the family plan.

### The New Parent

You're still learning the ropes of school communications. SCOOP helps you understand what's important and what you need to do, with helpful explanations for school-specific terminology.

---

## 🏆 Why Parents Love SCOOP

**Saves Time** - No more reading and re-reading messages to figure out what to do

**Reduces Stress** - Nothing slips through the cracks when SCOOP is on the job

**Improves Communication** - Share the plan with your partner so you're both informed

**Builds Confidence** - Never feel like you're missing something important again

**Creates Peace** - The whole family knows what's happening and what's expected

**Easy to Use** - Simple interface that even the least tech-savvy parent can master

---

## 💭 FAQ

**Q: Is my data secure and private?**
A: User authentication is handled securely via Clerk, database storage uses Neon Postgres with TLS connection encryption, and text extraction is processed via Groq's API. We never sell your personal data or use it for advertising.

**Q: How does the AI extract school information?**
A: SCOOP uses **Groq tool calling** with structured schema parameters to parse school communications into events, deadlines, tasks, and RSVPs. When offline or unconfigured, an on-device rule parser handles extraction locally.

**Q: Can I use SCOOP for non-school items?**
A: Yes! While optimized for school chaos, SCOOP works great for any family organization — sports, social events, work schedules, and more.

**Q: What if the AI makes a mistake?**
A: You can review and edit all extracted items before saving them to your plan. You are always in control of the final result.


**Q: Do I need to forward every single email?**
A: Only the ones that contain actionable information. Feel free to skip the informational newsletters and just paste the important stuff.

**Q: Can my kids use SCOOP too?**
A: Yes! Older children can use SCOOP to manage their own schedules and responsibilities, with parental oversight.

---

**SCOOP: Because you have better things to do than organize school chaos.**

_Turn the overwhelming into the manageable. One paste at a time._
