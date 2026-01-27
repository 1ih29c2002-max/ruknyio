# Backend-Frontend Integration Guide

**Project:** Rukny.io  
**Date:** January 15, 2026  
**Version:** 2.1  

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Communication Strategy](#communication-strategy)
4. [Environment Configuration](#environment-configuration)
5. [API Client Setup](#api-client-setup)
6. [Authentication & Session Management](#authentication--session-management)
7. [Type Safety & Shared Types](#type-safety--shared-types)
8. [Error Handling](#error-handling)
9. [CORS Configuration](#cors-configuration)
10. [Development Workflow](#development-workflow)
11. [Production Considerations](#production-considerations)
12. [Security Best Practices](#security-best-practices)
13. [Testing Strategy](#testing-strategy)
14. [Troubleshooting](#troubleshooting)

---

## Overview

This document outlines the complete strategy for integrating the **NestJS backend** (`apps/api`) with the **Next.js frontend** (`apps/web`) in the Rukny.io monorepo. The integration ensures seamless communication, type safety, secure authentication, and optimal performance.

### Current Stack

- **Backend:** NestJS (Node.js framework) running on port `3001`
- **Frontend:** Next.js 16 (React 19) running on port `3000`
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis for sessions and caching
- **Type Sharing:** Shared types package (`packages/types`)
- **Authentication:** JWT-based with httpOnly cookies

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Next.js App (Port 3000)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │ UI         │  │ API Client │  │ Auth       │   │   │
│  │  │ Components │→ │ (fetch/    │→ │ Context    │   │   │
│  │  │            │  │ axios)     │  │            │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS Requests
                       │ (with Cookies)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               NestJS API (Port 3001)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │ Auth     │  │ Business │  │ Guards/  │         │   │
│  │  │ Module   │→ │ Logic    │→ │ Pipes    │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  │         ↓              ↓                            │   │
│  │  ┌──────────────────────────────────────┐          │   │
│  │  │     Prisma ORM                       │          │   │
│  │  └──────────────────────────────────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
         ┌──────────────────────────┬──────────────────┐
         ↓                          ↓                  ↓
┌─────────────────┐   ┌──────────────────┐   ┌─────────────┐
│   PostgreSQL    │   │      Redis       │   │   AWS S3    │
│   Database      │   │   (Sessions)     │   │   (Files)   │
└─────────────────┘   └──────────────────┘   └─────────────┘
```

### Data Flow

1. **User Action** → UI component in Next.js
2. **API Call** → API client makes HTTP request
3. **Authentication** → JWT token sent in httpOnly cookie
4. **Backend Processing** → NestJS validates, processes request
5. **Database Query** → Prisma interacts with PostgreSQL
6. **Response** → JSON response with typed data
7. **UI Update** → React components re-render with new data

---

## Communication Strategy

### API Request Methods

We'll use **native Fetch API** with custom wrappers for the following reasons:

- ✅ Built into Next.js (no extra dependencies)
- ✅ Supports streaming and Server Components
- ✅ Automatic request deduplication in Next.js 13+
- ✅ Better TypeScript support with generics

### API Endpoints Structure

**Backend API Base URL:**
- Development: `http://localhost:3001`
- Production: `https://api.rukny.io`

**API Versioning:** `/api/v1/`

**Example Endpoints:**
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/auth/me
POST   /api/v1/auth/logout

GET    /api/v1/users/profile
PATCH  /api/v1/users/profile
GET    /api/v1/users/:id

GET    /api/v1/stores
POST   /api/v1/stores
GET    /api/v1/stores/:id
PATCH  /api/v1/stores/:id
DELETE /api/v1/stores/:id

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id

GET    /api/v1/events
POST   /api/v1/events
GET    /api/v1/events/:id
PATCH  /api/v1/events/:id
DELETE /api/v1/events/:id
```

---

## Environment Configuration

### Backend Environment (.env)

**File:** `apps/api/.env`

```env
# Application
NODE_ENV=development
PORT=3001

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rukny_io?schema=public&connection_limit=10&pool_timeout=20

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=
AWS_REGION=us-east-1
```

### Frontend Environment (.env.local)

**File:** `apps/web/.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_VERSION=v1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Rukny.io

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true

# OAuth (for client-side redirects)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Environment Variable Naming

**Frontend (Next.js):**
- `NEXT_PUBLIC_*` → Exposed to browser (public)
- Without prefix → Server-side only (private)

**Backend (NestJS):**
- All environment variables are private by default
- Never expose secrets to frontend

---

## API Client Setup

### Directory Structure

```
apps/web/src/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Base API client
│   │   ├── config.ts          # API configuration
│   │   ├── types.ts           # Request/Response types
│   │   ├── errors.ts          # Error handling
│   │   ├── auth.ts            # Auth endpoints
│   │   ├── users.ts           # User endpoints
│   │   ├── stores.ts          # Store endpoints
│   │   ├── products.ts        # Product endpoints
│   │   ├── events.ts          # Event endpoints
│   │   └── index.ts           # Export all
│   ├── hooks/
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useUser.ts         # User data hook
│   │   ├── useApi.ts          # Generic API hook
│   │   └── index.ts
│   └── utils/
│       ├── cookies.ts         # Cookie helpers
│       └── validation.ts      # Client-side validation
```

### Base API Client (client.ts)

```typescript
// apps/web/src/lib/api/client.ts
import { ApiError } from './errors';
import type { ApiResponse, ApiErrorResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: Send cookies
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError('Server error', response.status);
        }
        return {} as T;
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiError(
          responseData.message || 'Request failed',
          response.status,
          responseData
        );
      }

      // Unwrap the standard API response format
      // Backend returns: { data: T, message?, statusCode }
      // We return just the data property
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as T;
      }

      // Fallback for endpoints that don't follow the standard format
      return responseData as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'Network error or server unavailable',
        0,
        { originalError: error }
      );
    }
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
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
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

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * File upload request
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      // Don't set Content-Type for FormData - browser sets it with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Upload failed',
        response.status,
        data
      );
    }

    return data as T;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

### Error Handling (errors.ts)

```typescript
// apps/web/src/lib/api/errors.ts

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

### API Types (types.ts)

```typescript
// apps/web/src/lib/api/types.ts

/**
 * Standard API Response Wrapper
 * IMPORTANT: ALL backend endpoints return data in this shape
 * The ApiClient automatically unwraps and returns just the data property
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### API Response Contract

**CRITICAL: Standardized Response Shape**

All backend endpoints MUST return responses in this format:

```typescript
{
  "data": T,           // The actual payload
  "message": string,   // Optional success message
  "statusCode": 200    // HTTP status code
}
```

The `ApiClient` automatically unwraps this and returns only the `data` property to calling code. This means:

```typescript
// Backend returns:
{ data: { id: '1', name: 'John' }, statusCode: 200 }

// Frontend receives (after unwrapping):
{ id: '1', name: 'John' }
```

**Backend Implementation (NestJS):**

```typescript
// apps/api/src/core/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  message?: string;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: data?.message || undefined,
      })),
    );
  }
}

// Apply globally in main.ts
app.useGlobalInterceptors(new TransformInterceptor());
```

---

## Authentication & Session Management

### Authentication Flow

```
┌─────────────┐                                  ┌─────────────┐
│   Browser   │                                  │  NestJS API │
└──────┬──────┘                                  └──────┬──────┘
       │                                                │
       │  1. POST /auth/login                          │
       │  { email, password }                          │
       ├──────────────────────────────────────────────►│
       │                                                │
       │                                  2. Validate  │
       │                                  credentials  │
       │                                                │
       │  3. Set-Cookie: token=JWT                     │
       │     httpOnly, secure, sameSite                │
       │◄──────────────────────────────────────────────┤
       │                                                │
       │  4. GET /auth/me                              │
       │  Cookie: token=JWT                            │
       ├──────────────────────────────────────────────►│
       │                                                │
       │                                  5. Verify JWT│
       │                                  from cookie  │
       │                                                │
       │  6. { user: {...} }                           │
       │◄──────────────────────────────────────────────┤
       │                                                │
```

### Backend Authentication Setup

**Key Points:**
- JWT tokens stored in **httpOnly cookies** (not localStorage)
- Cookies sent automatically with every request
- `credentials: 'include'` required in frontend fetch
- CSRF protection via `SameSite=Lax` cookie attribute

### CSRF Protection Strategy

**Current Approach: SameSite Cookies**

We rely on `SameSite=Lax` cookies as our primary CSRF defense:

```typescript
// apps/api/src/modules/auth/auth.service.ts
response.cookie('token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Why SameSite=Lax is Sufficient:**
- ✅ Prevents cookies from being sent on cross-site POST requests
- ✅ Combined with CORS restrictions, provides adequate protection
- ✅ Simpler implementation than CSRF tokens
- ✅ No need for token generation/validation on each request

**When to Add CSRF Tokens:**

For highly sensitive operations (payments, account deletion), consider double-submit cookie pattern:

```typescript
// Backend: Set CSRF token
response.cookie('csrf-token', csrfToken, {
  httpOnly: false, // Needs to be readable by JS
  sameSite: 'strict',
});

// Frontend: Send token in header
fetch(url, {
  headers: {
    'X-CSRF-Token': getCookie('csrf-token'),
  },
});

// Backend: Validate token
@UseGuards(CsrfGuard)
@Post('sensitive-operation')
async sensitiveOperation() {
  // Implementation
}
```

**Recommendation for Rukny.io:**
- **Start with SameSite=Lax** (current approach)
- **Add CSRF tokens** when implementing:
  - Payment processing
  - Subscription changes
  - Account deletion
  - Admin actions

### Session & Token Strategy

**Two-Token System (Access + Refresh)**

```typescript
// Access Token (Short-lived)
response.cookie('access_token', accessJwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
});

// Refresh Token (Long-lived)
response.cookie('refresh_token', refreshJwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Stricter for refresh
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
});
```

**Token Rotation on Refresh:**

```typescript
// apps/api/src/modules/auth/auth.service.ts
async refreshTokens(oldRefreshToken: string) {
  // 1. Verify old refresh token
  const payload = this.jwtService.verify(oldRefreshToken);
  
  // 2. Check if token is blacklisted (revoked)
  const isBlacklisted = await this.redis.get(`blacklist:${oldRefreshToken}`);
  if (isBlacklisted) {
    throw new UnauthorizedException('Token revoked');
  }
  
  // 3. Generate new tokens
  const newAccessToken = this.generateAccessToken(payload);
  const newRefreshToken = this.generateRefreshToken(payload);
  
  // 4. Blacklist old refresh token (one-time use)
  await this.redis.setex(
    `blacklist:${oldRefreshToken}`,
    7 * 24 * 60 * 60, // 7 days TTL
    '1'
  );
  
  // 5. Store new refresh token hash (for logout everywhere)
  await this.redis.setex(
    `refresh:${payload.userId}:${newRefreshToken}`,
    7 * 24 * 60 * 60,
    '1'
  );
  
  return { newAccessToken, newRefreshToken };
}
```

**Logout & Token Revocation:**

```typescript
// Single device logout
async logout(refreshToken: string) {
  await this.redis.setex(`blacklist:${refreshToken}`, 7 * 24 * 60 * 60, '1');
}

// Logout all devices (revoke all user's tokens)
async logoutAllDevices(userId: string) {
  const pattern = `refresh:${userId}:*`;
  const keys = await this.redis.keys(pattern);
  
  for (const key of keys) {
    const token = key.split(':')[2];
    await this.redis.setex(`blacklist:${token}`, 7 * 24 * 60 * 60, '1');
  }
  
  await this.redis.del(...keys);
}
```

**Frontend Token Refresh Flow:**

```typescript
// apps/web/src/lib/api/client.ts
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, config);
    
    // If 401 and not already refreshing, try refresh
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      const refreshed = await this.refreshToken();
      
      if (refreshed) {
        // Retry original request
        return this.request<T>(endpoint, options);
      }
    }
    
    // ... rest of implementation
  } catch (error) {
    throw error;
  }
}

private async refreshToken(): Promise<boolean> {
  try {
    await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return true;
  } catch {
    return false;
  }
}
```

### Frontend Auth Service (auth.ts)

```typescript
// apps/web/src/lib/api/auth.ts
import { apiClient } from './client';
import type { User } from '@rukny/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'MERCHANT';
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  /**
   * Get current user
   */
  async me(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh');
  },

  /**
   * OAuth - Google login
   */
  getGoogleAuthUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}/auth/google`;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, password });
  },
};
```

### Auth Context Provider

```typescript
// apps/web/src/lib/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import type { User } from '@rukny/types';
import { ApiError } from '@/lib/api/errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
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

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password });
    setUser(response.user);
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function refreshUser() {
    await loadUser();
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser }}
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

