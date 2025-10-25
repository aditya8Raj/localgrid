# Getting Your Environment Variables - Complete Guide

## 1. Neon Database URLs (DATABASE_URL & DIRECT_URL)

### Steps to Get Neon Connection Strings:

1. **Go to Neon Console**: https://console.neon.tech/
2. **Login** to your account
3. **Select your project** (the one you created)
4. **Click on "Connection Details"** or "Dashboard"
5. You'll see two connection strings:

**Pooled Connection (DATABASE_URL)** - You already have this! ✅
```
postgresql://neondb_owner:npg_tGxcWBYeE71g@ep-curly-wildflower-a1uhmdkv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Direct Connection (DIRECT_URL)** - Look for this:
- In the same page, there should be a dropdown or tab for "Direct connection"
- It will look similar but WITHOUT "-pooler" in the hostname
- Example format:
```
postgresql://neondb_owner:npg_tGxcWBYeE71g@ep-curly-wildflower-a1uhmdkv.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Notice the difference**: 
- Pooled: `...a1uhmdkv-pooler.ap-southeast-1...` (has -pooler)
- Direct: `...a1uhmdkv.ap-southeast-1...` (no -pooler)

---

## 2. Google OAuth (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET)

### Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a Project** (if you don't have one):
   - Click "Select a project" at the top
   - Click "New Project"
   - Name it "LocalGrid" or any name you prefer
   - Click "Create"

3. **Enable Google+ API**:
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (for testing)
   - Click "Create"
   - Fill in:
     - App name: `LocalGrid`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip Scopes, Test users (click "Save and Continue" for each)
   - Click "Back to Dashboard"

5. **Create OAuth 2.0 Client ID**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name it: `LocalGrid Web Client`
   - Under "Authorized redirect URIs", add:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Create"
   
6. **Copy Your Credentials**:
   - You'll see a popup with:
     - **Client ID** - This is your `GOOGLE_CLIENT_ID`
     - **Client Secret** - This is your `GOOGLE_CLIENT_SECRET`
   - Copy both and save them!

**Example format**:
```
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

---

## 3. GitHub OAuth (GITHUB_ID & GITHUB_SECRET)

### Steps:

1. **Go to GitHub Developer Settings**: https://github.com/settings/developers

2. **Create a New OAuth App**:
   - Click "OAuth Apps" in the left sidebar
   - Click "New OAuth App" button (or "Register a new application")

3. **Fill in the Details**:
   - **Application name**: `LocalGrid`
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: `Local skill exchange platform` (optional)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
   - Click "Register application"

4. **Get Your Credentials**:
   - You'll see your **Client ID** immediately - This is your `GITHUB_ID`
   - Click "Generate a new client secret"
   - Copy the **Client Secret** immediately (you can only see it once!) - This is your `GITHUB_SECRET`

**Example format**:
```
GITHUB_ID="Iv1.a1b2c3d4e5f6g7h8"
GITHUB_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

---

## 4. Email Configuration (EMAIL_SERVER & EMAIL_FROM)

### Option A: Use Gmail (Easiest for Development)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create an App Password**:
   - After enabling 2FA, search for "App passwords" on the same page
   - Select app: "Mail"
   - Select device: "Other" and name it "LocalGrid"
   - Click "Generate"
   - Copy the 16-character password

3. **Your Configuration**:
```
EMAIL_SERVER="smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587"
EMAIL_FROM="noreply@yourdomain.com"
```

**Example**:
```
EMAIL_SERVER="smtp://john.doe@gmail.com:abcd efgh ijkl mnop@smtp.gmail.com:587"
EMAIL_FROM="noreply@localgrid.com"
```

### Option B: Use a Service (Recommended for Production)

- **SendGrid**: https://sendgrid.com/ (Free tier: 100 emails/day)
- **Mailgun**: https://www.mailgun.com/ (Free tier: 5,000 emails/month)
- **AWS SES**: https://aws.amazon.com/ses/ (Very cheap)

For now, you can **skip email configuration** - it's optional for local development!

---

## 5. Google Maps API (Optional - For Geolocation Features)

### Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Same project** as Google OAuth above
3. **Enable Maps JavaScript API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click and Enable
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the key
5. **(Optional) Restrict the Key**:
   - Click on the key name
   - Under "Application restrictions", choose "HTTP referrers"
   - Add: `http://localhost:3000/*`
   - Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"

**Example**:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q"
```

For now, you can **skip this** - we'll add maps later!

---

## ✅ Quick Setup Priority

### Must Have (For Authentication):
1. ✅ DATABASE_URL - You have this!
2. ✅ NEXTAUTH_SECRET - You have this!
3. 🔶 DIRECT_URL - Get from Neon console
4. 🔶 GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET - Optional but recommended
5. 🔶 GITHUB_ID & GITHUB_SECRET - Optional but recommended

### Can Skip for Now:
- EMAIL_SERVER & EMAIL_FROM (only needed for password reset emails)
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (only for map features later)

---

## 🎯 Your Updated .env File Should Look Like:

```env
# Database - ✅ You have this
DATABASE_URL="postgresql://neondb_owner:npg_tGxcWBYeE71g@ep-curly-wildflower-a1uhmdkv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_tGxcWBYeE71g@ep-curly-wildflower-a1uhmdkv.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth - ✅ You have this
NEXTAUTH_SECRET="MllLgpIyIzTzlruyFklRsauwx5pw/JG5lquHRKKnSAc="
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"

# GitHub OAuth - Get from GitHub Developer Settings
GITHUB_ID="Iv1.abc123def456"
GITHUB_SECRET="abc123def456ghi789"

# Email (Optional - Can skip for now)
EMAIL_SERVER="smtp://your-email@gmail.com:app-password@smtp.gmail.com:587"
EMAIL_FROM="noreply@localgrid.com"

# Google Maps (Optional - Can skip for now)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."

# App Config - ✅ You have this
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 💡 Pro Tips:

1. **For Local Development**: You can test with just email/password authentication. Google and GitHub OAuth are nice-to-have.

2. **Keep Secrets Safe**: Never commit your `.env` file to Git. It's already in `.gitignore`.

3. **Test Each Provider**: After adding OAuth credentials, test each sign-in method.

4. **Email is Optional**: For initial development, you don't need email configuration. Focus on OAuth first.

---

## 🚀 Next Steps:

1. Get DIRECT_URL from Neon (takes 1 minute)
2. Set up Google OAuth (takes 5 minutes)
3. Set up GitHub OAuth (takes 3 minutes)
4. Test your authentication!

Need help with any specific step? Let me know!
