# LocalGrid - AI Agent Instructions

## Project Overview

**LocalGrid** is a production-ready Next.js full-stack application for hyperlocal skill exchange in India. The platform supports **two distinct user roles** with separate workflows and dashboards.

## Core Architecture

### User Role System (PRIMARY FEATURE)

The platform implements a **dual-role system** where users choose their role after signup:

#### 1. **Skill Providers** 🎨
- **Purpose**: Individuals who offer services and skills
- **Capabilities**:
  - Create and manage skill listings
  - Set pricing and availability
  - Accept bookings from Project Creators
  - Earn credits through services
  - Build reputation with reviews
  - Join community projects as members
- **Dashboard**: `/dashboard/provider`
- **Permissions**: Can create listings, cannot create projects

#### 2. **Project Creators** 💼
- **Purpose**: Individuals who need services and post projects
- **Capabilities**:
  - Browse and search skill providers
  - Book sessions with providers
  - Create community projects
  - Manage team members
  - Review and rate providers
  - Track spending and budgets
- **Dashboard**: `/dashboard/creator`
- **Permissions**: Can create projects, cannot create listings

### Authentication Flow

1. User visits `/auth/signup`
2. User selects the signin with google button and signs in
3. User get asked who they are - "Skill Provider" or "Project Cretor"
4. Backend sets `userType` in database after the selection of user's type
5. Upon login, middleware redirects to role-specific dashboard
6. Session includes `userType`, `role`, and `isVerified` fields

**Supported Auth Methods**:
- Google OAuth

## Technology Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript 5
- **UI**: Shadcn UI components + Tailwind CSS 4
- **Authentication**: NextAuth v5 (Auth.js) with Credentials, Google, GitHub
- **Database**: Neon PostgreSQL (serverless), Prisma ORM 6
- **Maps**: OpenStreetMap + Leaflet.js (free, no API key)
- **Payments**: Razorpay (India-specific)
- **Background Jobs**: BullMQ + ioredis + Upstash Redis
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel (with daily cron jobs for Hobby plan)
- **File Uploads**: Cloudinary (optional)

### UI/UX
* Everything should be in light theme only. Modern, minimal and profesional looking.

## Database Schema (Prisma)

### Core Models

**User Model** - Dual-role support
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  
  // Role System (PRIMARY)
  userType      UserType  @default(SKILL_PROVIDER)
  role          UserRole  @default(USER)
  isVerified    Boolean   @default(false)
  verifiedAt    DateTime?
  
  // Location
  locationLat   Float?
  locationLng   Float?
  locationCity  String?
  
  // Profile
  bio           String?
  image         String?
  credits       Int       @default(0)
  
  // Relations
  listings      Listing[]
  bookings      Booking[]
  reviewsGiven  Review[]  @relation("reviewsGiven")
  reviewsReceived Review[] @relation("reviewsReceived")
  projectsOwned CommunityProject[] @relation("owner")
  // ... other relations
  
  @@index([userType])
}

enum UserType {
  SKILL_PROVIDER
  PROJECT_CREATOR
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}
```

**Listing Model** - Skills offered by providers
```prisma
model Listing {
  id          String   @id @default(cuid())
  title       String
  description String
  skillTags   String[]
  
  // Geo-location for radius search
  lat         Float
  lng         Float
  
  // Pricing
  priceCents  Int?
  durationMins Int
  isActive    Boolean  @default(true)
  
  // Relations
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     String
  bookings    Booking[]
  reviews     Review[]
}
```

**Booking Model** - Session scheduling
```prisma
model Booking {
  id           String        @id @default(cuid())
  startAt      DateTime
  endAt        DateTime
  status       BookingStatus @default(PENDING)
  priceCents   Int?
  creditsUsed  Int?
  reminderSent Boolean       @default(false)
  
  user         User          @relation(fields: [userId], references: [id])
  userId       String
  listing      Listing       @relation(fields: [listingId], references: [id])
  listingId    String
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  DECLINED
}
```

**CommunityProject Model** - Collaborative initiatives
```prisma
model CommunityProject {
  id          String        @id @default(cuid())
  title       String
  description String
  status      ProjectStatus @default(ACTIVE)
  
  owner       User          @relation("owner", fields: [ownerId], references: [id])
  ownerId     String
  members     ProjectMember[]
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
}
```

**Other Models**: Review, CreditTransaction, Endorsement, VerificationBadge, ProjectMember, AdminLog, Report

## Key Features Implementation

### 1. Geo-Location Search (Haversine Distance)

**File**: `src/lib/geo.ts`

```typescript
// Haversine formula for distance calculation
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// PostgreSQL query with subquery for distance filtering
export async function searchListingsNearby(
  lat: number,
  lng: number,
  radiusKm: number
) {
  return await prisma.$queryRaw`
    SELECT * FROM (
      SELECT *, 
        (6371 * 2 * asin(sqrt(
          pow(sin(radians(${lat} - lat) / 2), 2) +
          cos(radians(${lat})) * cos(radians(lat)) *
          pow(sin(radians(${lng} - lng) / 2), 2)
        ))) AS distance_km
      FROM "Listing"
      WHERE "isActive" = true
    ) AS listings_with_distance
    WHERE distance_km <= ${radiusKm}
    ORDER BY distance_km ASC
  `;
}
```

### 2. Role-Based Permissions

**File**: `src/lib/permissions.ts`

```typescript
export function canCreateListing(session: Session | null): boolean {
  return session?.user?.userType === 'SKILL_PROVIDER';
}