## Type Safety & Shared Types

### Shared Types Package

The `packages/types` directory contains shared TypeScript interfaces used by both frontend and backend.

**Structure:**
```
packages/types/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           # Main export
    ├── user.ts            # User types
    ├── store.ts           # Store types
    ├── event.ts           # Event types
    ├── form.ts            # Form types

/**
 * IMPORTANT: Date fields are strings in API responses (JSON)
 * Use string type for API-facing interfaces
 * Convert to Date objects in your components if needed
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImageUrl?: string;
  createdAt: string;  // ISO 8601 string from API
  updatedAt: string;  // ISO 8601 string from API
}

export enum UserRole {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  address?: string;
}
```

### Date Handling Strategy

**Problem:** JSON doesn't support Date objects - they're serialized as strings.

**Solution:** Use `string` type in API-facing interfaces, convert in components:

```typescript
// Helper utility
// apps/web/src/lib/utils/dates.ts
export function parseApiDate(dateString: string): Date {
  return new Date(dateString);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

// Usage in components
function UserCard({ user }: { user: User }) {
  const createdDate = parseApiDate(user.createdAt);
  
  return (
    <div>
      <p>Joined: {formatDate(user.createdAt)}</p>
    </div>
  );
}
```

**Alternative: Runtime Validation with Zod**

