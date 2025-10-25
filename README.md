# LocalGrid - Hyperlocal Skill Exchange Platform

🌟 **Connect. Share. Grow Together.**

LocalGrid is a comprehensive full-stack web application that facilitates hyperlocal skill exchange, strengthens community bonds, and fosters economic empowerment in urban neighborhoods across India.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-Latest-brightgreen)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)

---

## 🚀 Features

### 🎭 Dual User Roles

LocalGrid supports two distinct user types, each with specialized dashboards and capabilities:

#### **Skill Providers** 🎨
- Create and manage skill listings
- Set pricing and availability
- Accept bookings from project creators
- Earn credits through services
- Build reputation with reviews and ratings
- Showcase verified skills and badges
- Join community projects as members

#### **Project Creators** 💼
- Post community projects and opportunities
- Browse and search local skill providers
- Book sessions with providers
- Manage team members and collaborations
- Review and rate service providers
- Track project spending and budgets
- Build network of trusted professionals

### Core Platform Features

- **🔐 Multi-Role Authentication**
  - Role selection during signup (Provider or Creator)
  - Multiple auth methods: Google, GitHub, Email/Password
  - Secure password hashing with bcrypt
  - Role-based dashboard routing
  - Session management with NextAuth v5

- **📍 Geo-Location Matching**
  - Discover skills and services in your area using OpenStreetMap
  - Haversine distance calculations for accurate radius search
  - Location-based filtering with customizable radius
  - Interactive map view with Leaflet.js
  - City-based search for India locations

- **📅 Booking & Scheduling**
  - Built-in calendar system with FullCalendar
  - Automated email reminders (24h and 1h before sessions)
  - Conflict detection and availability management
  - Session confirmation workflow
  - BullMQ background job processing

- **⭐ Reputation System**
  - 5-star ratings and detailed reviews
  - Skill endorsements from other users
  - Digital badge verification (Credly integration ready)
  - Average rating calculations
  - Trust scores and verification status

- **🤝 Community Projects**
  - Create collaborative initiatives
  - Project status tracking (Active, Completed, On Hold)
  - Member role management (Member, Manager)
  - Project-based networking
  - Team coordination tools

- **🪙 Credit System**
  - Earn credits by providing services
  - Spend credits to book providers
  - Transfer credits between users
  - Transaction history and analytics
  - Admin credit top-up capability

- **📧 Email Notifications**
  - Automated booking reminders via Gmail SMTP
  - Session confirmation emails
  - Review request notifications
  - HTML email templates with India timezone support

- **♿ Accessibility & Inclusivity**
  - Light/Dark mode with system detection
  - Keyboard navigation support
  - ARIA labels for screen readers
  - Responsive mobile-first design
  - High contrast mode ready

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) with React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn UI (Radix UI primitives)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Maps:** Leaflet.js + React-Leaflet with OpenStreetMap
- **Calendar:** FullCalendar for booking management
- **Notifications:** Sonner for toast messages

### Backend
- **Authentication:** NextAuth.js v5 (Auth.js)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Prisma 6
- **Background Jobs:** BullMQ + ioredis
- **Queue System:** Upstash Redis
- **Email:** Nodemailer with Gmail SMTP
- **File Upload:** Cloudinary (ready for integration)
- **Payments:** Razorpay (India-specific, ready for integration)

### DevOps & Tools
- **Deployment:** Vercel (with daily cron jobs)
- **Version Control:** Git & GitHub
- **Code Quality:** ESLint + Prettier
- **Package Manager:** npm/pnpm
- **Environment:** Node.js 18+

---

## 📦 Prerequisites

