# LocalGrid - Complete Setup Guide

This guide will walk you through setting up the LocalGrid platform from scratch.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Database Configuration (Neon)](#database-configuration-neon)
3. [OAuth Provider Setup](#oauth-provider-setup)
4. [Environment Variables](#environment-variables)
5. [Database Migrations](#database-migrations)
6. [Running the Application](#running-the-application)
7. [Deployment to Vercel](#deployment-to-vercel)
8. [Troubleshooting](#troubleshooting)

## Initial Setup

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd localgrid
npm install
\`\`\`

### 2. Verify Installation

Check that all dependencies are installed:

\`\`\`bash
npm list next next-auth @prisma/client
\`\`\`

## Database Configuration (Neon)

### 1. Create Neon Account

1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up for a free account
3. Create a new project

### 2. Get Connection Strings

In your Neon dashboard:

1. Navigate to your project
2. Click on "Connection Details"
3. Copy two connection strings:
   - **Pooled connection** (for DATABASE_URL)
   - **Direct connection** (for DIRECT_URL)

Example format:
\`\`\`
Pooled: postgresql://user:pass@host.neon.tech/dbname?sslmode=require
Direct: postgresql://user:pass@host.neon.tech/dbname?sslmode=require&connect_timeout=10
\`\`\`

## OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen:
   - Application name: LocalGrid
   - Authorized domains: localhost (dev), your-domain.com (prod)
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - Development: \`http://localhost:3000/api/auth/callback/google\`
     - Production: \`https://your-domain.com/api/auth/callback/google\`
7. Copy Client ID and Client Secret

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Application name: LocalGrid
   - Homepage URL: \`http://localhost:3000\` (dev) or your domain
   - Authorization callback URL:
     - Development: \`http://localhost:3000/api/auth/callback/github\`
     - Production: \`https://your-domain.com/api/auth/callback/github\`
4. Click "Register application"
5. Copy Client ID
6. Generate Client Secret and copy it

## Environment Variables

### 1. Create .env File

Copy the example file:

\`\`\`bash
cp .env.example .env
\`\`\`

### 2. Fill in Values

Edit \`.env\` with your actual values:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require&connect_timeout=10"

# NextAuth Secret - Generate using: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

\`\`\`bash
openssl rand -base64 32
\`\`\`

Copy the output and use it for \`NEXTAUTH_SECRET\`.

## Database Migrations

### 1. Generate Prisma Client

\`\`\`bash
npx prisma generate
\`\`\`

This creates the Prisma Client based on your schema.

### 2. Push Schema to Database

For development (creates tables without migrations):

\`\`\`bash
npx prisma db push
\`\`\`

For production (with migration history):

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

### 3. Verify Database

Open Prisma Studio to view your database:

\`\`\`bash
npx prisma studio
\`\`\`

This opens a GUI at \`http://localhost:5555\`.

## Running the Application

### Development Mode

\`\`\`bash
npm run dev
\`\`\`

Application will be available at: \`http://localhost:3000\`

### Production Build

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

### First Time Setup

1. Visit \`http://localhost:3000\`
2. Click "Get Started" or "Sign Up"
3. Create an account using:
   - Email/Password
   - Google OAuth
   - GitHub OAuth
4. Complete your profile
5. Start exploring features!

## Deployment to Vercel

### 1. Prepare for Deployment

Ensure your code is pushed to GitHub:

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 2. Deploy to Vercel

#### Option A: Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from your \`.env\` file:

\`\`\`
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL (update to your Vercel domain)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_ID
GITHUB_SECRET
NEXT_PUBLIC_APP_URL (update to your Vercel domain)
\`\`\`

### 4. Update OAuth Redirect URLs

#### Google:
1. Go to Google Cloud Console
2. Add Vercel URL to authorized redirect URIs:
   - \`https://your-app.vercel.app/api/auth/callback/google\`

#### GitHub:
1. Go to GitHub OAuth App settings
2. Update Authorization callback URL:
   - \`https://your-app.vercel.app/api/auth/callback/github\`

### 5. Redeploy

After updating environment variables:

\`\`\`bash
vercel --prod
\`\`\`

Or trigger a redeploy from Vercel dashboard.

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** "Can't reach database server"

**Solution:**
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure IP allowlist includes your location (if configured)

#### 2. OAuth Not Working

**Error:** "OAuth callback error"

**Solutions:**
- Verify redirect URLs match exactly
- Check Client ID and Secret are correct
- Ensure OAuth provider is enabled in their console
- Clear browser cookies and try again

#### 3. Build Errors

**Error:** "Module not found" or "Type error"

**Solutions:**
\`\`\`bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
\`\`\`

#### 4. Prisma Client Issues

**Error:** "PrismaClient is unable to be run in the browser"

**Solutions:**
\`\`\`bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next
\`\`\`

#### 5. Environment Variables Not Loading

**Solutions:**
- Restart development server after changing .env
- Verify variable names (no typos)
- Check variables start with NEXT_PUBLIC_ for client-side use
- In Vercel, redeploy after adding env vars

### Database Issues

#### Reset Database

If you need to reset your database:

\`\`\`bash
# Push schema (overwrites existing)
npx prisma db push --force-reset
\`\`\`

⚠️ **Warning:** This will delete all data!

#### View Database Logs

\`\`\`bash
# See all Prisma queries
npx prisma studio
\`\`\`

### Getting Help

If you're still stuck:

1. Check [Next.js Documentation](https://nextjs.org/docs)
2. Check [NextAuth Documentation](https://next-auth.js.org/)
3. Check [Prisma Documentation](https://www.prisma.io/docs)
4. Open an issue on GitHub
5. Join our community Discord

## Security Checklist

Before going to production:

- [ ] Change all default secrets
- [ ] Enable HTTPS only
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Enable Vercel authentication logs
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Review and limit OAuth scopes
- [ ] Enable two-factor authentication for admin accounts
- [ ] Set up security headers in next.config.ts

## Performance Optimization

Recommended optimizations:

- [ ] Enable Vercel Edge Caching
- [ ] Configure Image Optimization
- [ ] Set up CDN for static assets
- [ ] Enable Prisma connection pooling
- [ ] Implement data caching strategy
- [ ] Set up monitoring (Vercel Analytics)

---

**Setup Complete!** 🎉

Your LocalGrid instance should now be running. Visit the application and start building your community!
