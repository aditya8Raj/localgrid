# LocalGrid - User Role Selection Flow

## Overview

LocalGrid implements a **permanent role selection system** where users choose their role (Skill Provider or Project Creator) during their first registration/authentication. Once selected, **this choice cannot be changed**.

---

## User Flow

### 1️⃣ First-Time User Registration

#### Option A: Email/Password Signup (`/auth/signup`)

**Flow:**
1. User visits `/auth/signup`
2. User sees inline role selection with two options:
   - **Skill Provider** 🎨 - Offer skills and earn
   - **Project Creator** 💼 - Post projects and hire talent
3. User selects their role (with warning: "This choice is permanent")
4. User fills in name, email, password
5. User submits form
6. Backend creates user with selected `userType` in database
7. User is automatically signed in
8. User is redirected to their role-specific dashboard:
   - Skill Provider → `/dashboard/provider`
   - Project Creator → `/dashboard/creator`

**Implementation:**
- File: `src/app/auth/signup/page.tsx`
- API: `POST /api/auth/register`
- Database: `userType` field set to selected role

#### Option B: OAuth Signup (Google/GitHub)

**Flow:**
1. User clicks "Sign in with Google" or "Sign in with GitHub"
2. User completes OAuth flow
3. System creates user account with default `userType: SKILL_PROVIDER`
4. User is redirected to `/auth/onboarding`
5. User sees role selection page with detailed descriptions
6. User selects their role (with warning: "This choice is permanent")
7. User clicks "Continue as [Role]"
8. Backend updates `userType` in database
9. User is redirected to their role-specific dashboard

**Implementation:**
- Files: 
  - `src/app/auth/signin/page.tsx` (OAuth buttons)
  - `src/app/auth/onboarding/page.tsx` (Role selection)
- API: `PATCH /api/users/onboarding`
- Middleware: Redirects to onboarding if needed

---

### 2️⃣ Returning User Login

#### Email/Password Login

**Flow:**
1. User visits `/auth/signin`
2. User enters email and password
3. User clicks "Sign In"
4. Backend validates credentials
5. System fetches user's `userType` from database
6. User is redirected to `/dashboard`
7. Dashboard auto-redirects to role-specific dashboard:
   - Skill Provider → `/dashboard/provider`
   - Project Creator → `/dashboard/creator`

**Implementation:**
- File: `src/app/auth/signin/page.tsx`
- Auth: `src/lib/auth.ts` (NextAuth callbacks)
- Redirect: `src/app/dashboard/page.tsx`

#### OAuth Login (Google/GitHub)

**Flow:**
1. User clicks "Sign in with Google" or "Sign in with GitHub"
2. System checks if user already has a `userType` set
3. If yes: User is redirected to their dashboard
4. If no (shouldn't happen, but fallback): User is sent to onboarding

**Implementation:**
- Same as above with additional onboarding check in middleware

---

## Technical Implementation

### Database Schema

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String?
  userType UserType @default(SKILL_PROVIDER)  // Role selection
  role     UserRole @default(USER)            // Permission level
  // ... other fields
}

enum UserType {
  SKILL_PROVIDER    // People offering skills/services
  PROJECT_CREATOR   // People posting projects and hiring
}
```

### Authentication Flow (NextAuth)

**JWT Token:**
```typescript
token: {
  id: string
  email: string
  userType: 'SKILL_PROVIDER' | 'PROJECT_CREATOR'
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  needsOnboarding: boolean  // True for new OAuth users
}
```

**Session:**
```typescript
session: {
  user: {
    id: string
    email: string
    name: string
    userType: 'SKILL_PROVIDER' | 'PROJECT_CREATOR'
    role: 'USER' | 'MODERATOR' | 'ADMIN'
  }
}
```

### Middleware Protection

**File:** `src/middleware.ts`

**Logic:**
```typescript
1. Check if user is authenticated
2. If not → Redirect to /auth/signin
3. If authenticated:
   a. Check if userType is set
   b. If not set OR needsOnboarding → Redirect to /auth/onboarding
   c. If set → Allow access based on role permissions