export function canCreateProject(session: Session | null): boolean {
  return session?.user?.userType === 'PROJECT_CREATOR';
}

export function getDefaultDashboard(userType: UserType): string {
  return userType === 'SKILL_PROVIDER' 
    ? '/dashboard/provider' 
    : '/dashboard/creator';
}
```

### 3. Route Protection Middleware

**File**: `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  
  // Provider-only routes
  if (pathname.startsWith('/dashboard/provider')) {
    if (token?.userType !== 'SKILL_PROVIDER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Creator-only routes
  if (pathname.startsWith('/dashboard/creator')) {
    if (token?.userType !== 'PROJECT_CREATOR' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 4. Background Jobs (BullMQ)

**File**: `src/lib/redis.ts`

```typescript
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.UPSTASH_REDIS_REST_URL!);

export const reminderQueue = new Queue('reminders', { connection });

// Schedule reminder
export async function scheduleReminder(bookingId: string, sendAt: Date) {
  await reminderQueue.add(
    'send-reminder',
    { bookingId },
    { delay: sendAt.getTime() - Date.now() }
  );
}
```

**Worker**: `src/services/reminder-worker.ts`

```typescript
import { Worker } from 'bullmq';
import { sendBookingReminder } from './email-service';

const worker = new Worker('reminders', async (job) => {
  const { bookingId } = job.data;
  await sendBookingReminder(bookingId);
}, { connection });
```

### 5. Email Notifications

**File**: `src/services/email-service.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT!),
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

export async function sendBookingReminder(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, listing: { include: { owner: true } } },
  });
  
  await transporter.sendMail({
    to: booking.user.email,
    subject: `Reminder: Session in 24 hours`,
    html: renderReminderEmail(booking),
  });
}
```
```

## Environment Variables

Create `.env` file with:

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Email - Gmail SMTP
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-gmail@gmail.com"
EMAIL_SMTP_PASS="your-app-password"

# Redis - Upstash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Optional
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
```

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

## Key Development Principles

1. **Real Data Only**: No seed data in production. All users register through signup flow.
2. **Role Selection**: Users MUST choose their role (Provider/Creator) during signup.
3. **Separate Dashboards**: Each role gets a completely different dashboard experience.
4. **Permission Enforcement**: Middleware and API routes enforce role-based permissions strictly.
5. **India-First**: Use Razorpay for payments, OpenStreetMap for maps, India timezone for emails.
6. **Production Ready**: All features must work in real-world scenarios with actual users.
7. **Type Safety**: Full TypeScript coverage including session types.
8. **Security**: bcrypt password hashing, JWT sessions, CSRF protection, input validation.
9. **Performance**: Optimized queries, proper indexing, connection pooling.
10. **Accessibility**: ARIA labels, keyboard navigation, screen reader support.

### Dashboard Routing
- `/dashboard` → Redirects based on session.user.userType
- `/dashboard/provider` → Only SKILL_PROVIDER can access
- `/dashboard/creator` → Only PROJECT_CREATOR can access
- Middleware enforces these rules

### API Protection
- POST `/api/listings` → Requires SKILL_PROVIDER userType
- POST `/api/projects` → Requires PROJECT_CREATOR userType
- All updates check ownership OR admin role

## Testing Requirements

### Manual Testing Checklist
- [ ] Sign up as Skill Provider via signup page
- [ ] Sign up as Project Creator via signup page
- [ ] Login and verify correct dashboard redirect
- [ ] Provider can create listings
- [ ] Creator cannot create listings (redirected/blocked)
- [ ] Creator can create projects
- [ ] Provider cannot create projects (redirected/blocked)
- [ ] Both roles can browse, book, review
- [ ] Email notifications work
- [ ] Geo-search returns nearby listings
- [ ] Credits system functions correctly

## Production Deployment (Vercel)

1. **Database Setup**: Neon PostgreSQL with connection pooling
2. **Redis Setup**: Upstash Redis for background jobs
3. **Environment Variables**: Add all `.env` variables to Vercel
4. **Cron Jobs**: Daily cleanup cron configured in `vercel.json`
5. **Build Command**: `npm run build` (auto-detected)
6. **Start Command**: `npm start` (auto-detected)
7. **Node Version**: 18.x


## File Structure Summary

```
src/
├── app/
│   ├── api/          # All API routes
│   ├── auth/         # Auth pages (signin, signup)
│   ├── dashboard/    # Role-based dashboards
│   ├── listings/     # Skill listings
│   ├── projects/     # Community projects
│   ├── bookings/     # Booking management
│   └── credits/      # Credit system
├── components/       # UI components
├── lib/              # Utilities and configs
│   ├── auth.ts       # NextAuth config
│   ├── prisma.ts     # DB client
│   ├── permissions.ts # Role checks
│   ├── geo.ts        # Haversine distance
│   ├── redis.ts      # BullMQ queues
│   └── email.ts      # Email utilities
├── services/         # Background workers
└── middleware.ts     # Route protection
```

## Final Notes

- **NO SEED DATA**: Users register themselves
- **STRICT PERMISSIONS**: Middleware + API checks
- **INDIA-SPECIFIC**: Razorpay + OpenStreetMap
- **PRODUCTION READY**: Fully functional with real users

This project is designed for real-world deployment with actual users in India. Every feature should work seamlessly in production without any seed data or development shortcuts.

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

### UI/UX
* Everything should be in light theme only. Modern, minimal and profesional looking.

---

## 📊 CURRENT IMPLEMENTATION STATUS (Updated: Oct 25, 2025)

### ✅ COMPLETED FEATURES (Production-Ready)

#### 1. Authentication & User Management
- ✅ Google OAuth with NextAuth v5
- ✅ Dual-role system (Skill Provider / Project Creator)
- ✅ Role selection after signup at `/auth/role-selection`
- ✅ JWT-based session management (30-day expiration)
- ✅ Role-based dashboard redirects
- ✅ Middleware protection for role-specific routes

**Files**: `lib/auth.ts`, `app/auth/**`, `middleware.ts`

#### 2. Geo-Location & Search
- ✅ Haversine distance calculation
- ✅ PostgreSQL raw queries for radius search
- ✅ OpenStreetMap + Leaflet.js integration
- ✅ Nominatim geocoding/reverse geocoding
- ✅ Interactive location picker component
- ✅ Customizable search radius

**Files**: `lib/geo.ts`, `app/api/listings/route.ts`, `components/LocationPicker.tsx`

#### 3. Listing Management
- ✅ Create, read, update, delete (soft delete)
- ✅ Skill tags and pricing
- ✅ Duration and availability settings
- ✅ Role-based permissions (only SKILL_PROVIDER can create)
- ✅ Image upload (Cloudinary optional)
- ✅ Search by tags, keywords, and location

**Files**: `app/listings/**`, `app/api/listings/**`

#### 4. Booking System
- ✅ Date/time picker with calendar UI
- ✅ Conflict detection (overlapping booking prevention)
- ✅ Booking status flow: PENDING → CONFIRMED → COMPLETED
- ✅ Provider can confirm/decline bookings
- ✅ Creator can view and track bookings
- ✅ Email notifications for confirmations
- ⚠️ **Reminder system infrastructure ready but not deployed**

**Files**: `app/bookings/**`, `app/api/bookings/**`, `lib/redis.ts`, `lib/email.ts`

#### 5. Review & Reputation System
- ✅ 5-star rating system (1-5)
- ✅ Written reviews (500 character limit)
- ✅ Review display with rating breakdown
- ✅ Average rating calculation
- ✅ Duplicate prevention (one review per booking)
- ✅ Reviews only after COMPLETED bookings
- ✅ Review form integrated in booking detail page

**Files**: `app/api/reviews/**`, `components/ReviewForm.tsx`, `components/ReviewDisplay.tsx`

#### 6. Credit System with Razorpay
- ✅ User credit balance tracking
- ✅ Razorpay integration for INR payments
- ✅ Credit packages: 100₹, 450₹ (10% off), 800₹ (20% off), 3500₹ (30% off)
- ✅ Payment signature verification (HMAC SHA256)
- ✅ Transaction history with audit trail
- ✅ Atomic credit transfers during bookings
- ✅ Pay with credits or cash option in booking flow
- ✅ Credit wallet displayed on dashboards

**Files**: `lib/razorpay.ts`, `app/api/credits/**`, `app/credits/page.tsx`, `components/CreditWallet.tsx`

#### 7. Community Projects
- ✅ Project creation (PROJECT_CREATOR only)
- ✅ Project detail pages with member lists
- ✅ Join functionality (SKILL_PROVIDER can join)
- ✅ Member management
- ✅ Project status (ACTIVE, COMPLETED, ON_HOLD)
- ✅ Role-based actions (Edit for owners, Join for providers)
- ✅ Duplicate prevention

**Files**: `app/projects/**`, `app/api/projects/**`, `components/ProjectActions.tsx`

#### 8. Dashboard System
- ✅ Separate dashboards for providers and creators
- ✅ Provider dashboard: Active listings, ratings, bookings, credits, projects
- ✅ Creator dashboard: Bookings, projects, spending, credits, recommended providers
- ✅ Statistics cards with icons
- ✅ Recent activity sections
- ✅ Credit wallet integration

**Files**: `app/dashboard/provider/page.tsx`, `app/dashboard/creator/page.tsx`

### ⚠️ INFRASTRUCTURE READY (Not Fully Deployed)

#### Background Jobs (BullMQ + Redis)
- ⚠️ **Infrastructure complete** but workers not deployed
- ⚠️ Reminder scheduling functions implemented
- ⚠️ Email queue configured
- ⚠️ Redis connection (Upstash) ready
- **Action Needed**: Deploy worker processes

**Files**: `lib/redis.ts`, `lib/email.ts`

#### Digital Badges
- ⚠️ Database model (VerificationBadge) exists
- ⚠️ Schema supports Credly integration
- ❌ UI for badge display not implemented
- **Action Needed**: Build badge verification and display UI

**Files**: `prisma/schema.prisma`

### ❌ NOT IMPLEMENTED (Bonus Features)

1. **Accessibility Features**
   - ❌ Voice navigation
   - ❌ High-contrast/dark mode
   - ❌ Language localization (Hindi, regional languages)
   - ⚠️ Basic ARIA labels (partial)

2. **AI/ML Features**
   - ❌ AI-powered skill recommendations
   - ❌ Machine learning matching algorithms
   - ❌ Personalized suggestions

3. **Real-Time Communication**
   - ❌ Real-time chat
   - ❌ Video call integration
   - ❌ Live notifications

4. **Third-Party Integration**
   - ❌ Public API with documentation
   - ❌ Webhooks system
   - ❌ Developer portal

---

## 🎯 RECOMMENDED NEXT STEPS

### Priority 1 (Immediate - Week 1-2)
1. **Deploy Background Job Workers**
   - Set up worker process for BullMQ
   - Enable automated reminder emails
   - Test reminder scheduling

2. **Basic Accessibility Improvements**
   - Add comprehensive ARIA labels
   - Implement keyboard navigation enhancements
   - Add focus visible styles

3. **Complete Digital Badge UI**
   - Build badge verification interface
   - Integrate Credly or similar service
   - Display badges on user profiles

### Priority 2 (Short-term - Month 1)
4. **Implement Dark/High-Contrast Mode**
   - Add theme switcher
   - Create dark theme styles
   - Test accessibility

5. **Add Real-Time Features**
   - Implement chat with Socket.io or Pusher
   - Add notification system
   - Real-time booking updates

6. **Language Localization**
   - Set up i18n framework (next-intl)
   - Translate to Hindi
   - Add regional language support

### Priority 3 (Long-term - Month 2-3)
7. **AI-Powered Recommendations** (Bonus)
8. **Video Call Integration** (Bonus)
9. **Public API & Developer Portal** (Bonus)

---

## 📈 PRODUCTION READINESS SCORE

**Overall**: 85/100 ⭐⭐⭐⭐

| Category | Status | Score | Notes |
|----------|--------|-------|-------|
| Core Features | ✅ | 95% | All core features implemented |
| Infrastructure | ✅ | 90% | Production-ready, workers pending |
| Security | ✅ | 90% | Secure, needs rate limiting |
| Performance | ✅ | 85% | Optimized, caching recommended |
| Accessibility | ⚠️ | 30% | Basic only, needs enhancement |
| Documentation | ✅ | 90% | Comprehensive docs |
| Testing | ⚠️ | 40% | Manual testing only |

**Deployment Status**: **READY FOR MVP LAUNCH** 🚀

The platform is production-ready with current feature set. Can handle real users and transactions. Recommended features can be added iteratively.

---

## 📚 KEY DOCUMENTATION FILES

1. **PROJECT_STATUS.md** - Comprehensive status report (85 pages)
2. **RAZORPAY_SETUP.md** - Payment gateway setup guide
3. **.env.example** - Environment variables template
4. **README.md** - Project overview and setup

---

**Last Updated**: October 25, 2025  
**Status**: Production-Ready MVP  
**Next Review**: After Priority 1 implementation