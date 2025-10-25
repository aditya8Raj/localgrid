# LocalGrid - AI Agent Instructions

Use the entire block below as the single instruction to the Copilot Agent. It tells the agent exactly what to create, how to structure the repo, and how to validate each feature.

```
You are Copilot Agent. Build a production-ready, fully-tested, production-deployable Next.js full-stack application called **LocalSkill** (internal name). The stack, constraints, and product goals are:

- Next.js (App Router), TypeScript
- UI: shadcn/ui components + TailwindCSS; add complementary shadcn-based components as needed
- Auth: NextAuth with Google, GitHub, Email/Password (Credentials provider)
- DB: Neon Postgres (Prisma ORM). Use lat/lng on listings and users for geo matching (Haversine).
- Deploy: Vercel
- Background jobs / reminders: Upstash Redis + BullMQ or Vercel Cron + serverless endpoint (choose simplest stable option and document)
- Email: SendGrid (or SMTP fallback)
- Tests: Jest + React Testing Library for unit; Playwright for e2e
- Linting/formatting: ESLint, Prettier, commitlint, Husky
- CI: GitHub Actions for PR checks (lint/test/build) — Vercel handles main deploys.
- Accessibility & i18n: follow a11y best practices and include next-intl for localization

Work in small commits and open meaningful PRs (one feature per branch). Add thorough README and developer docs.

## Definition of Done (high-level)
1. App runs locally (`pnpm dev`) and supports sign-up/sign-in via Google, GitHub, email/password.
2. Users can create profiles, add skills/listings, search by radius, book sessions with calendar availability, confirm, and rate each other.
3. Booking calendar with conflict detection, automated reminders via scheduled job + email, and an appointment page.
4. Reputation: ratings/reviews and endorsements UI + DB logic.
5. Community projects: create/join/list projects, manage members and statuses.
6. Token/credit system: earn/spend/transfer credits; admin can top-up or adjust.
7. Responsive, accessible UI using shadcn components + dark mode.
8. Unit & e2e tests for core flows; CI passes for PRs.
9. Deployment-ready config on Vercel with environment variables documented.

## Repo & Branching
- repo: `localskill` (root)
- branches: `main` (protected, auto-deploy), `develop`, feature branches `feat/<short-desc>`
- PR policy: All PRs from `feat/*` → `develop` or `main` require:
  - passing GH Actions (lint, tests)
  - 1 approving review
  - meaningful PR description with screenshots (if UI)

## Initial repo scaffold (create these files and folders)
```

/ (root)
├─ .github/workflows/ci.yml
├─ .husky/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/         # shadcn + app-specific components
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ auth.ts
│  │  └─ geo.ts
│  ├─ pages/              # API routes for server actions (if needed)
│  ├─ services/           # email, payments, jobs, schedulers
│  ├─ tests/
│  └─ prisma/seed.ts
├─ public/
├─ scripts/
│  └─ reset-db.sh
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js
├─ postcss.config.js
└─ README.md

```

## package.json (core deps)
Install (pnpm recommended):
- next, react, react-dom, typescript
- @prisma/client, prisma
- next-auth
- @shadcn/ui packages (and shadcn shadcn/ui setup)
- tailwindcss, postcss, autoprefixer
- bcrypt
- axios
- date-fns
- bullmq (or suitable job lib), ioredis
- upstash for Redis if chosen
- @sendgrid/mail
- jest, @testing-library/react, @testing-library/jest-dom
- playwright

## Environment variables (.env.example)
```

DATABASE_URL="postgresql://<user>:<pass>@<host>:<port>/<db>?schema=public"
NEXTAUTH_URL="[https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)" # or [http://localhost:3000](http://localhost:3000) for dev
NEXTAUTH_SECRET="long_random_secret"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
SENDGRID_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
JWT_SECRET=
EMAIL_SMTP_HOST=
EMAIL_SMTP_PORT=
EMAIL_SMTP_USER=
EMAIL_SMTP_PASS=
VERCEL_TOKEN=

````

## Prisma schema (prisma/schema.prisma)
Create a robust schema mapping core entities:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  email         String    @unique
  name          String?
  avatarUrl     String?
  bio           String?
  locationLat   Float?
  locationLng   Float?
  locationCity  String?
  passwordHash  String?   // used if email/password signup
  role          UserRole  @default(USER)
  credits       Int       @default(0)
  listings      Listing[]
  reviewsGiven   Review[] @relation("reviewsGiven")
  reviewsReceived Review[] @relation("reviewsReceived")
  badges        VerificationBadge[]
  endorsements  Endorsement[]
  projectsOwned CommunityProject[] @relation("owner")
  projectMemberships ProjectMember[]
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

model Listing {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  title       String
  description String
  skillTags    String[]  // e.g., ["guitar", "spanish"]
  owner       User      @relation(fields: [ownerId], references: [id])
  ownerId     String
  lat         Float
  lng         Float
  priceCents  Int?      // optional price, or 0 for barter/credit-based
  durationMins Int
  isActive    Boolean  @default(true)
  reviews     Review[]
  bookings    Booking[]
}

model Booking {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  userId        String
  listing       Listing  @relation(fields: [listingId], references: [id])
  listingId     String
  startAt       DateTime
  endAt         DateTime
  status        BookingStatus @default(PENDING)
  priceCents    Int?
  creditsUsed   Int?
  reminderSent  Boolean @default(false)
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  DECLINED
}

model Review {
  id       String   @id @default(cuid())
  rating   Int      // 1-5
  comment  String?
  createdAt DateTime @default(now())
  reviewer User     @relation("reviewsGiven", fields: [reviewerId], references: [id])
  reviewerId String
  subject  User     @relation("reviewsReceived", fields: [subjectId], references: [id])
  subjectId String
  listing  Listing? @relation(fields: [listingId], references: [id])
  listingId String?
}

model Endorsement {
  id       String @id @default(cuid())
  from     User   @relation("endorser", fields: [fromId], references: [id])
  fromId   String
  to       User   @relation("endorsed", fields: [toId], references: [id])
  toId     String
  skill    String
  createdAt DateTime @default(now())
}

model VerificationBadge {
  id       String @id @default(cuid())
  provider String // e.g., "credly"
  badgeId  String
  user     User   @relation(fields: [userId], references: [id])
  userId   String
  issuedAt DateTime @default(now())
}

model CommunityProject {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  title       String
  description String
  owner       User     @relation("owner", fields: [ownerId], references: [id])
  ownerId     String
  members     ProjectMember[]
  status      ProjectStatus @default(ACTIVE)
}

model ProjectMember {
  id        String @id @default(cuid())
  user      User   @relation(fields: [userId], references: [id])
  userId    String
  project   CommunityProject @relation(fields: [projectId], references: [id])
  projectId String
  role      ProjectRole @default(MEMBER)
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
}

enum ProjectRole {
  MEMBER
  MANAGER
}

model CreditTransaction {
  id        String  @id @default(cuid())
  user      User    @relation(fields: [userId], references: [id])
  userId    String
  amount    Int     // positive or negative
  reason    String?
  createdAt DateTime @default(now())
}
````

## Key backend utilities

* `lib/prisma.ts` — export a singleton Prisma client
* `lib/auth.ts` — NextAuth configuration + adapter
* `lib/geo.ts` — haversine distance helper + SQL snippet to search within radius:

Haversine SQL for Postgres (example):

```ts
// SELECT *, (6371 * 2 * asin(sqrt( sin(radians(lat - :lat)/2)^2 + cos(radians(:lat)) * cos(radians(lat)) * sin(radians(lng - :lng)/2)^2 ))) as distance_km FROM "Listing" WHERE isActive = true HAVING distance_km <= :radius_km ORDER BY distance_km;
```

Or use Prisma raw query:

```ts
const query = await prisma.$queryRaw`
  SELECT *, (6371 * 2 * asin(sqrt(
    pow(sin(radians(${lat} - lat) / 2), 2) +
    cos(radians(${lat})) * cos(radians(lat)) *
    pow(sin(radians(${lng} - lng) / 2), 2)
  ))) AS distance_km
  FROM "Listing"
  WHERE "isActive" = true
  HAVING distance_km <= ${radiusKm}
  ORDER BY distance_km;
`;
```

## NextAuth config (outline)

* Use `PrismaAdapter` from `@next-auth/prisma-adapter`
* Providers: Google, GitHub, Credentials (for email/password)
* For Credentials provider, store hashed password with `bcrypt` on sign-up; custom sign-up flow via API route that creates user and passwordHash
* Ensure `NEXTAUTH_SECRET` set

Sample NextAuth skeleton in `src/lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({...}),
    GitHubProvider({...}),
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) throw new Error("Invalid");
        const match = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!match) throw new Error("Invalid");
        return user;
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
});
```

## API routes and server actions

Implement RESTful API/Server Actions for:

* `/api/listings` (create, edit, search)
* `/api/bookings` (create booking, check conflicts, confirm/cancel)
* `/api/credits` (transactions)
* `/api/reviews` (create review)
* `/api/projects` (create/join/manage)
* `/api/webhooks/reminder` (called by cron to send reminders)
* `/api/verify/credly` (integration point for digital badges)

## Frontend pages & components (App Router)

* `/` Home / discover feed: shows local listings, filter by tags, radius slider, sort by distance/rating
* `/auth/*` Sign-in/Sign-up flows, magic link for email
* `/profile/[id]` public profiles with skills, reviews, badges, contact button
* `/dashboard` for logged-in user: listings, bookings, credits, calendar
* `/listings/new` create listing wizard (title, description, tags, price, duration, location pin on map)
* `/bookings/[id]` booking detail & calendar
* `/projects/*` create/join/manage projects
* `/admin` (protected) for top-ups, moderation

Components:

* `SearchBar`, `ListingCard`, `ProfileCard`, `Calendar` (use FullCalendar or react-big-calendar), `BookingModal`, `CreditWidget`, `ProjectCard`, `RatingStars`, `BadgeList`, `LocationPicker` (use Leaflet or Mapbox; Mapbox token required)

UI notes:

* Base UI with shadcn templates; use Tailwind dark/light toggle
* Accessible forms with `aria-*` attributes
* Use client components only where necessary; put expensive logic server-side

## Booking & Calendar

* Use `react-big-calendar` or `FullCalendar` for UI
* Booking flow:

  1. User checks listing availability using listing.owner availability data + existing bookings for overlap
  2. If available, create Booking with status `PENDING`
  3. Owner confirms → `CONFIRMED` (or auto-confirm depending on listing settings)
  4. After session, owner/user can mark `COMPLETED` and leave reviews
* Conflict detection: when creating booking, run a DB query to ensure no overlapping `CONFIRMED` bookings for that listing between `startAt` and `endAt`.

## Reminders and Background Jobs

* Option A (recommended): Use Upstash Redis + BullMQ:

  * When booking is confirmed, schedule jobs for reminders (e.g., 24h, 1h) that call an API endpoint to send email (SendGrid) / push notification.
  * Add a recurring job for daily cleanup or auto-complete for past bookings.
* Option B: Use Vercel Cron (if available) or GitHub Actions scheduled task hitting a `/api/cron` endpoint to process scheduled reminders.

Document chosen approach in README and implement one.

## Incentive token / credits

* Credits stored as integer on `User.credits`
* When a user completes a paid booking, transfer credits: deduct from buyer, add to provider minus platform fee
* Admin routes to grant or revoke credits
* UX: Credits wallet page and simple purchase flow (Stripe optional — initial MVP can be credit top-up via Stripe, or admin top-ups)

## Verification & Badges

* Integrate Credly via webhooks / API: store `VerificationBadge` records
* Provide in-profile badge UI with link back to Credly badge

## Security & Best Practices

* Hash passwords with bcrypt (salt rounds 10+)
* Use HTTPS (Vercel provides)
* Validate all API inputs using Zod
* Rate-limit sign-up/login attempts (simple in-memory + Redis)
* Use CSP headers, sanitize rich text, and set Secure cookies
* Use server-side checks for every action (ensure request.user === resource.owner for edits)

## Testing

* Unit tests for lib functions (geo/haversine, price calculations) with Jest
* Component tests with React Testing Library
* e2e tests with Playwright for flows: sign-up, create listing, search, book, confirm, review, credit transfer
* Coverage threshold >= 70% initially

## CI (`.github/workflows/ci.yml`)

Run on PRs:

* checkout
* pnpm install
* pnpm lint
* pnpm test
* pnpm build (Next.js production build)

Example step: (see full YAML later in documentation)

## Linting & Pre-commit hooks

* ESLint with Next.js plugin + TypeScript rules
* Prettier config
* husky hooks: `pre-commit` run `pnpm lint:staged` & `pnpm test:changed`
* commitlint for Conventional Commits

## Deploy to Vercel

* Connect GitHub repo to Vercel
* Set environment variables listed earlier
* Configure Vercel to auto-deploy main branch
* Use Vercel secrets for tokens

## Documentation & README

* Include:

  * Local dev steps
  * Env var list
  * Schema overview
  * How to run jobs and the cron config
  * How to run tests
  * How to create admin user (seed script)
  * Data retention & privacy basics

## Acceptance tests (what you must create to mark feature done)

1. Sign-up/sign-in via Google and email/password works and sets session cookie.
2. Create listing with lat/lng, see it on discovery with correct distance when using radius filter.
3. Book session which detects conflict and allows confirm/decline.
4. Reminders sent via email for confirmed booking (simulate via dev email or log).
5. Post-session review is stored and visible on profile; rating updates average rating.
6. Credits transferred correctly after a completed paid booking.
7. Create/join community project; member list updated; owner can complete project.
8. Accessibility checker (axe-core) shows no high-severity A11y defects on main pages.

### Fallback decisions agent should make when spec missing:

* If map token not provided: use simple address + lat/lng input; no map widget.
* For payments: if Stripe keys absent, implement credits-only flow and admin top-up UI.
* For reminders: if Upstash account not provided, implement a simple cron endpoint and document how to wire a scheduler.

## India-Specific Integrations (IMPORTANT)

**This project is designed specifically for users in India. Use these integrations:**

### Payment Gateway
* **USE Razorpay** (NOT Stripe) - India's leading payment gateway
* Get API keys from: https://dashboard.razorpay.com/
* Environment variables:
  - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (server-side)
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID` (client-side)
  - `RAZORPAY_WEBHOOK_SECRET` (for webhook verification)
* Features: UPI, Cards, NetBanking, Wallets (Paytm, PhonePe, etc.)
* Documentation: https://razorpay.com/docs/

### Maps & Geolocation
* **USE OpenStreetMap with Leaflet.js** (NOT Google Maps) - Free & Open Source
* No API keys required
* Libraries to install:
  - `leaflet` - Map rendering library
  - `react-leaflet` - React components for Leaflet
  - `@types/leaflet` - TypeScript definitions
* Tile server URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
* Alternative free tile servers: https://wiki.openstreetmap.org/wiki/Tile_servers
* For geocoding (address → lat/lng): Use Nominatim API (free, no key required)
  - API: `https://nominatim.openstreetmap.org/search?q={address}&format=json`
  - Add User-Agent header with your app name
* For reverse geocoding (lat/lng → address): Use Nominatim reverse API
  - API: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json`

### Implementation Notes
* Razorpay supports INR currency by default
* OpenStreetMap data is crowd-sourced and updated regularly
* Both integrations are production-ready and widely used in India
* Cost: Razorpay charges ~2% per transaction; OpenStreetMap is completely free

## Deliverables & commit strategy

* Deliver in these milestones (each as a PR):

  1. Project scaffold + auth (NextAuth) + Prisma + seed + dev README
  2. Listings creation + discovery + geo search
  3. Profile, badges, endorsements
  4. Booking flow + calendar UI + conflict detection
  5. Reminders + background jobs + email notifications
  6. Credits system + transactions + top-up
  7. Community projects
  8. Tests + CI + accessibility checks
  9. Polish: responsive UI, dark mode, translations
  10. Deployment: Vercel configuration and production smoke-test

## PR template and commit message samples

* PR title: `feat(listings): add create/list endpoints and discovery`
* Body: Short description, screenshots, test plan, migrations included, any env var changes, reviewer checklist.

## Developer tips for Copilot interaction in VS Code

* Work in small chunks: ask Copilot to generate a single component or API file per request, commit, then ask for tests for that file.
* Use `// TODO: acceptance-test` comments inside generated functions to prompt Copilot to add test scaffolding.
* Use `/* agent: run-task <task-name> */` convention in comments to list tasks; the agent should turn each into a commit.
* Use inline example requests in PR descriptions so Copilot can run against test data.

## Final checklist before merge to main

* All tests pass, coverage threshold met
* E2E tests pass on GH Actions
* Basic accessibility checks pass
* Environment variables documented
* Database migration included and seed script present
* No console errors and no high-severity security issues from a quick scan

--- END OF AGENT PROMPT

````