```

**Route Protection:**
- `/dashboard/provider` → Requires `SKILL_PROVIDER` role
- `/dashboard/creator` → Requires `PROJECT_CREATOR` role
- `/listings/new` → Requires `SKILL_PROVIDER` role
- `/projects/new` → Requires `PROJECT_CREATOR` role

### API Endpoints

#### 1. Registration (Email/Password)
```
POST /api/auth/register
Body: { email, password, name, userType }
```

**Security:**
- Validates email format
- Checks password length (min 8 chars)
- Hashes password with bcrypt (12 rounds)
- Stores `userType` permanently

#### 2. Onboarding (OAuth Users)
```
PATCH /api/users/onboarding
Body: { userType }
```

**Security:**
- Requires authentication
- Only allows update within 1 hour of account creation
- Prevents changing if userType already set (not default)
- Cannot be called again after selection

---

## Role Permanence Enforcement

### Prevention Mechanisms

1. **Database Level:**
   - Once `userType` is set to non-default value, it's locked
   - No API endpoint allows changing it

2. **API Level:**
   - `/api/users/onboarding` checks creation time (max 1 hour)
   - Returns error if user tries to change after selection
   - Returns error if user created more than 1 hour ago

3. **UI Level:**
   - Warning messages on signup and onboarding pages
   - No "Change Role" button in settings
   - Clear communication that choice is permanent

4. **Middleware Level:**
   - Enforces role-based access control
   - Redirects users trying to access wrong dashboard

### Time Windows

- **Email/Password Signup:** Immediate selection, no time window
- **OAuth Signup:** 1-hour window to complete onboarding
- **After Selection:** Cannot be changed, ever

---

## User Experience

### Visual Indicators

**Signup Page:**
```
⚠️ This choice is permanent and cannot be changed later
```

**Onboarding Page:**
```
⚠️ Important: This choice is permanent and cannot be changed later.
```

**Role Cards:**
- Highlighted border when selected
- Icon representing each role
- Clear description of capabilities
- Bullet points of what you can do

### Error Handling

**Scenario 1:** User tries to access onboarding after 1 hour
```
Error: "Onboarding period has expired. User type cannot be changed."
Status: 400 Bad Request
```

**Scenario 2:** User tries to change existing role
```
Error: "User type already set and cannot be changed"
Status: 400 Bad Request
```

**Scenario 3:** Provider tries to access Creator dashboard
```
Action: Redirect to /dashboard/provider
```

---

## Testing Checklist

### Email/Password Signup
- [ ] User can select Skill Provider
- [ ] User can select Project Creator
- [ ] Warning about permanence is visible
- [ ] After signup, redirects to correct dashboard
- [ ] On next login, goes to same dashboard
- [ ] Cannot change role through any UI

### OAuth Signup (Google)
- [ ] First-time Google user sees onboarding page
- [ ] User can select role on onboarding
- [ ] After selection, redirects to correct dashboard
- [ ] On next Google login, skips onboarding
- [ ] Goes directly to their dashboard
- [ ] Cannot access onboarding again

### OAuth Signup (GitHub)
- [ ] First-time GitHub user sees onboarding page
- [ ] User can select role on onboarding
- [ ] After selection, redirects to correct dashboard
- [ ] On next GitHub login, skips onboarding
- [ ] Goes directly to their dashboard
- [ ] Cannot access onboarding again

### Role Enforcement
- [ ] Skill Provider can access `/dashboard/provider`
- [ ] Skill Provider can access `/listings/new`
- [ ] Skill Provider CANNOT access `/dashboard/creator`
- [ ] Skill Provider CANNOT access `/projects/new`
- [ ] Project Creator can access `/dashboard/creator`
- [ ] Project Creator can access `/projects/new`
- [ ] Project Creator CANNOT access `/dashboard/provider`
- [ ] Project Creator CANNOT access `/listings/new`

### Security
- [ ] Cannot call `/api/users/onboarding` after 1 hour
- [ ] Cannot change role through API
- [ ] Middleware blocks wrong dashboard access
- [ ] Session correctly stores userType
- [ ] Token refresh maintains userType

---

## Key Files

### Frontend
- `src/app/auth/signup/page.tsx` - Email signup with role selection
- `src/app/auth/signin/page.tsx` - Login page
- `src/app/auth/onboarding/page.tsx` - OAuth user role selection
- `src/app/dashboard/page.tsx` - Auto-redirect to role dashboard

### Backend
- `src/lib/auth.ts` - NextAuth configuration & callbacks
- `src/middleware.ts` - Route protection & onboarding redirect
- `src/app/api/auth/register/route.ts` - Email registration
- `src/app/api/users/onboarding/route.ts` - OAuth onboarding

### Utilities
- `src/lib/permissions.ts` - Role-based permission checks
- `src/types/next-auth.d.ts` - TypeScript session types

---

## FAQ

**Q: Can a user have both roles?**
A: No, each user can only have one role - either Skill Provider or Project Creator.

**Q: What if a user wants to change their role later?**
A: They cannot. The role is permanent. They would need to create a new account.

**Q: What happens if an OAuth user skips onboarding?**
A: The middleware will keep redirecting them to `/auth/onboarding` until they select a role.

**Q: Can admins change user roles?**
A: Yes, admins can directly update the database, but there's no UI for this by design.

**Q: What if the user closes the browser during onboarding?**
A: When they return and sign in, they'll be redirected back to onboarding (within 1 hour).

**Q: What's the default role?**
A: `SKILL_PROVIDER` is the default in the database, but it's only temporary until user selects.

---

## Summary

✅ **First-time users** choose their role during signup/onboarding
✅ **Returning users** are automatically directed to their role-specific dashboard
✅ **Role is permanent** and cannot be changed
✅ **OAuth users** complete role selection on onboarding page
✅ **Middleware enforces** role-based access control
✅ **Session tracks** userType for proper redirects

**Status:** ✅ Fully Implemented

**Last Updated:** October 25, 2025