For stricter type safety and automatic parsing:

```typescript
// packages/types/src/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['USER', 'MERCHANT', 'ADMIN']),
  profileImageUrl: z.string().optional(),
  createdAt: z.string().transform(str => new Date(str)),
  updatedAt: z.string().transform(str => new Date(str)),
});

export type User = z.infer<typeof UserSchema>;

// In API client
const userData = await apiClient.get('/users/me');
const user = UserSchema.parse(userData); // Validates + transforms dates MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  address?: string;
}
```

### Using Shared Types

**Backend (NestJS):**
```typescript
import { User, UserRole } from '@rukny/types';

@Injectable()
export class UsersService {
  aNext.js Server-Side vs Client-Side Fetching

### Client-Side Fetching (Browser)

Use the API client as documented above for client components:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    apiClient.get('/users/me').then(setUser);
  }, []);
  
  return <div>{user?.name}</div>;
}
```

### Server-Side Fetching (Server Components & Route Handlers)

**Problem:** Server components don't have access to browser cookies automatically.

**Solution 1: Server-Side API Client with Cookie Forwarding**

```typescript
// apps/web/src/lib/api/server-client.ts
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

export async function serverApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader, // Forward cookies from client
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data as T; // Unwrap standard response
}
```

**Usage in Server Component:**

