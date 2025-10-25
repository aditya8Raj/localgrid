# 🔥 Firebase Authentication Setup Guide

## Why Firebase?

We switched from NextAuth v5 to Firebase Authentication because:
- ✅ **Reliable**: Battle-tested by millions of apps
- ✅ **Simple**: No PKCE errors or complex JWT management
- ✅ **Fast**: Built for production at scale
- ✅ **Free**: Generous free tier (50K MAU)

## 🚀 Quick Setup (5 minutes)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "localgrid" (or anything you want)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google**
3. Toggle **Enable**
4. Set support email (your email)
5. Click **Save**

### 3. Get Firebase Config (Client-side)

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Scroll down to "Your apps"
3. Click the **Web icon** (`</>`)
4. Register app name: "localgrid-web"
5. Copy the `firebaseConfig` object
6. Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="localgrid-xxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="localgrid-xxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="localgrid-xxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:..."
```

### 4. Get Service Account (Server-side)

1. In Firebase Console → **Project settings**
2. Go to **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. **Minify it to one line** (important!)
6. Add to `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"localgrid-xxx",...}'
```

⚠️ **CRITICAL**: The service account must be on ONE LINE (no line breaks)

### 5. Configure Authorized Domains

1. In Firebase Console → **Authentication** → **Settings**
2. Go to **Authorized domains** tab
3. Add your domains:
   - `localhost` (for development)
   - `localgrid.vercel.app` (for production)
   - Your custom domain (if any)

### 6. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000/auth/signin` and try signing in with Google!

## 📝 Environment Variables Checklist

Make sure you have these in your `.env.local`:

```env
# ✅ Required for Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# ✅ Required for Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# ✅ Required for Emails
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-gmail@gmail.com"
EMAIL_SMTP_PASS="your-app-password"

# ✅ Required for Background Jobs
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# ✅ Required for Payments
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="..."
```

## 🎯 Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add ALL the environment variables from above
5. **Important**: For `FIREBASE_SERVICE_ACCOUNT`, paste the entire minified JSON

Then redeploy:

```bash
git push origin main
```

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Rotate service account keys** every 90 days
3. **Enable App Check** (optional) for production
4. **Set up Firebase Security Rules** for Firestore (if using)

## 🧪 Testing the Flow

1. **Sign in**: Visit `/auth/signin` → Click "Sign in with Google"
2. **Select role**: Choose Skill Provider or Project Creator
3. **Dashboard**: Should redirect to role-specific dashboard
4. **No loops!**: Authentication should work smoothly

## 🐛 Troubleshooting

### "Firebase config is missing"
→ Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set

### "Service account error"
→ Make sure `FIREBASE_SERVICE_ACCOUNT` is:
  - Valid JSON
  - On ONE line (no line breaks)
  - Has all required fields

### "Unauthorized domain"
→ Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### "User not found after signin"
→ Check that `DATABASE_URL` is correct and database is accessible

## 📚 Firebase vs NextAuth Comparison

| Feature | Firebase | NextAuth v5 |
|---------|----------|-------------|
| Setup time | 5 minutes | 30+ minutes |
| PKCE errors | ❌ Never | ✅ Frequent |
| Bundle size | ~100KB | 1MB+ (with Prisma) |
| Reliability | 99.95% uptime | Depends on config |
| Documentation | Excellent | Confusing |
| Production ready | ✅ Yes | ⚠️ Beta |

## 🎉 Done!

Your authentication is now powered by Firebase. No more PKCE errors, no more redirect loops, just simple, reliable auth!

For issues, check [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
