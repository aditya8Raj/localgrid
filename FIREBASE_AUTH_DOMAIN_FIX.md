# Firebase Auth Domain Error Fix

## Problem
Getting `Firebase: Error (auth/unauthorized-domain)` when trying to sign in.

## Root Cause
The domain you're accessing the app from (`127.0.0.1:3000`) is not authorized in Firebase Authentication settings.

## Solutions

### Option 1: Add 127.0.0.1:3000 to Firebase (If you must use IP address)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **local-grid-7cb68**
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Enter: `127.0.0.1:3000`
6. Click **Add**

### Option 2: Use localhost instead (RECOMMENDED ✅)

Simply access your app using:
```
http://localhost:3000
```

Instead of:
```
http://127.0.0.1:3000
```

**Why this works:**
- `localhost` is already authorized in your Firebase settings
- `localhost` and `127.0.0.1` point to the same place, but Firebase treats them as different domains

### Option 3: Update Dev Script (Already Done ✅)

I've updated your `package.json` to bind the dev server to `localhost`:

```json
"dev": "next dev -H localhost"
```

Now when you run `npm run dev`, it will specifically use `localhost`.

## Quick Steps to Resolve NOW

1. **Stop any running dev server** (Ctrl+C)
2. **Start the dev server** with: `npm run dev`
3. **Open browser** and go to: `http://localhost:3000/auth/signin`
4. **Try signing in** - it should work now!

## Currently Authorized Domains in Firebase

According to your screenshot:
- ✅ localhost
- ✅ local-grid-7cb68.firebaseapp.com
- ✅ local-grid-7cb68.web.app
- ✅ localgrid.vercel.app (Custom)
- ❌ 127.0.0.1:3000 (NOT authorized - causing the error)

## Why This Happens

Firebase Authentication requires all domains to be explicitly whitelisted for security reasons. This prevents unauthorized websites from using your Firebase authentication.

## Additional Notes

- **Development**: Always use `localhost:3000`
- **Production**: Already configured with `localgrid.vercel.app`
- **Testing**: Can add more domains as needed in Firebase Console

## Verification

After applying the fix, you should see:
1. No Firebase errors in browser console
2. Google Sign-In popup appears correctly
3. Successful authentication and redirect

---

**Last Updated**: October 25, 2025
