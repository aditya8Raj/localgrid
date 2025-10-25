# 🚀 LocalGrid - Quick Start Guide

## Installation (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

This will install all required packages (~2-3 minutes).

### Step 2: Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

**Required Configuration:**

Open `.env` and update these values:

1. **Database** (from Neon):
```env
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

2. **NextAuth Secret** (generate new):
```bash
openssl rand -base64 32
```
Copy output to:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

3. **OAuth Providers** (optional for testing, required for full functionality):
- Get Google credentials: https://console.cloud.google.com
- Get GitHub credentials: https://github.com/settings/developers

### Step 3: Set Up Database

Push the schema to your Neon database:
```bash
npm run db:push
```

### Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## Quick OAuth Setup (Optional)

### Google OAuth (2 minutes)
1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create OAuth Client ID → Web application
4. Add redirect: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

### GitHub OAuth (2 minutes)
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

---

## First Steps After Installation

1. **Sign Up** - Create your account at http://localhost:3000/auth/signup
2. **Complete Profile** - Add your location and bio
3. **Browse Dashboard** - Explore the features
4. **List a Skill** - Share what you know
5. **Discover** - Browse nearby skills

---

## Automated Setup

Use the included setup script:
```bash
./setup.sh
```

This will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Create .env file
- ✅ Guide through database setup

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection fails
- Check DATABASE_URL format
- Verify Neon project is active
- Test connection in Neon dashboard

### OAuth not working
- Verify redirect URIs match exactly
- Check credentials are correct
- Ensure OAuth apps are enabled

### Port 3000 already in use
```bash
PORT=3001 npm run dev
```

---

## Development Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production
npm run start

# View database
npm run db:studio

# Run linting
npm run lint
```

---

## Project Structure Overview

```
localgrid/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/             # Utilities and helpers
├── prisma/          # Database schema
└── config/          # Configuration files
```

---

## What's Included

✅ **Authentication**
- Email/Password
- Google OAuth
- GitHub OAuth

✅ **Database**
- Complete schema with 18 models
- User profiles
- Skills marketplace
- Booking system
- Reviews and ratings
- Community projects
- Messaging system
- Notifications

✅ **UI/UX**
- Shadcn components
- Dark/Light mode
- Responsive design
- Accessibility features

✅ **Security**
- Password hashing
- JWT sessions
- Protected routes
- Input validation

---

## Next Steps

📖 Read **README.md** for full documentation
📋 Check **SETUP.md** for detailed setup guide
📊 Review **SUMMARY.md** for complete overview

---

## Support

- 🐛 Issues: GitHub Issues
- 💬 Questions: GitHub Discussions
- 📚 Docs: README.md

---

**Time to build something amazing! 🚀**

```bash
npm install && npm run dev
```
