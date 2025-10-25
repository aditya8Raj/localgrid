# LocalGrid - Hyperlocal Skill Exchange PlatformThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



🌟 **Connect. Share. Grow Together.**## Getting Started



LocalGrid is a comprehensive full-stack web application that facilitates hyperlocal skill exchange, strengthens community bonds, and fosters economic empowerment in urban neighborhoods.First, run the development server:



![Next.js](https://img.shields.io/badge/Next.js-15-black)```bash

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)npm run dev

![Prisma](https://img.shields.io/badge/Prisma-Latest-brightgreen)# or

![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)yarn dev

# or

## 🚀 Featurespnpm dev

# or

### Core Platform Featuresbun dev

```

- **🔐 User Authentication & Verification**

  - Secure sign-up/login with NextAuthOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

  - Multiple authentication methods: Google, GitHub, Email/Password

  - Password hashing with bcryptYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

  - Session management

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **📍 Geo-Location Matching**

  - Discover skills and services in your area## Learn More

  - Customizable search radius

  - Location-based filteringTo learn more about Next.js, take a look at the following resources:



- **📅 Booking & Scheduling**- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

  - Built-in calendar system- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

  - Automated reminders

  - Conflict detectionYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

  - Session management

## Deploy on Vercel

- **⭐ Reputation System**

  - User ratings and reviewsThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

  - Skill endorsements

  - Digital badge verification (Credly integration ready)Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

  - Trust scores

- **🤝 Community Projects**
  - Propose and join collaborative initiatives
  - Project management tools
  - Member coordination

- **🪙 Incentive Mechanism**
  - Credit/token system
  - Earn credits for participation
  - Redeem for services or donate to community causes
  - Transaction history

- **♿ Accessibility & Inclusivity**
  - Light/Dark mode support
  - High-contrast modes
  - Keyboard navigation
  - ARIA labels
  - Language localization ready

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn UI
- **Authentication:** NextAuth.js (Auth.js v5)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Icons:** Lucide React
- **Form Handling:** React Hook Form + Zod
- **Notifications:** Sonner

## 📦 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon account recommended)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd localgrid
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
# Database - Get from Neon Console (https://console.neon.tech/)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth Configuration
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Optional: Email Configuration
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@localgrid.com"

# Optional: Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 4. Database Setup

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📂 Project Structure

\`\`\`
localgrid/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── auth/              # Auth pages (signin, signup)
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   └── providers/         # Context providers
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript type definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
└── .env                       # Environment variables
\`\`\`

## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with the following models:

- **User** - Core user profiles with authentication
- **Account** - OAuth account linking
- **Session** - User sessions
- **Skill** - Skills offered by users
- **SkillRequest** - Learning needs/requests
- **Booking** - Session scheduling
- **Review** - Ratings and feedback
- **Endorsement** - Skill validations
- **Project** - Community initiatives
- **ProjectMember** - Project participation
- **Transaction** - Credit system
- **Notification** - User notifications

## 🔒 Authentication

LocalGrid supports three authentication methods:

1. **Email/Password** - Traditional email registration with secure password hashing
2. **Google OAuth** - Sign in with Google account
3. **GitHub OAuth** - Sign in with GitHub account

All passwords are hashed using bcryptjs with a salt round of 12.

## 🎨 UI/UX Design

- **Modern & Clean:** Professional yet friendly aesthetic
- **Responsive:** Mobile-first design with breakpoints for all devices
- **Accessible:** WCAG compliance with proper ARIA labels
- **Dark Mode:** System-aware theme switching
- **Component Library:** Shadcn UI for consistency

## 📱 Key Pages

- **Landing Page** (`/`) - Public homepage with features and CTAs
- **Sign In** (`/auth/signin`) - User authentication
- **Sign Up** (`/auth/signup`) - New user registration
- **Dashboard** (`/dashboard`) - User overview and quick actions
- **Profile** (`/dashboard/profile`) - User profile management
- **Skills** (`/dashboard/skills`) - Skill listing management
- **Explore** (`/dashboard/explore`) - Discover nearby skills
- **Bookings** (`/dashboard/bookings`) - Session management
- **Projects** (`/dashboard/projects`) - Community initiatives

## 🚢 Deployment (Vercel)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables in Vercel

Add all variables from your `.env` file to Vercel:
- Settings → Environment Variables
- Add each variable separately
- Available for Production, Preview, and Development

### Database Configuration

Ensure your Neon database is accessible:
- Use the connection pooler URL for `DATABASE_URL`
- Use the direct connection for `DIRECT_URL`

## 🔧 Development Commands

\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npx prisma generate       # Generate Prisma Client
npx prisma db push        # Push schema changes
npx prisma studio         # Open database GUI
npx prisma migrate dev    # Create migration
\`\`\`

## 🛡️ Security Best Practices

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ HTTPS enforced in production
- ✅ CSRF protection via NextAuth
- ✅ Input validation with Zod
- ✅ SQL injection prevention via Prisma
- ✅ Environment variable protection
- ✅ Secure session management
- 🔄 Rate limiting (to be implemented)
- 🔄 Input sanitization (to be enhanced)

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- ✅ Project setup and configuration
- ✅ Authentication system
- ✅ Database schema
- ✅ Landing page and basic UI

### Phase 2: Core Features
- [ ] Profile management with location
- [ ] Skill listing and search
- [ ] Booking system with calendar
- [ ] Review and rating system

### Phase 3: Advanced Features
- [ ] Geolocation and map integration
- [ ] Community projects
- [ ] Credit/token system
- [ ] Real-time notifications

### Phase 4: Enhancement
- [ ] Advanced search filters
- [ ] Messaging system
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Vercel](https://vercel.com/) - Hosting platform
- [Neon](https://neon.tech/) - Serverless PostgreSQL

## 📞 Support

For support, email support@localgrid.com or create an issue in the repository.

---

**Built with ❤️ for stronger communities**