- **Node.js** 18.17 or higher
- **npm** or **pnpm** package manager
- **PostgreSQL** database (Neon account recommended)
- **Upstash Redis** account for background jobs
- **Gmail** account for SMTP email notifications
- **Google OAuth** credentials (optional, for Google login)
- **GitHub OAuth** credentials (optional, for GitHub login)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aditya8Raj/localgrid.git
cd localgrid
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database - Neon PostgreSQL (https://console.neon.tech/)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth Configuration
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
# Google OAuth: https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth: https://github.com/settings/developers
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"

# Email Configuration - Gmail SMTP
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-gmail@gmail.com"
EMAIL_SMTP_PASS="your-gmail-app-password"

# Redis - Upstash (https://console.upstash.com/)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key-id"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to see your application.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
localgrid/
├── .github/
│   ├── copilot-instructions.md    # AI agent development guidelines
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
├── prisma/
│   ├── schema.prisma              # Database schema with 11 models
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Database migration history
├── public/                        # Static assets (images, fonts)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   │   ├── [...nextauth]/ # NextAuth handler
│   │   │   │   └── register/      # User registration
│   │   │   ├── bookings/          # Booking management
│   │   │   ├── credits/           # Credit transactions
│   │   │   ├── listings/          # Skill listings CRUD
│   │   │   ├── projects/          # Community projects
│   │   │   ├── reviews/           # Reviews and ratings
│   │   │   ├── upload/            # File uploads
│   │   │   ├── users/             # User management
│   │   │   └── cron/              # Scheduled jobs
│   │   ├── auth/                  # Authentication pages
│   │   │   ├── signin/            # Sign in page
│   │   │   └── signup/            # Sign up with role selection
│   │   ├── dashboard/             # Role-based dashboards
│   │   │   ├── provider/          # Skill Provider dashboard
│   │   │   └── creator/           # Project Creator dashboard
│   │   ├── listings/              # Skill listings pages
│   │   │   ├── [id]/              # Listing detail page
│   │   │   ├── new/               # Create listing (providers only)
│   │   │   └── edit/[id]/         # Edit listing
│   │   ├── bookings/              # Booking management
│   │   ├── credits/               # Credit management
│   │   ├── projects/              # Community projects
│   │   ├── profile/[id]/          # User profiles
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── ui/                    # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...                # 30+ reusable components
│   │   ├── providers/             # React context providers
│   │   ├── BookingCalendar.tsx    # Calendar component
│   │   ├── ListingCard.tsx        # Listing display card
│   │   ├── ListingMap.tsx         # Map view with markers
│   │   ├── LocationPicker.tsx     # Location selection
│   │   ├── Navbar.tsx             # Navigation bar
│   │   └── ...                    # App-specific components
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── redis.ts               # BullMQ queue setup
│   │   ├── geo.ts                 # Haversine distance calculations
│   │   ├── email.ts               # Email sending utilities
│   │   ├── permissions.ts         # Role-based permissions
│   │   └── utils.ts               # Utility functions
│   ├── services/
│   │   ├── email-service.ts       # Email templates and sending
│   │   └── reminder-worker.ts     # Background job worker
│   ├── types/
│   │   └── next-auth.d.ts         # NextAuth type extensions
│   └── middleware.ts              # Route protection middleware
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment template
├── .eslintrc.json                 # ESLint configuration
├── .gitignore                     # Git ignore rules
├── .npmrc                         # NPM configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vercel.json                    # Vercel deployment config
└── README.md                      # This file
```

## 🗄️ Database Schema

LocalGrid uses Prisma ORM with PostgreSQL. The schema includes 11 interconnected models:

### Core Models

**User** - User accounts with dual role support
```prisma
- id, email, name, bio, image
- userType: SKILL_PROVIDER | PROJECT_CREATOR
- role: USER | MODERATOR | ADMIN
- isVerified, verifiedAt
- locationLat, locationLng, locationCity
- credits, passwordHash
```

**Listing** - Skill offerings by providers
```prisma
- title, description, skillTags[]
- lat, lng (for geo-search)
- priceCents, durationMins
- isActive status
- Relationships: owner (User), reviews, bookings
```

**Booking** - Session scheduling
```prisma
- startAt, endAt timestamps
- status: PENDING | CONFIRMED | CANCELLED | COMPLETED | DECLINED
- priceCents, creditsUsed
- reminderSent flag
- Relationships: user, listing
```

**Review** - Ratings and feedback
```prisma
- rating (1-5), comment
- Relationships: reviewer, subject, listing
```

**CommunityProject** - Collaborative initiatives
```prisma
- title, description
- status: ACTIVE | COMPLETED | ON_HOLD
- Relationships: owner (User), members
```

**CreditTransaction** - Token system
```prisma
- amount (positive/negative), reason
- Relationships: user
```

### Supporting Models

- **Endorsement** - Skill validations between users
- **VerificationBadge** - External credential verification (e.g., Credly)
- **ProjectMember** - Project participation with roles
- **AdminLog** - Audit trail for admin actions
- **Report** - User reporting system with workflow

### Enums

- **UserType**: `SKILL_PROVIDER`, `PROJECT_CREATOR`
- **UserRole**: `USER`, `MODERATOR`, `ADMIN`
- **BookingStatus**: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `DECLINED`
- **ProjectStatus**: `ACTIVE`, `COMPLETED`, `ON_HOLD`
- **ProjectRole**: `MEMBER`, `MANAGER`
- **ReportType**: `SPAM`, `INAPPROPRIATE`, `SCAM`, `HARASSMENT`, `OTHER`
- **ReportStatus**: `PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`

---

## 🔒 Authentication & Authorization

### Authentication Methods

1. **Email/Password** - Traditional registration with bcrypt hashing (12 rounds)
2. **Google OAuth** - Sign in with Google account
3. **GitHub OAuth** - Sign in with GitHub account

### Role-Based Access Control

The platform implements a three-tier permission system:

#### User Types (Core Roles)
- **Skill Providers**: Can create listings, manage bookings, earn credits
- **Project Creators**: Can post projects, browse providers, book sessions

#### Administrative Roles
- **USER**: Standard account (default)
- **MODERATOR**: Can manage reports and content
- **ADMIN**: Full platform access including user verification

### Route Protection

Middleware protects routes based on user type:
- `/dashboard/provider` - Skill Providers only
- `/dashboard/creator` - Project Creators only
- `/listings/new` - Skill Providers only
- `/projects/new` - Project Creators only
- `/admin` - Admin authentication required

### Permission System

Comprehensive permission utilities (`lib/permissions.ts`) include:
- `canCreateListing()` - Provider permission
- `canCreateProject()` - Creator permission
- `canVerifyUsers()` - Admin permission
- `isVerified()` - Verification status check
- And 15+ more granular permissions

---

## 🎨 UI/UX Design

### Design Principles
- **Modern & Clean**: Professional yet friendly aesthetic
- **Mobile-First**: Responsive design for all screen sizes
- **Accessible**: WCAG compliant with ARIA labels
- **Intuitive**: Clear navigation and user flows
- **Consistent**: Shadcn UI component library

### Theme System
- **Light Mode**: Default bright theme
- **Dark Mode**: System-aware dark theme
- **Smooth Transitions**: Theme switching without flicker
- **Customizable**: Tailwind-based color system

### Key Features
- **Role-Specific Dashboards**: Tailored UI for providers vs creators
- **Interactive Maps**: OpenStreetMap integration with custom markers
- **Real-Time Updates**: Optimistic UI updates
- **Toast Notifications**: Non-intrusive feedback
- **Loading States**: Skeleton loaders and spinners

---

## 📱 Key Pages & Flows

### Public Pages
- **Landing Page** (`/`) - Hero, features, testimonials, CTAs
- **Sign In** (`/auth/signin`) - Login with all auth methods
- **Sign Up** (`/auth/signup`) - Role selection (Provider/Creator) with inline choice

### Skill Provider Flow
1. Sign up as Skill Provider
2. Complete profile with location
3. Create skill listings with pricing
4. Manage booking calendar
5. Accept/decline session requests
6. Complete sessions and earn credits
7. Receive and give reviews

### Project Creator Flow
1. Sign up as Project Creator
2. Complete profile and set location
3. Browse skill providers by category/location
4. Book sessions with providers
5. Create community projects
6. Manage team members
7. Review and rate providers

### Shared Features
- **Profile Pages** (`/profile/[id]`) - Public user profiles
- **Listings Browse** (`/listings`) - Map/grid view with filters
- **Booking Management** (`/bookings`) - Upcoming and past sessions
- **Credits Dashboard** (`/credits`) - Transaction history
- **Projects** (`/projects`) - Community initiatives

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aditya8Raj/localgrid)

#### Manual Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - Available for: Production, Preview, Development

4. **Deploy**
   - Click Deploy
   - Vercel builds and deploys automatically
   - Get your production URL: `https://your-app.vercel.app`

### Vercel Configuration

The project includes `vercel.json` with:
- **Daily Cron Job**: Cleanup task at 2 AM (Hobby plan compatible)
- **Build Settings**: Optimized for Next.js 15
- **Environment**: Node.js 18.x

### Database Setup for Production

1. **Neon Database**
   - Use connection pooler URL for `DATABASE_URL`
   - Enable connection pooling in Neon dashboard
   - Set max connections appropriate for your plan

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Connection**
   - Test database connectivity from Vercel
   - Check logs for any connection issues

### Background Jobs

- **BullMQ Worker**: Automatically starts on Vercel
- **Redis Connection**: Uses Upstash Redis (serverless-friendly)
- **Reminders**: Processed via background worker
- **Cron Jobs**: Daily cleanup via Vercel Cron

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database (dev)
npx prisma migrate dev   # Create and apply migration
npx prisma migrate deploy # Deploy migrations (production)
npx prisma studio        # Open database GUI on localhost:5555
npm run seed             # Run seed script (if available)

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run Playwright e2e tests

# Type Checking
npm run type-check       # Run TypeScript compiler check
```

---

## 🛡️ Security Features

### Implemented
- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **HTTPS Enforcement**: Vercel provides automatic SSL
- ✅ **CSRF Protection**: Built into NextAuth
- ✅ **Input Validation**: Zod schemas for all forms
- ✅ **SQL Injection Prevention**: Prisma parameterized queries
- ✅ **Environment Security**: Variables never exposed to client
- ✅ **Session Management**: Secure JWT tokens with rotation
- ✅ **Role-Based Access**: Middleware route protection
- ✅ **XSS Prevention**: React automatic escaping
- ✅ **Secure Headers**: Next.js security headers

### Recommended Additions
- 🔄 Rate limiting on API routes
- 🔄 Input sanitization for rich text
- 🔄 Content Security Policy (CSP) headers
- 🔄 Two-factor authentication (2FA)
- 🔄 Audit logging for sensitive actions
- 🔄 Regular security audits

---

## 🎯 Feature Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Project setup and configuration
- [x] Authentication system with dual roles
- [x] Database schema with 11 models
- [x] Landing page and public routes
- [x] Role-based dashboards
- [x] Route protection middleware

### ✅ Phase 2: Core Features (Completed)
- [x] Profile management with geolocation
- [x] Skill listing creation and browsing
- [x] Geo-search with OpenStreetMap integration
- [x] Booking system with calendar
- [x] Review and rating system
- [x] Credit/token system
- [x] Email notifications (Gmail SMTP)
- [x] Background job processing (BullMQ)
- [x] Automated reminders

### 🚧 Phase 3: Advanced Features (In Progress)
- [ ] Real-time messaging system
- [ ] Advanced search filters (skills, price, availability)
- [ ] Verification workflow for badges
- [ ] Admin dashboard for platform management
- [ ] Analytics and reporting
- [ ] Payment integration (Razorpay)
- [ ] In-app notifications with WebSockets
- [ ] Multi-language support (i18n)

### 🔮 Phase 4: Enhancements (Planned)
- [ ] Mobile app (React Native)
- [ ] Video introduction for providers
- [ ] Live session streaming
- [ ] Community forum
- [ ] Gamification (badges, achievements)
- [ ] Referral program
- [ ] Advanced analytics dashboard
- [ ] Machine learning recommendations
- [ ] API for third-party integrations

---

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)
```bash
npm run test
```
- Component tests for UI elements
- Utility function tests
- API route tests with mocked Prisma

### End-to-End Tests (Playwright)
```bash
npm run test:e2e
```
- Complete user flows
- Authentication workflows
- Booking and payment processes
- Cross-browser testing

### Manual Testing Checklist
- [ ] Sign up as Skill Provider
- [ ] Sign up as Project Creator
- [ ] Create skill listing (Provider)
- [ ] Browse and search listings (Creator)
- [ ] Book a session
- [ ] Complete booking flow
- [ ] Leave a review
- [ ] Create community project
- [ ] Join a project
- [ ] Credit transactions
- [ ] Email notifications
- [ ] Role-based dashboard access

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/localgrid.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `npm run test && npm run lint`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Follow ESLint rules

### Pull Request Guidelines
- Provide clear description of changes
- Include screenshots for UI changes
- Reference related issues
- Ensure CI passes
- Request review from maintainers

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 LocalGrid

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Technologies
- [Next.js](https://nextjs.org/) - React framework for production
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful component library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Vercel](https://vercel.com/) - Deployment platform
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Upstash](https://upstash.com/) - Serverless Redis
- [OpenStreetMap](https://www.openstreetmap.org/) - Open-source maps
- [Leaflet](https://leafletjs.com/) - Interactive map library
- [BullMQ](https://docs.bullmq.io/) - Background job processing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

### Inspiration
- Local community skill-sharing initiatives
- Barter economy principles
- Collaborative consumption movements
- Hyperlocal business models

---

## 📞 Support

### Documentation
- [Full Documentation](#) (Coming soon)
- [API Reference](#) (Coming soon)
- [User Guide](#) (Coming soon)

### Community
- **GitHub Issues**: [Report bugs or request features](https://github.com/aditya8Raj/localgrid/issues)
- **Discussions**: [Join community discussions](https://github.com/aditya8Raj/localgrid/discussions)
- **Email**: support@localgrid.com

### Commercial Support
For enterprise deployments, custom features, or priority support, contact: enterprise@localgrid.com

---

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready ✅
- **Last Updated**: October 25, 2025
- **Node Version**: 18.17+
- **Next.js Version**: 15.5.6

### Build Status
- ✅ All routes compiled successfully (29 routes)
- ✅ TypeScript compilation passing
- ✅ ESLint checks passing
- ✅ Production build optimized
- ✅ Zero critical vulnerabilities

---

**Built with ❤️ for stronger communities**

*LocalGrid - Empowering local skill exchange across India* 🇮🇳