```typescript
// apps/web/src/app/dashboard/page.tsx
import { serverApiClient } from '@/lib/api/server-client';
import type { User } from '@rukny/types';

export default async function DashboardPage() {
  // This runs on the server, not in the browser
  const user = await serverApiClient<User>('/users/me');
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

**Solution 2: BFF Pattern with Route Handlers**

Create API routes in Next.js that proxy to your backend:

```typescript
// apps/web/src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  const response = await fetch('http://localhost:3001/api/v1/users/me', {
    headers: {
      'Cookie': cookieHeader,
    },
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

Then from client components:

```typescript
'use client';

// Call Next.js API route instead of backend directly
const user = await fetch('/api/users/me').then(r => r.json());
```

**Recommendation for Rukny.io:**

- ✅ **Use Client-Side Fetching** for most interactive features
- ✅ **Use Server-Side Fetching** for:
  - Initial page data (SSR)
  - SEO-critical content
  - Protected pages that need auth before render
- ✅ **Use BFF Pattern** when you need:
  - Additional server-side logic
  - Aggregating multiple backend calls
  - Transforming data before sending to client

### Environment Variables for Server vs Client

```env
# apps/web/.env.local

# Client-side (exposed to browser)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server-side only (not exposed to browser)
API_URL=http://localhost:3001
API_INTERNAL_URL=http://api:3001  # For Docker container-to-container

# Use internal URL on server for better performance
```

