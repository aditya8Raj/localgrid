# Firebase-Only Authentication Migration

## Overview

LocalGrid now uses **Firebase Authentication exclusively**. NextAuth has been completely removed from the project.

## What Changed

### 1. **Removed Packages**
- ❌ `next-auth` (v5.0.0-beta.29)
- ❌ `@auth/prisma-adapter` (v2.11.0)

### 2. **Deleted Files**
- ❌ `lib/auth.ts` - NextAuth configuration
- ❌ `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- ❌ `types/next-auth.d.ts` - NextAuth type definitions
- ❌ `AUTH_REBUILD.md` - Old authentication documentation

### 3. **Updated Database Schema**
Removed NextAuth models from `prisma/schema.prisma`:
- ❌ `Account` model
- ❌ `Session` model
- ❌ `VerificationToken` model

Also removed these relations from `User` model:
- ❌ `accounts Account[]`
- ❌ `sessions Session[]`

### 4. **Updated Files**

#### `middleware.ts`
- **Before**: Used NextAuth's `auth()` function to get session
- **After**: Uses cookie-based authentication with `userEmail` cookie
- Fetches user data from `/api/auth/user` endpoint using email

#### `app/auth/signin/page.tsx`
- **Before**: Used NextAuth's `signIn()` function
- **After**: Uses Firebase's `signInWithGoogle` from `useAuth` hook
- Direct integration with Firebase Authentication

#### `app/auth/role-selection/page.tsx`
- **Before**: Used NextAuth's `useSession` hook
- **After**: Uses Firebase's `useAuth` hook
- Hard page reload using `window.location.href` after role selection

#### `lib/firebase-auth-context.tsx`
- **Added**: Cookie management for middleware compatibility
- Sets `userEmail` cookie on user data fetch (30-day expiration)
- Clears cookie on sign out

## New Authentication Flow

```
1. User clicks "Sign in with Google" on /auth/signin
   ↓
2. Firebase authentication popup opens
   ↓
3. User authenticates with Google
   ↓
4. Firebase returns user credentials
   ↓
5. POST /api/auth/signin creates/updates user in database
   ↓
6. Firebase context sets userEmail cookie
   ↓
7. Redirect to /auth/role-selection (if no userType)
   OR
   Redirect to /dashboard/provider or /dashboard/creator (if userType exists)
   ↓
8. Middleware checks userEmail cookie and fetches user data
   ↓
9. User lands on appropriate page based on userType
```

## Cookie Details

**Cookie Name**: `userEmail`

**Properties**:
- `path=/` - Available to entire application
- `max-age=2592000` - 30 days expiration
- `SameSite=Lax` - CSRF protection while allowing navigation

**Set by**: `lib/firebase-auth-context.tsx` in `fetchUserData()`

**Used by**: `middleware.ts` to fetch user data from database

**Cleared on**: Sign out

## Middleware Authentication

The middleware now works as follows:

```typescript
1. Get userEmail from cookie
2. If cookie exists, fetch user data from /api/auth/user?email=...
3. If user not found, treat as unauthenticated
4. Apply route protection based on user.userType
5. Redirect appropriately
```

## Environment Variables

No changes to Firebase environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Benefits of Firebase-Only Approach

✅ **Simpler Architecture**: One authentication system instead of two
✅ **Fewer Dependencies**: Removed 9 packages
✅ **Clearer Code**: Direct Firebase integration without adapter layer
✅ **Faster Development**: No NextAuth configuration complexity
✅ **Better Debugging**: Single auth flow to trace
✅ **Production Ready**: Firebase handles scale, security, and reliability

## Testing Checklist

- [ ] Sign in with Google works
- [ ] New users redirected to /auth/role-selection
- [ ] Role selection saves and redirects to dashboard
- [ ] Existing users redirect to correct dashboard
- [ ] Middleware protects routes correctly
- [ ] Sign out clears session and cookie
- [ ] Protected routes redirect to /auth/signin when unauthenticated

## Rollback Plan (If Needed)

If you need to rollback to NextAuth:

1. Run: `npm install next-auth@5.0.0-beta.29 @auth/prisma-adapter@2.11.0`
2. Restore files from git: `git checkout <previous-commit> -- lib/auth.ts types/next-auth.d.ts`
3. Restore NextAuth models in `prisma/schema.prisma`
4. Run: `npx prisma generate`
5. Revert `middleware.ts`, `app/auth/signin/page.tsx`, and `app/auth/role-selection/page.tsx`

However, Firebase-only is recommended as the long-term solution.

## Support

If you encounter issues:

1. Check Firebase Console for authentication logs
2. Check browser console for detailed logs (prefixed with `[Auth]`)
3. Verify userEmail cookie is set (Browser DevTools > Application > Cookies)
4. Check middleware logs in terminal

---

**Migration Date**: January 2025
**Status**: ✅ Complete
**Next Steps**: Test authentication flow end-to-end
