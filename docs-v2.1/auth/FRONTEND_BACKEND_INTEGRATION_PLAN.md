# Frontend-Backend Authentication Integration Plan

**Project:** Rukny.io  
**Date:** January 15, 2026  
**Frontend:** Next.js 16 (React 19)  
**Backend:** NestJS (Port 3001)  
**Status:** Pre-Implementation Planning

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Integration Architecture](#integration-architecture)
4. [Implementation Phases](#implementation-phases)
5. [Detailed Implementation Steps](#detailed-implementation-steps)
6. [File Structure](#file-structure)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Considerations](#deployment-considerations)

---

## Overview

### Goal
Connect the prepared Next.js frontend with the fully-functional NestJS backend authentication system to enable:
1. **QuickSign Login** (Magic Link via Email)
2. **Google OAuth Login**
3. **Session Management** (Access + Refresh Tokens)
4. **Protected Routes**

### Authentication Methods to Integrate

| Method | Backend Status | Frontend Status | Priority |
|--------|----------------|-----------------|----------|
| QuickSign (Magic Link) | ✅ Complete | ⏳ To Implement | 🔴 High |
| Google OAuth | ✅ Complete | ⏳ To Implement | 🔴 High |
| LinkedIn OAuth | ✅ Complete | ⏳ Optional | 🟡 Low |
| 2FA (TOTP) | ✅ Complete | ⏳ Future | 🟢 Future |

---

## Current State Analysis

### Backend (Already Complete)

✅ **Authentication Endpoints:**
- `POST /auth/quicksign/request` - Request magic link
- `GET /auth/quicksign/verify/:token` - Verify magic link
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/oauth/exchange` - Exchange OAuth code for tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout current session
- `GET /auth/me` - Get current user

✅ **Security Features:**
- httpOnly cookies for refresh tokens
- JWT access tokens (15 min expiry)
- Token rotation on refresh
- Account lockout protection
- IP verification
- Rate limiting
- CSRF protection

### Frontend (Current State)

📦 **Dependencies Installed:**
- Next.js 16
- React 19
- Tailwind CSS
- shadcn/ui components (Button, Avatar, Alert)
- lucide-react (icons)

📁 **Structure:**
```
apps/web/src/
├── (app)/
│   ├── app/
│   │   └── page.tsx (empty)
│   ├── (username)/
│   ├── layout.tsx
│   └── page.tsx (empty)
├── components/
│   └── ui/ (shadcn components)
├── lib/
│   ├── api/ (empty)
│   ├── hooks/ (empty)
│   └── utils/
└── ...
```

⚠️ **Missing:**
- API client
- Authentication context
- Login pages
- Protected route middleware
- Token management
- Error handling

---

## Integration Architecture

### System Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Next.js App (Port 3000)                  │     │
│  │                                                  │     │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐ │     │
│  │  │ Login Page │  │ Auth       │  │ API      │ │     │
│  │  │            │→ │ Context    │→ │ Client   │ │     │
│  │  └────────────┘  └────────────┘  └──────────┘ │     │
│  │         ↓              ↓              ↓         │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │  Protected Routes (Dashboard, etc.)      │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │ (Access Token in Header)
                       │ (Refresh Token in Cookie)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         NestJS Backend API (Port 3001)                      │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Auth       │  │ Session    │  │ Security   │          │
│  │ Controller │→ │ Management │→ │ Logging    │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│         ↓              ↓              ↓                    │
│  ┌──────────────────────────────────────────┐             │
│  │         PostgreSQL Database              │             │
│  │  - Users   - Sessions   - SecurityLogs   │             │
│  └──────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Token Flow

```
1. User Action (Login Request)
   ↓
2. Backend Authentication
   ↓
3. Generate Tokens:
   - Access Token (15 min) → Response Body → Frontend Memory
   - Refresh Token (14 days) → httpOnly Cookie → Browser
   ↓
4. Frontend Stores Access Token in Memory (React State)
   ↓
5. API Requests:
   - Send Access Token in Authorization Header
   - Refresh Token sent automatically (Cookie)
   ↓
6. Token Expiry:
   - Access Token expires → Auto-refresh using Refresh Token
   - Refresh Token expires → Redirect to login
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)
- ✅ Set up environment variables
- ✅ Create API client infrastructure
- ✅ Implement authentication context
- ✅ Add token management utilities

### Phase 2: QuickSign Integration (Day 3-4)
- ✅ Create login page with email input
- ✅ Implement magic link request
- ✅ Create verification page
- ✅ Handle token exchange

### Phase 3: Google OAuth Integration (Day 5-6)
- ✅ Add Google OAuth button
- ✅ Create OAuth callback handler
- ✅ Implement code exchange flow
- ✅ Handle OAuth errors

### Phase 4: Protected Routes (Day 7)
- ✅ Create middleware for route protection
- ✅ Implement auth checks
- ✅ Add loading states

### Phase 5: Testing & Polish (Day 8-10)
- ✅ End-to-end testing
- ✅ Error handling refinement
- ✅ UI/UX improvements
- ✅ Performance optimization

---

## Work Stages & Task Breakdown

This section provides a detailed breakdown of implementation stages with specific tasks, time estimates, dependencies, and validation criteria. Use this as your implementation roadmap.

### Stage 0: Pre-Implementation Setup (30 minutes)

**Objective:** Prepare development environment and verify backend status

**Tasks:**
- [ ] Verify backend is running on port 3001
- [ ] Test backend endpoints with Postman/Thunder Client:
  - [ ] `GET /auth/me` (should return 401)
  - [ ] `POST /auth/quicksign/request` (with test email)
  - [ ] `GET /auth/google` (should redirect)
- [ ] Verify PostgreSQL database is accessible
- [ ] Confirm Redis is running (for OAuth codes)
- [ ] Check backend environment variables are set
- [ ] Review backend Swagger documentation at `http://localhost:3001/api`

**Validation:**
- ✅ Backend returns expected responses (401, 200, redirects)
- ✅ No CORS errors when testing from frontend domain
- ✅ Database migrations are up to date

**Dependencies:** None

---

### Stage 1: Environment & Configuration (45 minutes)

**Objective:** Configure frontend environment and Next.js settings

**Tasks:**
- [ ] Create `apps/web/.env.local` with required variables:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3001
  NEXT_PUBLIC_API_VERSION=v1
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_APP_NAME=Rukny.io
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
  ```
- [ ] Create `apps/web/.env.production` for production values
- [ ] Update `apps/web/next.config.ts`:
  - [ ] Add environment variable validation
  - [ ] Configure API proxy rewrites (optional)
  - [ ] Verify TypeScript configuration
- [ ] Test environment variables are loaded:
  ```bash
  npm run dev
  # Check console for env vars
  ```

**Deliverables:**
- ✅ `.env.local` file with all required variables
- ✅ `.env.production` template ready
- ✅ `next.config.ts` updated with validation
- ✅ Environment variables accessible in browser console

**Validation:**
- ✅ `console.log(process.env.NEXT_PUBLIC_API_URL)` prints correct URL
- ✅ Next.js dev server starts without errors
- ✅ No TypeScript errors in config file

**Dependencies:** Stage 0 complete

**Estimated Time:** 45 minutes

---

### Stage 2: Core API Infrastructure (2 hours)

**Objective:** Build the foundation API client with automatic token refresh and error handling

#### Task 2.1: Create API Client Base (60 min)

- [ ] Create `apps/web/src/lib/api/client.ts`
- [ ] Implement `ApiClient` class:
  - [ ] Constructor with base URL configuration
  - [ ] `setAccessToken()` and `getAccessToken()` methods
  - [ ] Private `request()` method with:
    - [ ] Authorization header injection
    - [ ] Cookie credential inclusion
    - [ ] Response unwrapping logic
    - [ ] 401 handling with retry counter
  - [ ] Private `refreshToken()` method with mutex pattern:
    - [ ] `refreshPromise` for race condition prevention
    - [ ] Response unwrapping for wrapped format
    - [ ] Promise cleanup in finally block
  - [ ] Public `get()`, `post()`, `delete()` methods
- [ ] Implement `getApiClient()` factory function:
  - [ ] Browser-only check (`typeof window !== 'undefined'`)
  - [ ] Singleton instance management
  - [ ] Error on SSR usage
- [ ] Export backward-compatible `apiClient` constant
- [ ] Add JSDoc comments for all public methods

**Code Checkpoints:**
```typescript
// Verify these patterns exist:
✓ retryCount parameter in request() method
✓ refreshPromise: Promise<boolean> | null declaration
✓ getApiClient() throws error in SSR
✓ Response unwrapping: result && 'data' in result ? result.data : result
```

#### Task 2.2: Create Error Handling (30 min)

- [ ] Create `apps/web/src/lib/api/errors.ts`
- [ ] Implement `ApiError` class:
  - [ ] Constructor with message, statusCode, data
  - [ ] Helper methods: `isUnauthorized()`, `isForbidden()`, `isNotFound()`, `isValidationError()`, `isServerError()`
- [ ] Implement `handleApiError()` function:
  - [ ] Check for `ApiError` instance
  - [ ] Map status codes to user-friendly messages
  - [ ] Handle rate limiting (429) with retry-after
  - [ ] Return fallback for unknown errors
- [ ] Add TypeScript error type guards

#### Task 2.3: Create Auth API Methods (30 min)

- [ ] Create `apps/web/src/lib/api/auth.ts`
- [ ] Define TypeScript interfaces:
  - [ ] `User` interface (id, email, role, name, username, avatar)
  - [ ] `QuickSignRequestData` and `QuickSignResponse`
  - [ ] `OAuthExchangeData`
  - [ ] `AuthResponse` with requires2FA and requiresIPVerification flags
- [ ] Implement `authApi` object:
  - [ ] `requestQuickSign(data)` - POST to `/quicksign/request`
  - [ ] `verifyQuickSign(token)` - GET to `/quicksign/verify/:token`
  - [ ] `exchangeOAuthCode(data)` - POST to `/oauth/exchange`
  - [ ] `me()` - GET to `/me`
  - [ ] `logout()` - POST to `/logout`
  - [ ] `getGoogleAuthUrl()` - Generate Google OAuth URL
- [ ] Use `getApiClient()` with browser check

**Deliverables:**
- ✅ `lib/api/client.ts` (200+ lines)
- ✅ `lib/api/errors.ts` (50+ lines)
- ✅ `lib/api/auth.ts` (80+ lines)
- ✅ All files have TypeScript types
- ✅ JSDoc comments on public APIs

**Validation:**
- ✅ No TypeScript errors in all three files
- ✅ Import from other files works without circular dependencies
- ✅ `getApiClient()` throws error in Node.js environment test:
  ```typescript
  // Test: Should throw
  delete global.window;
  expect(() => getApiClient()).toThrow();
  ```

**Dependencies:** Stage 1 complete

**Estimated Time:** 2 hours

---

### Stage 3: Authentication Context (1.5 hours)

**Objective:** Create global authentication state management with React Context

#### Task 3.1: Create AuthContext Provider (60 min)

- [ ] Create `apps/web/src/lib/context/AuthContext.tsx`
- [ ] Add `'use client'` directive at top
- [ ] Define `AuthContextType` interface:
  - [ ] `user: User | null`
  - [ ] `loading: boolean`
  - [ ] `isAuthenticated: boolean`
  - [ ] `login: (accessToken: string) => Promise<void>`
  - [ ] `logout: () => Promise<void>`
  - [ ] `refreshUser: () => Promise<void>`
- [ ] Create `AuthContext` with `createContext()`
- [ ] Implement `AuthProvider` component:
  - [ ] State: `user`, `loading`
  - [ ] `useEffect` to check for refresh cookie before loading user
  - [ ] `loadUser()` function with error handling
  - [ ] `login()` function: set token → fetch user
  - [ ] `logout()` function: API call → clear state only on success/401
  - [ ] `refreshUser()` function: re-fetch user data
  - [ ] Context provider with all values
- [ ] Implement `useAuth()` hook with error checking

**Code Checkpoints:**
```typescript
// Verify these patterns exist:
✓ Cookie check before API call: document.cookie.includes('refresh_token')
✓ Logout only clears state on success or 401
✓ useAuth throws error if used outside provider
✓ getApiClient() call at module level (outside component)
```

#### Task 3.2: Integrate AuthProvider in App (15 min)

- [ ] Update `apps/web/src/app/layout.tsx`
- [ ] Import `AuthProvider` from context
- [ ] Wrap `{children}` with `<AuthProvider>`
- [ ] Verify metadata is preserved
- [ ] Test provider renders without errors

#### Task 3.3: Create useAuth Hook Export (15 min)

- [ ] Create `apps/web/src/lib/hooks/index.ts`
- [ ] Re-export `useAuth` from context
- [ ] Add JSDoc comments
- [ ] Create `README.md` in hooks folder documenting usage

**Deliverables:**
- ✅ `lib/context/AuthContext.tsx` (120+ lines)
- ✅ `app/layout.tsx` updated with AuthProvider
- ✅ `lib/hooks/index.ts` created
- ✅ Documentation for useAuth hook

**Validation:**
- ✅ Start dev server: `npm run dev`
- ✅ No console errors about context
- ✅ React DevTools shows AuthProvider in component tree
- ✅ `loading` state transitions from true → false
- ✅ No immediate API call if no refresh cookie exists

**Dependencies:** Stage 2 complete

**Estimated Time:** 1.5 hours

---

### Stage 4: Login Page & QuickSign Flow (2.5 hours)

**Objective:** Implement email-based magic link authentication

#### Task 4.1: Create Login Page UI (45 min)

- [ ] Create `apps/web/src/app/login/page.tsx`
- [ ] Add `'use client'` directive
- [ ] Import required dependencies:
  - [ ] React hooks, Next.js navigation, auth API, errors, UI components
- [ ] Set up component state:
  - [ ] `email`, `loading`, `error`, `success`
- [ ] Implement form UI:
  - [ ] Email input with validation
  - [ ] Submit button with loading state
  - [ ] Success alert (magic link sent)
  - [ ] Error alert with specific messages
  - [ ] Google OAuth button (placeholder)
- [ ] Add Tailwind styling for responsive design

#### Task 4.2: Implement QuickSign Request Handler (30 min)

- [ ] Create `handleQuickSignRequest()` function:
  - [ ] Prevent default form submission
  - [ ] Set loading state
  - [ ] Call `authApi.requestQuickSign({ email })`
  - [ ] Handle success: show success message
  - [ ] Handle rate limiting (429): show retry-after countdown
  - [ ] Handle other errors: show user-friendly message
  - [ ] Always clear loading state in finally block
- [ ] Add email format validation
- [ ] Disable form during submission
- [ ] Disable form after successful submission

#### Task 4.3: Add Google OAuth Button (15 min)

- [ ] Create `handleGoogleLogin()` function:
  - [ ] Redirect to `authApi.getGoogleAuthUrl()`
  - [ ] Use `window.location.href` for full navigation
- [ ] Add Google icon SVG
- [ ] Style button to match design
- [ ] Add loading state prevention

#### Task 4.4: Create QuickSign Verification Page (60 min)

- [ ] Create `apps/web/src/app/auth/quicksign/verify/[token]/page.tsx`
- [ ] Add `'use client'` directive
- [ ] Extract token from URL params
- [ ] Set up component state: `error`, `verifying`
- [ ] Implement `verifyToken()` function:
  - [ ] Call `authApi.verifyQuickSign(token)`
  - [ ] Check for `requires2FA` → redirect to `/login/2fa`
  - [ ] Check for `requiresIPVerification` → redirect to `/auth/verify-ip`
  - [ ] Check for `needsProfileCompletion` → redirect to `/onboarding/complete-profile`
  - [ ] Default: redirect to `/dashboard`
  - [ ] Handle errors: show error message + back to login button
- [ ] Create loading UI (spinner + text)
- [ ] Create error UI (error message + retry button)
- [ ] Add proper error handling for invalid/expired tokens

**Deliverables:**
- ✅ `app/login/page.tsx` (150+ lines)
- ✅ `app/auth/quicksign/verify/[token]/page.tsx` (120+ lines)
- ✅ Responsive UI with loading and error states
- ✅ Rate limiting message with countdown

**Validation:**
- ✅ Login page renders at `http://localhost:3000/login`
- ✅ Email input accepts valid email format
- ✅ Submit button triggers API call (check Network tab)
- ✅ Success message appears after submission
- ✅ Rate limiting shows correct countdown (test by spamming)
- ✅ Verification page handles invalid token gracefully
- ✅ Valid magic link redirects to dashboard (end-to-end test)

**Dependencies:** Stage 3 complete

**Estimated Time:** 2.5 hours

---

### Stage 5: Google OAuth Flow (2 hours)

**Objective:** Implement Google OAuth authentication with callback handling

#### Task 5.1: Create OAuth Callback Handler (75 min)

- [ ] Create `apps/web/src/app/auth/callback/page.tsx`
- [ ] Add `'use client'` directive
- [ ] Import `useAuth`, `authApi`, `useSearchParams`, `useRouter`
- [ ] Set up component state: `error`
- [ ] Implement `useEffect` with search params handling:
  - [ ] Check for `error` parameter first (OAuth provider errors)
  - [ ] Extract `error_description` for user-friendly message
  - [ ] Check for missing `code` parameter
  - [ ] Call `exchangeCode(code)` if valid
- [ ] Implement `exchangeCode()` function:
  - [ ] Call `authApi.exchangeOAuthCode({ code })`
  - [ ] Handle `requires2FA` → store temp token → redirect to `/login/2fa`
  - [ ] Handle `requiresIPVerification` → store temp token → redirect to `/auth/verify-ip`
  - [ ] Call `login(response.access_token)`
  - [ ] Handle `needsProfileCompletion` → redirect to `/onboarding/complete-profile`
  - [ ] Default: redirect to `/dashboard`
  - [ ] Handle errors: show message + auto-redirect to login after 3s
- [ ] Create loading UI (spinner + "Authenticating...")
- [ ] Create error UI (error message + auto-redirect notice)

#### Task 5.2: Test OAuth Flow End-to-End (30 min)

- [ ] Click "Sign in with Google" button
- [ ] Verify redirect to Google consent screen
- [ ] Approve consent
- [ ] Verify redirect back to `http://localhost:3000/auth/callback?code=...`
- [ ] Verify code exchange in Network tab
- [ ] Verify redirect to dashboard
- [ ] Verify user data loaded in auth context
- [ ] Test error case: deny consent → verify error message
- [ ] Test invalid code: manually edit URL → verify error handling

#### Task 5.3: Add OAuth Error Scenarios (15 min)

- [ ] Test user cancellation (error=access_denied)
- [ ] Test invalid client ID (error=invalid_client)
- [ ] Test expired authorization code (exchange fails)
- [ ] Verify all errors show user-friendly messages
- [ ] Verify auto-redirect to login works

**Deliverables:**
- ✅ `app/auth/callback/page.tsx` (120+ lines)
- ✅ OAuth flow works end-to-end
- ✅ Error handling for all OAuth failure modes

**Validation:**
- ✅ Google OAuth flow completes successfully
- ✅ User data appears in React DevTools (AuthContext)
- ✅ Access token stored in API client (check Network requests have Bearer token)
- ✅ Refresh token cookie set (check Application > Cookies in DevTools)
- ✅ User cancellation shows proper error message
- ✅ Invalid code redirects to login

**Dependencies:** Stage 4 complete

**Estimated Time:** 2 hours

---

### Stage 6: Protected Routes & Middleware (1 hour)

**Objective:** Implement route protection and authentication-based redirects

#### Task 6.1: Create Middleware (30 min)

- [ ] Create `apps/web/src/middleware.ts` at root of src
- [ ] Import Next.js middleware types
- [ ] Implement `middleware()` function:
  - [ ] Detect environment (production vs development)
  - [ ] Check for environment-specific cookie: `__Secure-refresh_token` (prod) or `refresh_token` (dev)
  - [ ] Define auth pages: `/login`, `/auth/*`
  - [ ] Define protected routes: `/dashboard/*`, `/app/*`
  - [ ] Logic: Redirect authenticated users away from auth pages
  - [ ] Logic: Redirect unauthenticated users to login
  - [ ] Return `NextResponse.next()` for allowed routes
- [ ] Configure `matcher` array:
  - [ ] `/dashboard/:path*`
  - [ ] `/app/:path*`
  - [ ] `/login`
  - [ ] `/auth/:path*`

**Code Checkpoints:**
```typescript
// Verify these patterns exist:
✓ Environment check: process.env.NODE_ENV === 'production'
✓ Cookie name selection based on environment
✓ Separate redirects for auth vs protected routes
✓ Proper matcher configuration (no regex)
```

#### Task 6.2: Create Protected Dashboard Page (15 min)

- [ ] Create `apps/web/src/app/dashboard/page.tsx`
- [ ] Add `'use client'` directive
- [ ] Import `useAuth` hook
- [ ] Display loading state while auth context loads
- [ ] Display user data: name, email, avatar
- [ ] Add logout button calling `logout()` from useAuth
- [ ] Add basic dashboard layout with Tailwind

#### Task 6.3: Test Route Protection (15 min)

- [ ] Test logged-out user accessing `/dashboard` → redirects to `/login`
- [ ] Test logged-in user accessing `/login` → redirects to `/dashboard`
- [ ] Test protected routes require authentication
- [ ] Test middleware doesn't interfere with public pages
- [ ] Verify no infinite redirect loops

**Deliverables:**
- ✅ `src/middleware.ts` (40+ lines)
- ✅ `app/dashboard/page.tsx` (basic protected page)
- ✅ Route protection working correctly

**Validation:**
- ✅ Accessing `/dashboard` when logged out → redirects to `/login`
- ✅ Accessing `/login` when logged in → redirects to `/dashboard`
- ✅ Logout button clears session and redirects to login
- ✅ No console errors about middleware
- ✅ Check Application > Cookies: cookie is deleted after logout

**Dependencies:** Stage 5 complete

**Estimated Time:** 1 hour

---

### Stage 7: Testing & Validation (2 hours)

**Objective:** Comprehensive testing of all authentication flows

#### Task 7.1: Manual Flow Testing (60 min)

**QuickSign Flow:**
- [ ] Request magic link with valid email → check email received
- [ ] Click magic link → verify redirect to dashboard
- [ ] Request link with rate-limited email → verify countdown shown
- [ ] Use expired magic link → verify error message
- [ ] Use invalid magic link → verify error handling

**Google OAuth Flow:**
- [ ] Click Google button → verify redirect to consent screen
- [ ] Approve consent → verify redirect to dashboard
- [ ] Deny consent → verify error message and redirect
- [ ] Use invalid OAuth code (manually edit URL) → verify error

**Token Management:**
- [ ] Verify access token in memory (not localStorage):
  - [ ] Check Application > Local Storage (should be empty)
  - [ ] Check React DevTools > Components > ApiClient instance
- [ ] Verify refresh token in httpOnly cookie:
  - [ ] Check Application > Cookies > refresh_token
  - [ ] Verify httpOnly flag is set
- [ ] Test auto-refresh on 401:
  - [ ] Login → wait 15 minutes → make API call → verify auto-refresh
  - [ ] OR: manually delete access token → make API call → verify refresh

**Protected Routes:**
- [ ] Try accessing `/dashboard` when logged out → redirects to `/login`
- [ ] Login → access `/dashboard` → content loads
- [ ] Try accessing `/login` when logged in → redirects to `/dashboard`

**Logout:**
- [ ] Click logout button → verify redirect to login
- [ ] Verify cookie deleted (Application > Cookies)
- [ ] Verify can't access protected routes anymore

#### Task 7.2: Error Scenario Testing (30 min)

- [ ] Network failure: Disable network → try login → verify error message
- [ ] Backend down: Stop backend → try login → verify error handling
- [ ] Invalid email format → verify validation error
- [ ] Empty form submission → verify validation
- [ ] Expired session: Logout on backend → try API call → verify redirect to login
- [ ] Multiple rapid requests → verify rate limiting message

#### Task 7.3: Cross-Browser Testing (30 min)

- [ ] Test in Chrome: All flows work
- [ ] Test in Firefox: All flows work
- [ ] Test in Safari: All flows work (cookie issues?)
- [ ] Test in mobile viewport: UI is responsive
- [ ] Test with browser dev tools throttling: Loading states appear

**Deliverables:**
- ✅ All test scenarios pass
- ✅ No console errors during normal operation
- ✅ Error messages are user-friendly
- ✅ UI is responsive on mobile

**Validation Checklist:**
- ✅ QuickSign login works end-to-end
- ✅ Google OAuth login works end-to-end
- ✅ Tokens managed securely (no localStorage exposure)
- ✅ Auto-refresh prevents session interruption
- ✅ Protected routes redirect properly
- ✅ Logout clears session completely
- ✅ Rate limiting handled gracefully
- ✅ All error scenarios show appropriate messages
- ✅ No memory leaks (check Chrome Task Manager)
- ✅ Works across major browsers

**Dependencies:** Stage 6 complete

**Estimated Time:** 2 hours

---

### Stage 8: Polish & Documentation (1.5 hours)

**Objective:** Final refinements and documentation for deployment

#### Task 8.1: UI/UX Polish (30 min)

- [ ] Add loading skeletons to dashboard
- [ ] Improve error message styling
- [ ] Add success animations (optional)
- [ ] Verify all buttons have hover states
- [ ] Check accessibility:
  - [ ] All inputs have labels
  - [ ] Error messages have proper ARIA attributes
  - [ ] Keyboard navigation works
  - [ ] Focus states are visible
- [ ] Test on slow 3G network (Chrome DevTools)

#### Task 8.2: Code Cleanup (30 min)

- [ ] Remove console.log statements
- [ ] Add JSDoc comments to all exported functions
- [ ] Fix any TypeScript `any` types
- [ ] Run linter: `npm run lint`
- [ ] Fix linting errors
- [ ] Format code: `npm run format` (if available)
- [ ] Remove unused imports
- [ ] Remove commented-out code

#### Task 8.3: Documentation (30 min)

- [ ] Update main README.md with:
  - [ ] Authentication setup instructions
  - [ ] Environment variables required
  - [ ] How to test auth flows
  - [ ] Common troubleshooting steps
- [ ] Create `.env.example` file with template
- [ ] Document API integration points
- [ ] Add inline code comments for complex logic
- [ ] Document known issues/limitations

**Deliverables:**
- ✅ Polished UI with no rough edges
- ✅ Clean, well-documented code
- ✅ Updated README.md
- ✅ `.env.example` template

**Validation:**
- ✅ `npm run lint` passes with no errors
- ✅ No console warnings/errors in production build
- ✅ TypeScript build succeeds: `npm run build`
- ✅ Lighthouse accessibility score > 90
- ✅ All team members can set up project using README

**Dependencies:** Stage 7 complete

**Estimated Time:** 1.5 hours

---

## Work Stage Summary

| Stage | Description | Time | Dependencies | Status |
|-------|-------------|------|--------------|--------|
| 0 | Pre-Implementation Setup | 30 min | None | ⏳ Pending |
| 1 | Environment & Configuration | 45 min | Stage 0 | ⏳ Pending |
| 2 | Core API Infrastructure | 2 hrs | Stage 1 | ⏳ Pending |
| 3 | Authentication Context | 1.5 hrs | Stage 2 | ⏳ Pending |
| 4 | Login Page & QuickSign | 2.5 hrs | Stage 3 | ⏳ Pending |
| 5 | Google OAuth Flow | 2 hrs | Stage 4 | ⏳ Pending |
| 6 | Protected Routes | 1 hr | Stage 5 | ⏳ Pending |
| 7 | Testing & Validation | 2 hrs | Stage 6 | ⏳ Pending |
| 8 | Polish & Documentation | 1.5 hrs | Stage 7 | ⏳ Pending |
| **TOTAL** | **Complete Integration** | **13.5 hrs** | - | **⏳ Not Started** |

### Critical Path

```
Stage 0 → Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5 → Stage 6 → Stage 7 → Stage 8
  (30m)    (45m)     (2h)      (1.5h)    (2.5h)    (2h)      (1h)      (2h)      (1.5h)
```

**Total Implementation Time:** 13.5 hours (~2 working days)

### Progress Tracking

Use this checklist to track overall progress:

**Day 1 (6-7 hours):**
- [ ] Stage 0: Pre-Implementation Setup ✓
- [ ] Stage 1: Environment & Configuration ✓
- [ ] Stage 2: Core API Infrastructure ✓
- [ ] Stage 3: Authentication Context ✓
- [ ] Stage 4: Login Page & QuickSign ✓

**Day 2 (6-7 hours):**
- [ ] Stage 5: Google OAuth Flow ✓
- [ ] Stage 6: Protected Routes ✓
- [ ] Stage 7: Testing & Validation ✓
- [ ] Stage 8: Polish & Documentation ✓

**Deployment Ready:** 🚀
- [ ] All stages complete
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Ready for production deployment

---

## Detailed Implementation Steps

### STEP 1: Environment Configuration

#### 1.1 Create Environment Files

**File:** `apps/web/.env.local`
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_VERSION=v1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Rukny.io

# Google OAuth (for client-side)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**File:** `apps/web/.env.production`
```env
NEXT_PUBLIC_API_URL=https://api.rukny.io
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_APP_URL=https://rukny.io
NEXT_PUBLIC_APP_NAME=Rukny.io
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id
```

#### 1.2 Update Next.js Config

**File:** `apps/web/next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    // serverActions: true, // if using server actions
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Rewrites for API proxy (optional, for development)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

---

### STEP 2: API Client Implementation

#### 2.1 Create Base API Client

**File:** `apps/web/src/lib/api/client.ts`

```typescript
import { ApiError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/auth`;
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0 // Track retry attempts to prevent infinite loops
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if access token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Important: Include cookies
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 (token expired)
      if (response.status === 401 && !endpoint.includes('/refresh')) {
        // Prevent infinite retry loop - only try once
        if (retryCount > 0) {
          throw new ApiError('Session expired. Please login again.', 401);
        }
        
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token (increment retry count)
          return this.request<T>(endpoint, options, retryCount + 1);
        } else {
          // Refresh failed, user needs to login
          throw new ApiError('Session expired. Please login again.', 401);
        }
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError('Server error', response.status);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Request failed',
          response.status,
          data
        );
      }

      // Unwrap standard API response format
      // Backend returns: { data: T, message?, statusCode }
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Network error or server unavailable',
        0,
        { originalError: error }
      );
    }
  }

  /**
   * Refresh access token using refresh token cookie
   * Uses mutex pattern to prevent race conditions from concurrent refresh attempts
   */
  private refreshPromise: Promise<boolean> | null = null;
  
  private async refreshToken(): Promise<boolean> {
    // Reuse existing refresh if already in progress
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          return false;
        }

        const result = await response.json();
        // Unwrap response if backend returns wrapped format: { data: { access_token } }
        const data = result && typeof result === 'object' && 'data' in result ? result.data : result;
        this.setAccessToken(data.access_token);
        return true;
      } catch {
        return false;
      } finally {
        // Clear promise after completion to allow future refreshes
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// IMPORTANT: Do NOT use singleton pattern to prevent SSR token leakage
// Create client-side only instance for browser usage
let clientSideInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  // Ensure this only runs in browser
  if (typeof window === 'undefined') {
    throw new Error('getApiClient() can only be called in client components');
  }
  
  if (!clientSideInstance) {
    clientSideInstance = new ApiClient();
  }
  
  return clientSideInstance;
}

// For backward compatibility during migration
export const apiClient = typeof window !== 'undefined' ? getApiClient() : null as any;
```

#### 2.2 Create Error Handler

**File:** `apps/web/src/lib/api/errors.ts`

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isUnauthorized()) {
      return 'Please log in to continue';
    }
    if (error.isForbidden()) {
      return 'You do not have permission to perform this action';
    }
    if (error.isNotFound()) {
      return 'The requested resource was not found';
    }
    if (error.isValidationError()) {
      return error.data?.message || 'Invalid input';
    }
    if (error.isServerError()) {
      return 'Server error. Please try again later';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
```

#### 2.3 Create Authentication API

**File:** `apps/web/src/lib/api/auth.ts`

```typescript
import { getApiClient } from './client';

// Get client-side API client instance
const apiClient = typeof window !== 'undefined' ? getApiClient() : null as any;

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
  avatar?: string;
}

export interface QuickSignRequestData {
  email: string;
}

export interface QuickSignResponse {
  success: boolean;
  message: string;
}

export interface OAuthExchangeData {
  code: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
  needsProfileCompletion?: boolean;
  requires2FA?: boolean;              // Backend returns this when 2FA is required
  requiresIPVerification?: boolean;   // Backend returns this for new device/IP
}

export const authApi = {
  /**
   * Request QuickSign magic link
   */
  async requestQuickSign(data: QuickSignRequestData): Promise<QuickSignResponse> {
    return apiClient.post<QuickSignResponse>('/quicksign/request', data);
  },

  /**
   * Verify QuickSign token (from magic link)
   */
  async verifyQuickSign(token: string): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>(`/quicksign/verify/${token}`);
  },

  /**
   * Exchange OAuth code for tokens
   */
  async exchangeOAuthCode(data: OAuthExchangeData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/oauth/exchange', data);
  },

  /**
   * Get current user
   */
  async me(): Promise<User> {
    return apiClient.get<User>('/me');
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    return apiClient.post<void>('/logout');
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}/auth/google`;
  },
};
```

---

### STEP 3: Authentication Context

**File:** `apps/web/src/lib/context/AuthContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, type User } from '@/lib/api/auth';
import { getApiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

const apiClient = getApiClient();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount (only if refresh token exists)
  useEffect(() => {
    // Check if refresh token exists before making API call
    const hasRefreshToken = typeof window !== 'undefined' && (
      document.cookie.includes('refresh_token') || 
      document.cookie.includes('__Secure-refresh_token')
    );
    
    if (hasRefreshToken) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUser() {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      if (error instanceof ApiError && !error.isUnauthorized()) {
        console.error('Failed to load user:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(accessToken: string) {
    // Set token in API client
    apiClient.setAccessToken(accessToken);
    
    // Fetch user data
    await loadUser();
  }

  async function logout() {
    try {
      await authApi.logout();
      // Logout successful - clear state
      setUser(null);
      apiClient.setAccessToken(null);
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized()) {
        // Already logged out on backend - clear state
        setUser(null);
        apiClient.setAccessToken(null);
      } else {
        // Network error or server error - keep state and propagate error
        console.error('Logout failed:', error);
        throw error;
      }
    }
  }

  async function refreshUser() {
    await loadUser();
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### STEP 4: Login Page (QuickSign)

**File:** `apps/web/src/app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleQuickSignRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authApi.requestQuickSign({ email });
      setSuccess(true);
      // Email sent successfully
    } catch (err) {
      // Handle rate limiting with specific message
      if (err instanceof ApiError && err.statusCode === 429) {
        const retryAfter = err.data?.retryAfter || 900; // 15 min default
        const minutes = Math.ceil(retryAfter / 60);
        setError(`Too many requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      } else {
        setError(handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    // Redirect to backend Google OAuth
    window.location.href = authApi.getGoogleAuthUrl();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign in to Rukny.io</h2>
          <p className="mt-2 text-center text-gray-600">
            Enter your email to receive a magic link
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {success && (
          <Alert>
            Check your email! We've sent you a magic link to sign in.
          </Alert>
        )}

        <form onSubmit={handleQuickSignRequest} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              disabled={loading || success}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || success}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* Google Icon SVG */}
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
```

---

### STEP 5: OAuth Callback Handler

**File:** `apps/web/src/app/auth/callback/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/errors';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth error parameters first
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const code = searchParams.get('code');
    
    if (error) {
      // OAuth provider returned an error (e.g., user cancelled)
      setError(errorDescription || error.replace(/_/g, ' '));
      setTimeout(() => router.push('/login'), 3000);
      return;
    }
    
    if (!code) {
      setError('No authorization code provided');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    exchangeCode(code);
  }, [searchParams]);

  async function exchangeCode(code: string) {
    try {
      // Exchange OAuth code for tokens
      const response = await authApi.exchangeOAuthCode({ code });

      // Handle 2FA requirement
      if (response.requires2FA) {
        // Store temporary token and redirect to 2FA page
        sessionStorage.setItem('temp_token', response.access_token);
        router.push('/login/2fa');
        return;
      }

      // Handle IP verification requirement
      if (response.requiresIPVerification) {
        // Store temporary token and redirect to IP verification page
        sessionStorage.setItem('temp_token', response.access_token);
        router.push('/auth/verify-ip');
        return;
      }

      // Set access token and fetch user
      await login(response.access_token);

      // Check if profile completion is needed
      if (response.needsProfileCompletion) {
        router.push('/onboarding/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      setTimeout(() => router.push('/login'), 3000);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-600 mt-2">Please wait while we sign you in</p>
      </div>
    </div>
  );
}
```

---

### STEP 6: QuickSign Verification Page

**File:** `apps/web/src/app/auth/quicksign/verify/[token]/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { handleApiError } from '@/lib/api/errors';

export default function QuickSignVerify() {
  const router = useRouter();
  const params = useParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const token = params.token as string;
    
    if (!token) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }

    verifyToken(token);
  }, [params]);

  async function verifyToken(token: string) {
    try {
      // Verify QuickSign token
      const response = await authApi.verifyQuickSign(token);

      // Handle 2FA requirement
      if (response.requires2FA) {
        // Store temporary token and redirect to 2FA page
        sessionStorage.setItem('temp_token', response.access_token);
        router.push('/login/2fa');
        return;
      }

      // Handle IP verification requirement
      if (response.requiresIPVerification) {
        // Store temporary token and redirect to IP verification page
        sessionStorage.setItem('temp_token', response.access_token);
        router.push('/auth/verify-ip');
        return;
      }

      // Set access token and fetch user
      await login(response.access_token);

      // Check if profile completion is needed
      if (response.needsProfileCompletion) {
        router.push('/onboarding/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
    } finally {
      setVerifying(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Verifying...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your link</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
```

---

### STEP 7: Protected Route Middleware

**File:** `apps/web/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for refresh token cookie (environment-specific to prevent spoofing)
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Secure-refresh_token' : 'refresh_token';
  const refreshToken = request.cookies.get(cookieName);

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/auth');
  
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/app');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/app/:path*',
    '/login',
    '/auth/:path*',
  ],
};
```

---

### STEP 8: Wrap App with Auth Provider

**File:** `apps/web/src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rukny.io",
  description: "Your platform description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## File Structure

After implementation, your structure will be:

```
apps/web/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page (QuickSign + Google)
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── page.tsx             # OAuth callback handler
│   │   │   └── quicksign/
│   │   │       └── verify/
│   │   │           └── [token]/
│   │   │               └── page.tsx     # QuickSign verification
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Protected dashboard
│   │   ├── layout.tsx                   # Root layout with AuthProvider
│   │   └── page.tsx                     # Home page
│   ├── components/
│   │   └── ui/                          # Existing shadcn components
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                # API client with auto-refresh
│   │   │   ├── auth.ts                  # Auth API methods
│   │   │   └── errors.ts                # Error handling
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Auth context provider
│   │   ├── hooks/
│   │   │   └── useAuth.ts               # Auth hook (re-export)
│   │   └── utils/
│   │       └── ...
│   └── middleware.ts                    # Route protection
├── .env.local                           # Environment variables
└── package.json
```

---

## Testing Strategy

### Manual Testing Checklist

#### QuickSign Flow
- [ ] Request magic link from login page
- [ ] Receive email with magic link
- [ ] Click link and verify token
- [ ] Redirect to dashboard after successful login
- [ ] Handle expired token gracefully
- [ ] Handle invalid token error

#### Google OAuth Flow
- [ ] Click "Sign in with Google" button
- [ ] Redirect to Google consent screen
- [ ] Approve and return to callback
- [ ] Exchange code for tokens
- [ ] Redirect to dashboard
- [ ] Handle OAuth errors

#### Token Management
- [ ] Access token stored in memory
- [ ] Refresh token stored in httpOnly cookie
- [ ] Auto-refresh on 401 error
- [ ] Logout clears tokens
- [ ] Protected routes work correctly

#### Error Handling
- [ ] Network errors displayed properly
- [ ] Validation errors shown to user
- [ ] Server errors handled gracefully
- [ ] Rate limit errors displayed
- [ ] Account lockout message shown

### Automated Testing (Future)

```typescript
// Example test with Jest/React Testing Library
describe('Login Flow', () => {
  it('should request magic link successfully', async () => {
    // Mock API call
    // Render component
    // Fill email input
    // Click submit
    // Assert success message
  });

  it('should handle Google OAuth', async () => {
    // Mock OAuth flow
    // Test redirect
    // Test callback handling
    // Assert user authenticated
  });
});
```

---

## Deployment Considerations

### Environment Variables (Production)

**Vercel (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://api.rukny.io
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_APP_URL=https://rukny.io
NEXT_PUBLIC_GOOGLE_CLIENT_ID=production-google-client-id
```

**Railway (Backend):**
```env
FRONTEND_URL=https://rukny.io
GOOGLE_CALLBACK_URL=https://api.rukny.io/auth/google/callback
JWT_SECRET=production-secret-min-32-chars
```

### CORS Configuration

Ensure backend allows frontend origin:
```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: [
    'https://rukny.io',
    'https://www.rukny.io',
    'http://localhost:3000', // development
  ],
  credentials: true,
});
```

### Cookie Settings

Production cookies must use:
- `secure: true` (HTTPS only)
- `sameSite: 'lax'`
- `domain: '.rukny.io'` (allow subdomains)

---

## Implementation Timeline

### Day 1: Foundation
- ⏰ 2-3 hours
- Set up environment variables
- Create API client
- Implement error handling
- Create auth context

### Day 2: QuickSign
- ⏰ 3-4 hours
- Build login page
- Implement magic link request
- Create verification page
- Test QuickSign flow

### Day 3: Google OAuth
- ⏰ 2-3 hours
- Add Google button
- Create callback handler
- Test OAuth flow
- Handle edge cases

### Day 4: Polish & Testing
- ⏰ 3-4 hours
- Add loading states
- Improve error messages
- Protected routes
- End-to-end testing

**Total Time:** 10-14 hours (2-3 days of focused work)

---

## Success Criteria

✅ **Working Features:**
- [ ] Users can request magic links
- [ ] Users can login via Google
- [ ] Tokens are properly managed
- [ ] Protected routes work
- [ ] Auto-refresh handles expired tokens
- [ ] Logout clears session
- [ ] Error messages are user-friendly

✅ **Security:**
- [ ] Refresh tokens in httpOnly cookies
- [ ] Access tokens never in localStorage
- [ ] CORS properly configured
- [ ] CSRF protection working
- [ ] No token leakage in logs

✅ **UX:**
- [ ] Loading states shown
- [ ] Errors displayed clearly
- [ ] Smooth redirects
- [ ] Mobile-responsive
- [ ] Fast load times

---

## Next Steps After Implementation

1. **Add LinkedIn OAuth** (optional)
2. **Implement 2FA** (future)
3. **Add session management UI** (show active devices)
4. **Implement "Remember Me"** (longer refresh token)
5. **Add password reset** (if adding password auth)
6. **Analytics integration** (track login success/failure)
7. **Error monitoring** (Sentry)

---

## Support & Resources

**Documentation:**
- [Backend Review](./LOGIN_AUTHENTICATION_COMPREHENSIVE_REVIEW.md)
- [Integration Guide](./BACKEND_FRONTEND_INTEGRATION_GUIDE.md)
- Backend API: `http://localhost:3001/api` (Swagger)

**Backend Endpoints Reference:**
- QuickSign Request: `POST /auth/quicksign/request`
- QuickSign Verify: `GET /auth/quicksign/verify/:token`
- Google OAuth: `GET /auth/google`
- OAuth Exchange: `POST /auth/oauth/exchange`
- Get User: `GET /auth/me`
- Refresh: `POST /auth/refresh`
- Logout: `POST /auth/logout`

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** January 15, 2026  
**Estimated Implementation Time:** 10-14 hours

---

## Quick Start Commands

```bash
# 1. Set up environment
cd apps/web
cp .env.example .env.local
# Edit .env.local with your values

# 2. Install dependencies (if needed)
npm install

# 3. Start development servers
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev

# 4. Open browser
# http://localhost:3000
```

Good luck with implementation! 🚀