```typescript
// apps/web/src/lib/api/config.ts
export const API_CONFIG = {
  // Client-side uses public URL
  clientUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // Server-side uses internal URL (faster in production)
  serverUrl: process.env.API_INTERNAL_URL || 
             process.env.API_URL || 
             'http://localhost:3001',
};
```

## sync findOne(id: string): Promise<User> {
    // Implementation
  }
}
```

**Frontend (Next.js):**
```typescript
import { User, UserRole } from '@rukny/types';

export function UserCard({ user }: { user: User }) {
  // Implementation
}
```

### Type Generation from Prisma

The backend uses Prisma, which generates types automatically. We can extend these:

```typescript
// packages/types/src/user.ts
import type { User as PrismaUser } from '@prisma/client';

// Re-export Prisma type with modifications
export type User = Omit<PrismaUser, 'password' | 'hashedPassword'>;
```

---

## Error Handling

### Global Error Boundary

```typescript
// apps/web/src/components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }

  render() {
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',      // For CSRF protection (if implemented)
    'X-Request-ID',      // For request tracing
  ],
  exposedHeaders: ['Set-Cookie', 'X-Request-ID'],
  maxAge: 3600, // Cache preflight for 1 hour
});
```

### Environment-Specific CORS

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- CORS: Allow localhost origins

**Production:**
- Frontend: `https://rukny.io`
- Backend: `https://api.rukny.io`
- CORS: Strict origin matching

### Dynamic CORS for Multiple Environments

```typescript
// apps/api/src/main.ts
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://rukny.io',
  'https://www.rukny.io',
  'https://staging.rukny.io',
].filter(Boolean);

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // ... rest of config
});
```
### API Error Handling Hook

```typescript
// apps/web/src/lib/hooks/useApiError.ts
import { useState } from 'react';
import { ApiError, handleApiError } from '@/lib/api/errors';
import { useRouter } from 'next/navigation';

export function useApiError() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleError(err: unknown) {
    const message = handleApiError(err);
    setError(message);
Production Readiness Checklist

### ✅ API Response Contract
- [ ] All backend endpoints return `{ data, statusCode, message? }` format
- [ ] Global interceptor applied to enforce consistent shape
- [ ] Frontend ApiClient unwraps responses automatically
- [ ] Team documentation updated with response contract

### ✅ Type Safety
- [ ] Date fields defined as `string` in shared types
- [ ] Date parsing utilities created for frontend
- [ ] Consider Zod for runtime validation (optional)
- [ ] Shared types package builds correctly

### ✅ CSRF Protection
- [ ] SameSite=Lax cookies configured
- [ ] CORS properly restricted
- [ ] Plan for CSRF tokens on sensitive operations
- [ ] Document chosen CSRF strategy

### ✅ Token Management
- [ ] Access token (15 min) + Refresh token (7 days)
- [ ] Token rotation implemented on refresh
- [ ] Blacklist strategy for revoked tokens (Redis)
- [ ] "Logout all devices" functionality
- [ ] Automatic token refresh in API client

### ✅ CORS Configuration
- [ ] Allowed headers include X-CSRF-Token (if needed)
- [ ] Multiple origins supported (staging, production)
- [ ] Credentials enabled for cookies
- [ ] Proper error messages for CORS failures

### ✅ Server-Side Fetching
- [ ] Server-side API client with cookie forwarding
- [ ] BFF pattern considered for complex flows
- [ ] Environment variables for internal/external URLs
- [ ] Server Components use server-side fetching

### ✅ Error Handling
- [ ] Global error boundary implemented
- [ ] API errors properly typed and handled
- [ ] User-friendly error messages
- [ ] Error logging/monitoring setup (Sentry, etc.)

### ✅ Security
- [ ] httpOnly cookies for tokens
- [ ] Secure flag in production
- [ ] Rate limiting on authentication endpoints
- [ ] Input validation on both frontend and backend
- [ ] Environment variables never committed

### ✅ Testing
- [ ] Unit tests for API client
- [ ] Integration tests for auth flow
- [ ] E2E tests for critical paths
- [ ] Load testing for production readiness

### ✅ Monitoring
- [ ] Request ID tracking (X-Request-ID header)
- [ ] Error tracking service integrated
- [ ] API response time monitoring
- [ ] Failed login attempt tracking

---

## Next Steps

After understanding this integration guide:

1. ✅ **Review** current backend and frontend code
2. ✅ **Set up** environment variables for both apps
3. ✅ **Implement** standardized API response format
4. ✅ **Create** shared types with correct date handling
5. ✅ **Implement** API client with unwrapping logic
6. ✅ **Set up** two-token authentication system
7. ✅ **Add** token rotation and blacklisting
8. ✅ **Create** server-side API client for SSR
9. ✅ **Test** authentication flow end-to-end
10. ✅ **Implement** feature-specific API endpoints
11. ✅ **Add** comprehensive error handling
12. ✅ **Test** in production-like environment
13. ✅ **Deploy** to staging for testing
14`

