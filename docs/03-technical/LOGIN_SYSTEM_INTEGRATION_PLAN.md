# Login System Integration Plan

**Project:** Rukny.io  
**Date:** January 15, 2026  
**Version:** 1.0  
**Status:** 📋 Planning Phase - Ready for Implementation

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Backend Status Overview](#backend-status-overview)
3. [Frontend Preparation Status](#frontend-preparation-status)
4. [Integration Architecture](#integration-architecture)
5. [Implementation Phases](#implementation-phases)
6. [Technical Specifications](#technical-specifications)
7. [File Structure](#file-structure)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Authentication Flows](#authentication-flows)
10. [State Management](#state-management)
11. [Error Handling](#error-handling)
12. [Testing Strategy](#testing-strategy)
13. [Security Considerations](#security-considerations)
14. [Deployment Checklist](#deployment-checklist)

---

## Executive Summary

This document outlines the complete integration plan for connecting the frontend login system with the backend authentication services. The backend is **fully implemented and production-ready**, supporting:

- ✅ **QuickSign (Magic Link) Authentication** - Passwordless login via email
- ✅ **Google OAuth Login** - Social authentication with Google
- ✅ **OAuth Code Exchange** - Secure token exchange mechanism
- ✅ **Session Management** - JWT-based with refresh tokens

The frontend has prepared the UI structure (login, check-email, verify, callback pages) and now needs the API integration layer and authentication context implementation.

### Key Objectives

1. **Implement API Client** - Create a robust HTTP client for backend communication
2. **Build Authentication Context** - React context for global auth state management
3. **Integrate QuickSign Flow** - Connect magic link login UI to backend
4. **Integrate Google OAuth** - Connect Google login button to OAuth flow
5. **Handle OAuth Callback** - Process OAuth redirects and token exchange
6. **Manage Session State** - Store access tokens and handle refresh logic
7. **Implement Route Protection** - Guard protected routes based on auth state

### Timeline Estimate

- **Phase 1** (API Client & Types): 2-3 hours
- **Phase 2** (Auth Context & Hooks): 2-3 hours
- **Phase 3** (QuickSign Integration): 2-3 hours
- **Phase 4** (Google OAuth Integration): 2-3 hours
- **Phase 5** (Route Protection & Guards): 1-2 hours
- **Phase 6** (Testing & Refinement): 2-3 hours

**Total Estimated Time:** 11-17 hours

---

## Backend Status Overview

### ✅ Fully Implemented Features

#### QuickSign (Magic Link) Authentication

**Endpoint:** `POST /auth/quicksign/request`
- Sends magic link email to user
- Returns: `{ success: true, message: string, type: 'LOGIN' | 'SIGNUP', expiresIn: 600 }`
- Rate Limited: 3 requests per 15 minutes

**Endpoint:** `GET /auth/quicksign/verify/:token`
- Verifies magic link token
- Creates session and redirects to `/auth/callback?code=XXX`
- Handles IP verification if needed
- Handles 2FA if enabled

**Endpoint:** `POST /auth/quicksign/resend`
- Resends magic link email
- Rate Limited: 2 requests per 15 minutes

#### Google OAuth Authentication

**Endpoint:** `GET /auth/google`
- Initiates Google OAuth flow
- Redirects to Google consent screen

**Endpoint:** `GET /auth/google/callback`
- Google OAuth callback handler
- Creates session and generates one-time code
- Redirects to frontend: `/auth/callback?code=XXX`

**Endpoint:** `POST /auth/oauth/exchange`
- Exchanges one-time code for access token
- Returns: `{ access_token: string, expires_in: number, user: User, needsProfileCompletion: boolean }`
- Sets `refresh_token` in httpOnly cookie automatically
- Rate Limited: 50 requests per minute

#### Session Management

- Access tokens: Short-lived (15 minutes)
- Refresh tokens: Long-lived (7 days), stored in httpOnly cookie
- Automatic token refresh on 401 responses

---

## Frontend Preparation Status

### ✅ UI Structure Prepared

The following page directories exist but need implementation:

```
apps/web/src/(app)/(auth)/
├── login/          # Main login page
├── check-email/    # Email sent confirmation
├── verify/         # Magic link verification (legacy?)
├── verify-2fa/     # Two-factor authentication
├── complete-profile/ # Profile completion after OAuth
├── welcome/        # Welcome page after registration
└── callback/       # OAuth callback handler (NEW - needs to be created)
```

### ❌ Missing Implementation

1. **API Client** - No HTTP client for backend communication
2. **Auth API Functions** - No auth-specific API methods
3. **Auth Context** - No global authentication state
4. **Auth Hooks** - No React hooks for auth operations
5. **Token Storage** - No access token management
6. **Route Guards** - No protected route logic
7. **Callback Page** - OAuth callback handler missing

---

## Integration Architecture

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   UI Pages   │  │  Auth Context│  │  API Client  │            │
│  │              │→ │              │→ │              │            │
│  │  - Login     │  │  - User State│  │  - HTTP Calls│            │
│  │  - Callback  │  │  - Tokens    │  │  - Error Hand│            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTP/HTTPS
                       │ Cookies (refresh_token)
                       │ Headers (access_token)
                       ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend (NestJS API)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Auth Contr.  │  │ Auth Service │  │ Token Service│            │
│  │              │→ │              │→ │              │            │
│  │ - QuickSign  │  │ - Validation │  │ - JWT        │            │
│  │ - OAuth      │  │ - Session    │  │ - Refresh    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ↓
              ┌──────────────────┐
              │   PostgreSQL     │
              │   + Redis        │
              └──────────────────┘
```

### Data Flow: QuickSign Login

```
1. User enters email
   ↓
2. Frontend: POST /auth/quicksign/request
   ↓
3. Backend: Send email with magic link
   ↓
4. User clicks link in email
   ↓
5. Backend: GET /auth/quicksign/verify/:token
   ↓
6. Backend: Create session → Generate OAuth code
   ↓
7. Backend: Redirect to /auth/callback?code=XXX
   ↓
8. Frontend: Extract code from URL
   ↓
9. Frontend: POST /auth/oauth/exchange { code }
   ↓
10. Backend: Return access_token, set refresh_token cookie
    ↓
11. Frontend: Store access_token in memory
    ↓
12. Frontend: Redirect to dashboard
```

### Data Flow: Google OAuth Login

```
1. User clicks "Login with Google"
   ↓
2. Frontend: Redirect to /auth/google
   ↓
3. Backend: Redirect to Google OAuth consent
   ↓
4. User authorizes on Google
   ↓
5. Google: Redirect to /auth/google/callback
   ↓
6. Backend: Process OAuth → Create session → Generate code
   ↓
7. Backend: Redirect to /auth/callback?code=XXX
   ↓
8. Frontend: Extract code from URL
   ↓
9. Frontend: POST /auth/oauth/exchange { code }
   ↓
10. Backend: Return access_token, set refresh_token cookie
    ↓
11. Frontend: Store access_token in memory
    ↓
12. Frontend: Check needsProfileCompletion
    ↓
13. If true → Redirect to /complete-profile
    If false → Redirect to dashboard
```

---

## Implementation Phases

### Phase 1: API Client Infrastructure (Priority: High)

**Objective:** Create base API client with error handling and token management

**Tasks:**
1. Create `apps/web/src/lib/api/client.ts`
   - Base HTTP client using Fetch API
   - Automatic token injection in headers
   - Cookie support (credentials: 'include')
   - Error handling and transformation
   - Request/response interceptors

2. Create `apps/web/src/lib/api/errors.ts`
   - ApiError class
   - Error type checking methods
   - User-friendly error messages

3. Create `apps/web/src/lib/api/types.ts`
   - API response types
   - Request/response interfaces
   - Pagination types

4. Create `apps/web/src/lib/api/config.ts`
   - API base URL configuration
   - Environment variable management
   - API versioning

**Deliverables:**
- ✅ Working API client
- ✅ Error handling system
- ✅ Type definitions

**Estimated Time:** 2-3 hours

---

### Phase 2: Authentication API & Types (Priority: High)

**Objective:** Create auth-specific API functions matching backend endpoints

**Tasks:**
1. Create `apps/web/src/lib/api/auth.ts`
   - `quickSignRequest(email: string)`
   - `exchangeOAuthCode(code: string)`
   - `getGoogleAuthUrl()`
   - `getCurrentUser()`
   - `logout()`
   - `refreshAccessToken()`

2. Create shared types (if needed in `packages/types`)
   - User type
   - Auth response types
   - QuickSign response types

**Deliverables:**
- ✅ Complete auth API module
- ✅ Type-safe auth functions

**Estimated Time:** 2-3 hours

---

### Phase 3: Authentication Context & Hooks (Priority: High)

**Objective:** Global auth state management with React Context

**Tasks:**
1. Create `apps/web/src/lib/context/AuthContext.tsx`
   - User state management
   - Access token storage (in-memory or localStorage)
   - Loading states
   - Login/logout functions
   - Auto-refresh token logic

2. Create `apps/web/src/lib/hooks/useAuth.ts`
   - Convenient hook for accessing auth context
   - Auth state helpers (isAuthenticated, isLoading, etc.)

3. Create `apps/web/src/lib/hooks/useToken.ts`
   - Token storage/retrieval
   - Token refresh logic
   - Token expiration checking

4. Wrap app with AuthProvider in root layout

**Deliverables:**
- ✅ Working auth context
- ✅ React hooks for auth
- ✅ Token management system

**Estimated Time:** 2-3 hours

---

### Phase 4: QuickSign Integration (Priority: High)

**Objective:** Connect magic link login UI to backend

**Tasks:**
1. Implement `apps/web/src/(app)/(auth)/login/page.tsx`
   - Email input form
   - Submit handler → call `quickSignRequest`
   - Loading states
   - Error handling
   - Redirect to `/check-email` on success

2. Implement `apps/web/src/(app)/(auth)/check-email/page.tsx`
   - Display success message
   - Show email that received the link
   - Option to resend link
   - Instructions for user

3. Test complete QuickSign flow end-to-end

**Deliverables:**
- ✅ Working QuickSign login flow
- ✅ User-friendly UI feedback

**Estimated Time:** 2-3 hours

---

### Phase 5: Google OAuth Integration (Priority: High)

**Objective:** Connect Google login button to OAuth flow

**Tasks:**
1. Implement Google login button in login page
   - Trigger redirect to `/auth/google` (backend endpoint)
   - Styling and UX

2. Create `apps/web/src/(app)/(auth)/callback/page.tsx`
   - Extract `code` from URL query params
   - Call `exchangeOAuthCode(code)`
   - Handle errors (expired code, invalid code, etc.)
   - Store access token in auth context
   - Check `needsProfileCompletion` flag
   - Redirect accordingly:
     - If `needsProfileCompletion` → `/complete-profile`
     - Else → `/` or `/dashboard`

3. Handle edge cases:
   - Missing code parameter
   - Expired code
   - Network errors
   - Backend errors

**Deliverables:**
- ✅ Working Google OAuth flow
- ✅ Callback handler
- ✅ Proper redirects

**Estimated Time:** 2-3 hours

---

### Phase 6: Route Protection & Guards (Priority: Medium)

**Objective:** Protect authenticated routes and handle unauthorized access

**Tasks:**
1. Create `apps/web/src/components/auth/AuthGuard.tsx`
   - HOC or component wrapper
   - Check auth state
   - Redirect to login if not authenticated
   - Show loading state during auth check

2. Create `apps/web/src/components/auth/GuestGuard.tsx`
   - Redirect authenticated users away from login page
   - Prevent logged-in users from accessing auth pages

3. Apply guards to routes:
   - Protected routes (dashboard, profile, etc.)
   - Auth routes (login, register) - should redirect if already logged in

4. Create middleware (Next.js middleware) if needed for server-side protection

**Deliverables:**
- ✅ Route protection system
- ✅ Proper redirects

**Estimated Time:** 1-2 hours

---

### Phase 7: Token Refresh & Session Management (Priority: Medium)

**Objective:** Implement automatic token refresh and session persistence

**Tasks:**
1. Implement token refresh interceptor in API client
   - Detect 401 responses
   - Attempt token refresh
   - Retry original request

2. Implement session persistence
   - Persist access token across page reloads
   - Load user data on app initialization
   - Handle token expiration gracefully

3. Implement logout functionality
   - Clear access token
   - Call backend logout endpoint
   - Clear refresh token cookie (handled by backend)
   - Redirect to login

**Deliverables:**
- ✅ Automatic token refresh
- ✅ Session persistence
- ✅ Logout functionality

**Estimated Time:** 2-3 hours

---

### Phase 8: Error Handling & User Feedback (Priority: Medium)

**Objective:** Comprehensive error handling and user-friendly feedback

**Tasks:**
1. Create error display components
   - Toast notifications
   - Inline error messages
   - Error boundary for auth errors

2. Implement error handling for:
   - Network errors
   - API errors (4xx, 5xx)
   - Token expiration
   - Invalid credentials
   - Rate limiting

3. Add loading states throughout auth flow
   - Button loading states
   - Page loading states
   - Disable forms during submission

**Deliverables:**
- ✅ Comprehensive error handling
- ✅ User-friendly error messages

**Estimated Time:** 2-3 hours

---

## Technical Specifications

### API Client Implementation

**File:** `apps/web/src/lib/api/client.ts`

```typescript
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add access token if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Important: Send cookies (refresh_token)
    };

    try {
      const response = await fetch(url, config);

      // Handle token refresh on 401
      if (response.status === 401 && !endpoint.includes('/auth/oauth/exchange')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token
          return this.request<T>(endpoint, options);
        }
        throw new ApiError('Unauthorized', 401);
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
      return (data?.data ?? data) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, { originalError: error });
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setAccessToken(data.access_token || data.data?.access_token);
      return true;
    } catch {
      return false;
    }
  }

  // HTTP method wrappers
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
```

### Auth API Implementation

**File:** `apps/web/src/lib/api/auth.ts`

```typescript
import { apiClient } from './client';

export interface QuickSignRequestResponse {
  success: boolean;
  message: string;
  type: 'LOGIN' | 'SIGNUP';
  expiresIn: number;
}

export interface OAuthExchangeResponse {
  access_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string | null;
  };
  needsProfileCompletion: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export const authApi = {
  /**
   * Request QuickSign (magic link) email
   */
  async quickSignRequest(email: string): Promise<QuickSignRequestResponse> {
    return apiClient.post('/auth/quicksign/request', { email });
  },

  /**
   * Exchange OAuth code for access token
   */
  async exchangeOAuthCode(code: string): Promise<OAuthExchangeResponse> {
    return apiClient.post('/auth/oauth/exchange', { code });
  },

  /**
   * Get Google OAuth URL (redirect to this)
   */
  getGoogleAuthUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}/auth/google`;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get('/auth/me');
  },

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },
};
```

### Auth Context Implementation

**File:** `apps/web/src/lib/context/AuthContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import type { User, OAuthExchangeResponse } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load access token from storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        setAccessToken(token);
        apiClient.setAccessToken(token);
      }
    }
  }, []);

  // Load user on mount if token exists
  useEffect(() => {
    if (accessToken) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const loadUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setAccessToken(null);
      apiClient.setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (code: string) => {
    try {
      const response: OAuthExchangeResponse = await authApi.exchangeOAuthCode(code);
      
      // Store access token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
      }
      setAccessToken(response.access_token);
      apiClient.setAccessToken(response.access_token);

      // Set user
      setUser(response.user);

      // Handle profile completion redirect (will be done in callback page)
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setAccessToken(null);
      apiClient.setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
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

## File Structure

### Complete File Structure

```
apps/web/src/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Base API client
│   │   ├── auth.ts            # Auth API functions
│   │   ├── errors.ts          # Error handling
│   │   ├── types.ts           # API types
│   │   └── config.ts          # API configuration
│   ├── context/
│   │   └── AuthContext.tsx    # Auth context provider
│   └── hooks/
│       ├── useAuth.ts         # Auth hook
│       └── useToken.ts        # Token management hook
├── components/
│   └── auth/
│       ├── AuthGuard.tsx      # Route protection
│       ├── GuestGuard.tsx     # Guest route protection
│       └── LoadingSpinner.tsx # Loading component
└── (app)/
    └── (auth)/
        ├── login/
        │   └── page.tsx       # Login page
        ├── check-email/
        │   └── page.tsx       # Email sent confirmation
        ├── callback/
        │   └── page.tsx       # OAuth callback handler
        ├── complete-profile/
        │   └── page.tsx       # Profile completion
        └── verify-2fa/
            └── page.tsx       # 2FA verification
```

---

## API Endpoints Reference

### QuickSign Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/auth/quicksign/request` | Request magic link | `{ email: string }` | `{ success: boolean, message: string, type: 'LOGIN'\|'SIGNUP', expiresIn: number }` |
| GET | `/auth/quicksign/verify/:token` | Verify magic link | - | Redirects to `/auth/callback?code=XXX` |
| POST | `/auth/quicksign/resend` | Resend magic link | `{ email: string }` | `{ success: boolean, message: string }` |

### OAuth Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/auth/google` | Initiate Google OAuth | - | Redirects to Google |
| GET | `/auth/google/callback` | Google OAuth callback | - | Redirects to `/auth/callback?code=XXX` |
| POST | `/auth/oauth/exchange` | Exchange code for token | `{ code: string }` | `{ access_token: string, expires_in: number, user: User, needsProfileCompletion: boolean }` |

### Session Endpoints

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| GET | `/auth/me` | Get current user | Yes | `User` |
| POST | `/auth/logout` | Logout session | Yes | `{ message: string }` |
| POST | `/auth/refresh` | Refresh access token | Yes (via cookie) | `{ access_token: string }` |

---

## Authentication Flows

### Flow 1: QuickSign Login

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  User    │                    │ Frontend │                    │ Backend  │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │ 1. Enter email                │                               │
     ├──────────────────────────────►│                               │
     │                               │ 2. POST /auth/quicksign/request│
     │                               ├──────────────────────────────►│
     │                               │                               │ 3. Send email
     │                               │ 4. { success: true }          │
     │                               │◄──────────────────────────────┤
     │                               │                               │
     │ 5. Click link in email        │                               │
     │    (GET /auth/quicksign/      │                               │
     │     verify/:token)            │                               │
     │                               │                               │
     │                               │                               │ 6. Verify token
     │                               │                               │    Create session
     │                               │                               │    Generate code
     │                               │                               │
     │ 7. Redirect to                │                               │
     │    /auth/callback?code=XXX    │                               │
     │                               │                               │
     │                               │ 8. Extract code               │
     │                               │                               │
     │                               │ 9. POST /auth/oauth/exchange  │
     │                               ├──────────────────────────────►│
     │                               │                               │ 10. Return tokens
     │                               │ 11. { access_token, user }    │
     │                               │◄──────────────────────────────┤
     │                               │                               │
     │                               │ 12. Store token               │
     │                               │     Set user state            │
     │                               │                               │
     │ 13. Redirect to dashboard     │                               │
     │◄──────────────────────────────┤                               │
```

### Flow 2: Google OAuth Login

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  User    │                    │ Frontend │                    │ Backend  │                    │  Google  │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │                               │
     │ 1. Click "Login with Google"  │                               │                               │
     ├──────────────────────────────►│                               │                               │
     │                               │ 2. Redirect to /auth/google   │                               │
     │                               ├──────────────────────────────►│                               │
     │                               │                               │ 3. Redirect to Google OAuth    │
     │                               │                               ├──────────────────────────────►│
     │                               │                               │                               │
     │ 4. Authorize on Google        │                               │                               │
     ├──────────────────────────────────────────────────────────────────────────────────────────────►│
     │                               │                               │                               │
     │                               │                               │ 5. Callback with code          │
     │                               │                               │◄──────────────────────────────┤
     │                               │                               │                               │
     │                               │                               │ 6. Exchange code for user info │
     │                               │                               │    Create session              │
     │                               │                               │    Generate OAuth code         │
     │                               │                               │                               │
     │                               │ 7. Redirect to                │                               │
     │                               │    /auth/callback?code=XXX    │                               │
     │                               │◄──────────────────────────────┤                               │
     │                               │                               │                               │
     │ 8. Page loads with code       │                               │                               │
     ├──────────────────────────────►│                               │                               │
     │                               │ 9. Extract code               │                               │
     │                               │                               │                               │
     │                               │ 10. POST /auth/oauth/exchange │                               │
     │                               ├──────────────────────────────►│                               │
     │                               │                               │ 11. Return tokens              │
     │                               │ 12. { access_token, user,     │                               │
     │                               │      needsProfileCompletion } │                               │
     │                               │◄──────────────────────────────┤                               │
     │                               │                               │                               │
     │                               │ 13. Store token               │                               │
     │                               │     Check needsProfile...     │                               │
     │                               │                               │                               │
     │ 14a. If needs profile →       │                               │                               │
     │      /complete-profile        │                               │                               │
     │ 14b. Else → /dashboard        │                               │                               │
     │◄──────────────────────────────┤                               │                               │
```

---

## State Management

### Access Token Storage

**Option 1: localStorage (Recommended for SPA)**
- ✅ Persists across page reloads
- ✅ Available in all tabs
- ❌ Vulnerable to XSS (but mitigated by httpOnly refresh token)
- ✅ Simple implementation

**Option 2: In-Memory (More Secure)**
- ✅ Not vulnerable to XSS
- ❌ Lost on page reload (requires re-authentication)
- ❌ Not shared across tabs

**Recommendation:** Use **localStorage** for access token since:
1. Refresh token is in httpOnly cookie (more secure)
2. Access token is short-lived (15 minutes)
3. Better UX (no re-authentication on refresh)

### User State Management

- **Storage:** React Context + State
- **Persistence:** Load from `/auth/me` on app initialization
- **Sync:** Refresh on token update, logout on 401

---

## Error Handling

### Error Types

1. **Network Errors**
   - No internet connection
   - Backend unavailable
   - Timeout

2. **API Errors**
   - 400: Bad Request (validation errors)
   - 401: Unauthorized (invalid/expired token)
   - 403: Forbidden (account locked)
   - 404: Not Found
   - 429: Too Many Requests (rate limiting)
   - 500: Server Error

3. **OAuth Errors**
   - Invalid/expired code
   - Code already used
   - OAuth cancellation

### Error Handling Strategy

```typescript
// Example error handling in callback page
try {
  const response = await login(code);
  if (response.needsProfileCompletion) {
    router.push('/complete-profile');
  } else {
    router.push('/dashboard');
  }
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      // Invalid/expired code
      setError('This login link has expired. Please request a new one.');
    } else if (error.statusCode === 401) {
      // Unauthorized
      setError('Authentication failed. Please try again.');
    } else {
      setError(error.message);
    }
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
}
```

---

## Testing Strategy

### Unit Tests

1. **API Client**
   - Request/response transformation
   - Error handling
   - Token injection

2. **Auth Context**
   - State updates
   - Login/logout functions
   - Token management

3. **Auth API**
   - Endpoint calls
   - Request/response parsing

### Integration Tests

1. **QuickSign Flow**
   - Request magic link
   - Verify callback handling
   - Token exchange

2. **Google OAuth Flow**
   - Redirect to Google
   - Callback handling
   - Token exchange

3. **Session Management**
   - Token refresh
   - User data loading
   - Logout

### E2E Tests (Optional)

1. Complete login flow
2. Protected route access
3. Logout flow

---

## Security Considerations

### ✅ Security Best Practices

1. **Tokens**
   - Access token: Short-lived (15 min), stored in localStorage
   - Refresh token: Long-lived (7 days), httpOnly cookie
   - Automatic token refresh on expiration

2. **HTTPS**
   - Required in production
   - Prevents man-in-the-middle attacks

3. **CORS**
   - Restricted to specific origins
   - Credentials enabled for cookies

4. **Rate Limiting**
   - Backend enforces rate limits
   - Frontend should handle 429 errors gracefully

5. **XSS Protection**
   - Refresh token in httpOnly cookie
   - Access token in localStorage (acceptable risk)
   - Input sanitization

6. **CSRF Protection**
   - SameSite cookies
   - CORS restrictions

### ⚠️ Security Warnings

1. **Never expose refresh tokens to client-side JavaScript**
   - Already handled by httpOnly cookies ✅

2. **Validate all user input**
   - Both frontend and backend validation ✅

3. **Handle token expiration gracefully**
   - Automatic refresh implemented ✅

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
  - [ ] `NEXT_PUBLIC_API_URL` set correctly
  - [ ] `FRONTEND_URL` configured in backend
- [ ] API client configured for production
- [ ] CORS settings verified
- [ ] HTTPS enabled
- [ ] Error handling tested
- [ ] Loading states implemented

### Deployment

- [ ] Build frontend: `npm run build`
- [ ] Test production build locally
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Verify CORS settings
- [ ] Test login flows in production

### Post-Deployment

- [ ] Monitor error logs
- [ ] Test authentication flows
- [ ] Verify token refresh works
- [ ] Check session persistence
- [ ] Monitor API rate limits

---

## Environment Variables

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_VERSION=v1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)

```env
# Frontend URL for CORS and OAuth redirects
FRONTEND_URL=http://localhost:3000

# API Configuration
PORT=3001
NODE_ENV=development

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
```

---

## Next Steps

After reviewing this plan:

1. **Approve the plan** and implementation approach
2. **Set up environment variables** for both frontend and backend
3. **Begin Phase 1** - API Client Infrastructure
4. **Implement sequentially** - Follow phases in order
5. **Test each phase** before moving to the next
6. **Deploy incrementally** - Test in staging before production

---

## Questions & Clarifications

If you have any questions about this plan or need clarification on any aspect, please review the following documents:

- `docs-v2.1/BACKEND_FRONTEND_INTEGRATION_GUIDE.md` - General integration guide
- `docs-v2.1/LOGIN_AUTHENTICATION_COMPREHENSIVE_REVIEW.md` - Backend auth documentation
- `docs/03-technical/SESSION_MANAGEMENT.md` - Session management details

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** January 15, 2026  
**Author:** Development Team  
**Review Status:** Pending Approval

