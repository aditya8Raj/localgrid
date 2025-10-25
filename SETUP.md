# LocalGrid - Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (Neon account recommended)
- Google Cloud account (for OAuth)
- GitHub account (for OAuth)

## Quick Setup

### 1. Install Dependencies

```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
npm install
```

### 2. Database Setup (Neon)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

Your connection string should look like:
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
```

### 3. Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Update the following in `.env`:

#### Required:
- `DATABASE_URL` - Your Neon database connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000` for development
- `NEXT_PUBLIC_APP_URL` - `http://localhost:3000` for development

#### OAuth Setup:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Application name: LocalGrid (Dev)
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID and Client Secret to `.env`

### 4. Database Migration

Push the Prisma schema to your database:

```bash
npm run db:push
```

Optional - View your database:
```bash
npm run db:studio
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Common Issues

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors
- Verify DATABASE_URL in .env
- Ensure Neon project is active
- Check firewall/network settings

### OAuth errors
- Verify redirect URIs match exactly
- Check that OAuth apps are enabled
- Ensure client IDs and secrets are correct

### Build errors
```bash
npm run build
```
Check for TypeScript errors and fix them

## Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard (copy from .env)
4. Update these variables for production:
   - `NEXTAUTH_URL` → Your production domain
   - `NEXT_PUBLIC_APP_URL` → Your production domain
5. Update OAuth redirect URIs:
   - Google: Add `https://yourdomain.com/api/auth/callback/google`
   - GitHub: Add `https://yourdomain.com/api/auth/callback/github`
6. Deploy!

### 3. Post-Deployment

- Test authentication flows
- Verify database connections
- Check all features work correctly

## Development Workflow

### Adding New Features

1. Create feature branch
```bash
git checkout -b feature/your-feature
```

2. Make changes and test

3. Commit and push
```bash
git add .
git commit -m "Add feature: description"
git push origin feature/your-feature
```

4. Create Pull Request

### Database Changes

1. Update `prisma/schema.prisma`

2. Push changes
```bash
npm run db:push
```

3. For production migrations:
```bash
npm run db:migrate
```

### Testing Locally

Test production build:
```bash
npm run build
npm run start
```

## Project Structure

```
localgrid/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Auth pages (signin/signup)
│   ├── dashboard/        # Protected dashboard area
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
│
├── components/           # React components
│   ├── layout/          # Layout components (nav, footer)
│   └── ui/              # Shadcn UI components
│
├── lib/                 # Utilities and helpers
│   ├── auth.ts         # Authentication utilities
│   ├── prisma.ts       # Prisma client instance
│   ├── utils.ts        # General utilities
│   └── validations.ts  # Zod validation schemas
│
├── prisma/
│   └── schema.prisma   # Database schema
│
├── config/
│   └── site.ts         # Site configuration
│
├── types/              # TypeScript type definitions
│
├── public/             # Static assets
│
├── auth.config.ts      # NextAuth configuration
├── middleware.ts       # Route protection middleware
└── package.json        # Dependencies and scripts
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Create migration
```

## Features Checklist

After setup, you should have:

- ✅ User authentication (Email, Google, GitHub)
- ✅ User profiles with location
- ✅ Skill listings and browsing
- ✅ Geolocation-based search
- ✅ Booking system
- ✅ Review and rating system
- ✅ Credit system
- ✅ Community projects
- ✅ Messaging system
- ✅ Notifications
- ✅ Dark mode
- ✅ Responsive design

## Next Steps

1. **Complete your profile** - Add location and bio
2. **List your first skill** - Share what you can offer
3. **Browse nearby skills** - See what neighbors are offering
4. **Join or create a project** - Collaborate with community
5. **Start earning credits** - Exchange skills

## Support

- 📖 Documentation: See README.md
- 🐛 Issues: GitHub Issues
- 💬 Community: GitHub Discussions

## Security Notes

- Never commit `.env` file
- Use strong NEXTAUTH_SECRET
- Keep OAuth credentials secure
- Enable 2FA on provider accounts
- Review Vercel security settings

---

Happy coding! 🚀