---

## CORS Configuration

### Backend CORS Setup

**File:** `apps/api/src/main.ts`

```typescript
// CORS Configuration
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 3600, // Cache preflight for 1 hour
});
```

### Environment-Specific CORS

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- CORS: Allow localhost origins

**Production:**
- Frontend: `https://rukny.io`
- Backend: `https://api.rukny.io`
- CORS: Strict origin matching

---

## Development Workflow

### Running the Application

**1. Start Backend:**
```bash
cd apps/api
npm run start:dev
# Runs on http://localhost:3001
```

**2. Start Frontend:**
```bash
cd apps/web
npm run dev
# Runs on http://localhost:3000
```

**3. Run Both Concurrently (Recommended):**
```bash
# From root directory
npm run dev
```

This command (defined in root `package.json`) starts both backend and frontend simultaneously using `concurrently`.

### Development Tools

**Backend:**
- **API Documentation:** http://localhost:3001/api (Swagger UI)
- **Health Check:** http://localhost:3001/health
- **Database Studio:** `npx prisma studio`

**Frontend:**
- **Dev Server:** http://localhost:3000
- **Next.js Fast Refresh:** Instant updates on save

---

## Production Considerations

### Deployment Architecture

```
                    Internet
                       │
                       ↓
              ┌────────────────┐
              │  Load Balancer │
              │  (Cloudflare)  │
              └────────────────┘
                   │        │
         ┌─────────┘        └─────────┐
         ↓                            ↓
┌─────────────────┐          ┌─────────────────┐
│   Frontend      │          │   Backend API   │
│   (Vercel)      │          │   (Railway)     │
│ rukny.io        │          │ api.rukny.io    │
└─────────────────┘          └─────────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ↓             ↓             ↓
                ┌──────────┐  ┌──────────┐  ┌──────────┐
                │PostgreSQL│  │  Redis   │  │  AWS S3  │
                └──────────┘  └──────────┘  └──────────┘
```

### Environment Variables

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://api.rukny.io
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_APP_URL=https://rukny.io
```

**Backend (Railway):**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://rukny.io
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
```

### SSL/TLS Requirements

- ✅ Both frontend and backend must use HTTPS
- ✅ Cookies require `secure: true` flag in production
- ✅ CORS origin must match exactly (including protocol)

### Cookie Settings

**Development:**
```typescript
{
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // HTTP allowed
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

**Production:**
```typescript
{
  httpOnly: true,
  sameSite: 'lax',
  secure: true, // HTTPS only
  domain: '.rukny.io', // Allow subdomains
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

---

## Security Best Practices

### 1. Authentication

- ✅ Use httpOnly cookies for JWT tokens
- ✅ Never store tokens in localStorage
- ✅ Implement token rotation/refresh
- ✅ Set appropriate token expiration (7 days)
- ✅ Use secure cookies in production

### 2. CORS

- ✅ Whitelist specific origins (not `*`)
- ✅ Enable credentials for cookies
- ✅ Validate origin on backend

### 3. Input Validation

- ✅ Validate on both frontend and backend
- ✅ Use DTOs with class-validator (backend)
- ✅ Sanitize user input
- ✅ Prevent XSS attacks

### 4. Rate Limiting

- ✅ Implement rate limiting on API (using @nestjs/throttler)
- ✅ Different limits for auth vs. regular endpoints
- ✅ Use Redis for distributed rate limiting

### 5. HTTPS

- ✅ Force HTTPS in production
- ✅ Use HSTS headers
- ✅ Proper SSL/TLS certificates

### 6. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use different secrets for dev/prod
- ✅ Rotate secrets regularly
- ✅ Use secret management services (e.g., AWS Secrets Manager)

---

## Testing Strategy

### Backend Tests

```typescript
// apps/api/src/users/users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should find user by ID', async () => {
    const user = await service.findOne('user-id');
    expect(user).toBeDefined();
  });
});
```

### Frontend Tests

```typescript
// apps/web/src/lib/api/auth.test.ts
import { authApi } from './auth';

describe('Auth API', () => {
  it('should login successfully', async () => {
    const response = await authApi.login({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(response.user).toBeDefined();
  });
});
```

### Integration Tests

Test complete flows from frontend to backend:

```typescript
// apps/web/tests/integration/auth.test.ts
describe('Authentication Flow', () => {
  it('should login and access protected route', async () => {
    // 1. Login
    await authApi.login({ email: 'test@test.com', password: 'pass' });
    
    // 2. Access protected endpoint
    const user = await authApi.me();
    
    expect(user.email).toBe('test@test.com');
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** `Access to fetch at 'http://localhost:3001' blocked by CORS policy`

**Solutions:**
- ✅ Check `FRONTEND_URL` in backend `.env`
- ✅ Verify `credentials: 'include'` in fetch calls
- ✅ Check CORS config in `main.ts`

#### 2. Cookies Not Sent

**Symptom:** Authentication works but subsequent requests are unauthorized

**Solutions:**
- ✅ Add `credentials: 'include'` to all fetch calls
- ✅ Check cookie domain/path settings
- ✅ Verify `httpOnly` and `sameSite` settings
- ✅ Check if HTTPS is required but not used

#### 3. Type Errors

**Symptom:** TypeScript errors with shared types

**Solutions:**
- ✅ Run `npm install` in root to link workspaces
- ✅ Check `tsconfig.json` paths configuration
- ✅ Rebuild types package: `npm run build --workspace=packages/types`

#### 4. Environment Variables Not Loaded

**Symptom:** `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solutions:**
- ✅ Restart Next.js dev server
- ✅ Check `.env.local` file exists
- ✅ Verify variable starts with `NEXT_PUBLIC_`
- ✅ Check for typos in variable names

#### 5. Connection Refused

**Symptom:** `ECONNREFUSED 127.0.0.1:3001`

**Solutions:**
- ✅ Check backend is running: `npm run dev:api`
- ✅ Verify backend port in `.env`
- ✅ Check for port conflicts
- ✅ Try `localhost` instead of `127.0.0.1`

---

## Next Steps

After understanding this integration guide:

1. ✅ **Review** current backend and frontend code
2. ✅ **Set up** environment variables for both apps
3. ✅ **Implement** API client and authentication
4. ✅ **Create** shared types in packages/types
5. ✅ **Test** authentication flow end-to-end
6. ✅ **Implement** feature-specific API endpoints
7. ✅ **Add** error handling and loading states
8. ✅ **Test** in production-like environment
9. ✅ **Deploy** to staging for testing
10. ✅ **Deploy** to production

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** January 15, 2026  
**Author:** Development Team
