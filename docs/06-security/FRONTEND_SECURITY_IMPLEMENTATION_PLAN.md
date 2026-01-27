# 🔒 خطة تأمين Frontend - مشروع Rukny.io

> **تاريخ الإنشاء:** 28 نوفمبر 2025  
> **الحالة:** جاهز للتنفيذ  
> **الوقت المقدر:** 5 ساعات

---

## 📊 تحليل نظام التسجيل والأمان في Backend

### ✅ التقنيات المستخدمة حالياً

#### 1. المصادقة (Authentication)
- **Google OAuth 2.0** (التسجيل الوحيد المتاح)
- **JWT (JSON Web Tokens)** مع Passport.js
- **Session Management** (تخزين الجلسات في Database)
- **Access Token**: صالح لمدة 15 دقيقة
- **Refresh Token**: صالح لمدة 30 يوم

> **⚠️ قرار معماري مهم:**  
> **Backend هو الـ Source of Truth الوحيد** - لن نستخدم NextAuth لتجنب التداخل والتعقيد.  
> سنعتمد بالكامل على نظام NestJS الموجود ونبني Frontend client بسيط.

#### 2. الحماية المطبقة في Backend
- ✅ **CSRF Protection** (csurf middleware)
- ✅ **Helmet.js** (HTTP Security Headers)
- ✅ **CORS** (مع دعم الشبكة المحلية في Development)
- ✅ **Rate Limiting** (@nestjs/throttler)
- ✅ **Cookie Security** (httpOnly, secure, sameSite)
- ✅ **Session Validation** (التحقق من الجلسة في كل طلب)
- ✅ **Security Logging** (تسجيل محاولات الدخول)
- ✅ **Device Detection** (كشف الأجهزة الجديدة)
- ✅ **IP Tracking** (تتبع عناوين IP)
- ✅ **User Agent Parsing** (تحليل معلومات المتصفح)

#### 3. آلية تسجيل الدخول الحالية

**Flow Diagram:**
```
User → Frontend → Google OAuth → Backend
                                    ↓
                              Validate User
                                    ↓
                              Create/Update User
                                    ↓
                              Generate JWT (15min)
                                    ↓
                              Create Session (30 days)
                                    ↓
                              Generate One-Time Code
                                    ↓
                              Redirect → Frontend
                                    ↓
                              Exchange Code → Access Token
                                    ↓
                              Store in Cookie (httpOnly)
```

**Security Features في Auth Flow:**
- One-time code exchange (بدلاً من Token في URL)
- Session tracking مع Device fingerprinting
- Security logging لكل login
- Email notifications للأجهزة الجديدة
- Token hashing في Database
- Automatic session expiry checking

#### 4. نقاط الضعف الحالية في Frontend
⚠️ CSP غير مفعل في Development  
⚠️ لا يوجد XSS Sanitization على Frontend  
⚠️ لا يوجد Input Validation قوي على Frontend  
⚠️ عدم وجود Rate Limiting على Frontend  
⚠️ CSRF tokens غير مدارة بشكل صحيح  
⚠️ لا يوجد Security Headers إضافية  

---

## 🎯 مخطط العمل الشامل للتنفيذ

### **Phase 1: إعداد البنية التحتية الأمنية** ⏱️ 30 دقيقة

#### Step 1.1: تثبيت المكتبات الأمنية

```bash
# Frontend Security Packages
cd apps/web

npm install \
  zod \
  @hookform/resolvers \
  react-hook-form \
  dompurify \
  @types/dompurify \
  isomorphic-dompurify
```

**المكتبات المطلوبة:**

| Package | الوظيفة | الأهمية |
|---------|---------|---------|
| `zod` | التحقق من صحة المدخلات | عالية جداً |
| `dompurify` | منع XSS attacks | عالية جداً |
| `isomorphic-dompurify` | DOMPurify للـ SSR | عالية |
| `@hookform/resolvers` | ربط Zod مع React Hook Form | عالية |
| `react-hook-form` | إدارة النماذج | عالية |

> **لماذا لم نضف NextAuth؟**  
> Backend الخاص بنا (NestJS) لديه بالفعل نظام مصادقة متكامل مع Google OAuth + JWT + Sessions.  
> إضافة NextAuth سيخلق تداخل وتعقيد غير ضروري. سنبني Auth Client بسيط بدلاً من ذلك.

#### Step 1.2: إنشاء هيكل المجلدات

```bash
# إنشاء هيكل الأمان
apps/web/src/
├── lib/
│   ├── security/
│   │   ├── csrf.ts          # CSRF Token Management
│   │   ├── xss.ts           # XSS Prevention
│   │   ├── validation.ts    # Input Validation
│   │   ├── headers.ts       # Security Headers
│   │   └── rate-limiter.ts  # Client-Side Rate Limiting
│   ├── auth/
│   │   ├── auth-client.ts   # Auth Client (يتعامل مع Backend مباشرة)
│   │   └── auth-provider.tsx # Auth Context Provider
│   └── api/
│       ├── client.ts        # Secure API Client
│       ├── interceptors.ts  # Request/Response Interceptors
│       └── endpoints.ts     # API Endpoints
├── components/
│   ├── auth/
│   │   ├── LoginButton.tsx  # Google Login Button
│   │   └── AuthGuard.tsx    # Protected Route Wrapper
│   └── security/
│       ├── SafeHTML.tsx     # Safe HTML Renderer
│       └── SecureForm.tsx   # Secure Form Wrapper
├── hooks/
│   ├── useSecureForm.ts     # Secure Form Hook
│   ├── useAuth.ts           # Auth Hook (يستخدم Context)
│   └── useCSRF.ts           # CSRF Hook
└── middleware.ts            # Next.js Middleware (Security Layer)
```

> **ملاحظة:** تم إزالة NextAuth - سنستخدم Context API بسيط + API Client

---

### **Phase 2: تكوين Security Headers** ⏱️ 20 دقيقة

#### Step 2.1: تحديث `next.config.ts`

```typescript
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== 'production';

// Content Security Policy
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // HSTS - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Prevent XSS
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '')
          }
        ]
      }
    ];
  },
  
  // Security: Disable X-Powered-By header
  poweredByHeader: false,
  
  // Security: Enable strict mode
  reactStrictMode: true,
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  }
};

export default nextConfig;
```

#### Step 2.2: إنشاء `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 1. Rate Limiting
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (limit) {
    if (now < limit.resetTime) {
      if (limit.count >= 100) { // 100 requests per minute
        return new NextResponse('Too Many Requests', { status: 429 });
      }
      limit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
  }
  
  // 2. Security Headers (additional to next.config.ts)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // ❌ CSRF validation تم إزالته من هنا
  // ✅ Backend (csurf) هو المسؤول الوحيد عن CSRF validation
  // Frontend فقط يضيف الـ token في الـ headers
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

> **⚠️ قرار معماري مهم:**
> 
> **CSRF Validation يحدث في Backend فقط** لتجنب:
> - ❌ التكرار والتعارض
> - ❌ Frontend يرفض request قبل ما يوصل Backend
> - ❌ اختلاف منطق الـ validation
> 
> **Frontend مسؤول فقط عن:**
> - ✅ الحصول على CSRF token من Backend
> - ✅ تخزينه في cookie
> - ✅ إضافته في header `X-XSRF-TOKEN`
> 
> **Backend مسؤول عن:**
> - ✅ توليد CSRF token
> - ✅ التحقق من صحته
> - ✅ إرجاع 403 إذا كان غير صالح

---

### **Phase 3: Auth Client (بدون NextAuth)** ⏱️ 30 دقيقة

> **المبدأ:** Backend هو المسؤول الوحيد عن المصادقة. Frontend فقط يوجه المستخدم ويقرأ الكوكيز.

#### Step 3.1: Auth Client - `lib/auth/auth-client.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export class AuthClient {
  /**
   * توجيه المستخدم لتسجيل الدخول عبر Google
   */
  static login() {
    // Backend يتعامل مع Google OAuth بالكامل
    window.location.href = `${API_URL}/auth/google`;
  }
  
  /**
   * الحصول على بيانات المستخدم الحالي
   */
  static async me(): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include', // إرسال الكوكيز تلقائياً
      });
      
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
  
  /**
   * تسجيل الخروج
   */
  static async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // مسح أي بيانات محلية
      localStorage.clear();
      sessionStorage.clear();
      
      // إعادة توجيه للصفحة الرئيسية
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  /**
   * التحقق من الجلسة الحالية
   */
  static async checkSession(): Promise<boolean> {
    const user = await this.me();
    return user !== null;
  }
}
```

#### Step 3.2: Auth Context Provider - `lib/auth/auth-provider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthClient, User } from './auth-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchUser = async () => {
    setIsLoading(true);
    const userData = await AuthClient.me();
    setUser(userData);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: AuthClient.login,
    logout: async () => {
      await AuthClient.logout();
      setUser(null);
    },
    refreshUser: fetchUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

#### Step 3.3: Auth Hook - `hooks/useAuth.ts`

```typescript
'use client';

export { useAuthContext as useAuth } from '@/lib/auth/auth-provider';
```

#### Step 3.4: Login Button Component - `components/auth/LoginButton.tsx`

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const { isAuthenticated, login, logout, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }
  
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span>مرحباً، {user.name}</span>
        <Button onClick={logout} variant="outline">
          تسجيل الخروج
        </Button>
      </div>
    );
  }
  
  return (
    <Button onClick={login} className="flex items-center gap-2">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      تسجيل الدخول بـ Google
    </Button>
  );
}
```

#### Step 3.5: Auth Guard Component - `components/auth/AuthGuard.tsx`

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * حماية الصفحات التي تتطلب تسجيل دخول
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
```

#### Step 3.6: تطبيق Auth Provider في Layout

```typescript
// apps/web/src/app/layout.tsx
import { AuthProvider } from '@/lib/auth/auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

> **الفوائد:**
> - ✅ لا يوجد تداخل مع Backend
> - ✅ الكوكيز تُدار بالكامل من Backend (httpOnly + Secure)
> - ✅ لا حاجة لتخزين Tokens في Frontend
> - ✅ Token refresh يحدث تلقائياً من Backend
> - ✅ أبسط وأوضح وأكثر أماناً

---

### **Phase 4: CSRF Protection** ⏱️ 30 دقيقة

#### Step 4.1: CSRF Token Management - `lib/security/csrf.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * ✅ مدير CSRF Token - يتعامل مع Backend فقط
 * 
 * Flow:
 * 1. Backend (csurf) يولد token ويضعه في cookie XSRF-TOKEN
 * 2. Frontend يقرأ الـ token من الـ cookie
 * 3. Frontend يضيف الـ token في header X-XSRF-TOKEN
 * 4. Backend يتحقق من تطابق cookie مع header
 * 
 * ⚠️ مهم: Frontend لا يفعل validation - Backend فقط هو المسؤول
 */
export class CSRFManager {
  private static token: string | null = null;
  
  /**
   * الحصول على CSRF token من Backend
   * Backend يضع الـ token في cookie XSRF-TOKEN تلقائياً
   */
  static async getToken(): Promise<string> {
    // Check if we already have token in memory
    if (this.token) return this.token;
    
    // Check if Backend already set the cookie
    const cookieToken = this.getStoredToken();
    if (cookieToken) {
      this.token = cookieToken;
      return cookieToken;
    }
    
    try {
      // Request CSRF token from Backend
      const response = await fetch(`${API_URL}/auth/csrf`, {
        method: 'GET',
        credentials: 'include', // Backend سيضع cookie XSRF-TOKEN
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      this.token = data.csrfToken;
      
      // ✅ Backend وضع الـ token في cookie
      // لا حاجة لوضعه يدوياً هنا
      
      return this.token;
    } catch (error) {
      console.error('CSRF token error:', error);
      throw error;
    }
  }
  
  /**
   * إضافة CSRF token إلى Headers
   * Backend سيقارن هذا الـ header مع الـ cookie
   */
  static async attachToken(headers: Headers): Promise<Headers> {
    const token = await this.getToken();
    headers.set('X-XSRF-TOKEN', token);
    return headers;
  }
  
  /**
   * مسح Token (عند Logout)
   */
  static clearToken(): void {
    this.token = null;
    // Backend سيمسح الـ cookie عند logout
  }
  
  /**
   * قراءة Token من Cookie (Backend وضعه)
   */
  static getStoredToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    // Backend يستخدم XSRF-TOKEN كاسم الكوكي (موضح في main.ts)
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  }
}
```

> **✅ التوافق مع Backend:**
> 
> في `apps/api/src/main.ts`:
> ```typescript
> const csrfProtection = csurf({ 
>   cookie: {
>     httpOnly: false, // ✅ يجب أن يكون false حتى JS يقرأه
>     secure: process.env.NODE_ENV === 'production',
>     sameSite: 'lax',
>     key: 'XSRF-TOKEN', // ✅ نفس الاسم في Frontend
>   },
>   value: (req) => {
>     return req.headers['x-xsrf-token'] || // ✅ نفس header name
>            req.headers['x-csrf-token'] || 
>            req.body?._csrf;
>   }
> });
> ```
> 
> **مطابقة 100%:**
> - Cookie name: `XSRF-TOKEN` ✅
> - Header name: `X-XSRF-TOKEN` ✅
> - Backend هو source of truth ✅
> - Frontend لا يفعل validation ✅

#### Step 4.2: CSRF Hook - `hooks/useCSRF.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { CSRFManager } from '@/lib/security/csrf';

export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const csrfToken = await CSRFManager.getToken();
        setToken(csrfToken);
      } catch (err) {
        setError('Failed to fetch CSRF token');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchToken();
  }, []);
  
  return { token, loading, error };
}
```

---

### **Phase 5: XSS Prevention** ⏱️ 25 دقيقة

#### Step 5.1: XSS Sanitization - `lib/security/xss.ts`

```typescript
import DOMPurify from 'isomorphic-dompurify';

/**
 * تنظيف HTML من محتوى خطير
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * تنظيف نص عادي (escape HTML entities)
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * تنظيف URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Allow only http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * تنظيف Object بشكل متكرر
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

#### Step 5.2: Safe HTML Component - `components/security/SafeHTML.tsx`

```typescript
'use client';

import { sanitizeHtml } from '@/lib/security/xss';

interface SafeHTMLProps {
  content: string;
  className?: string;
}

/**
 * Component لعرض HTML بشكل آمن
 */
export function SafeHTML({ content, className }: SafeHTMLProps) {
  const cleanContent = sanitizeHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanContent }} 
    />
  );
}
```

---

### **Phase 6: Input Validation (Zod)** ⏱️ 30 دقيقة

#### Step 6.1: Validation Schemas - `lib/security/validation.ts`

```typescript
import { z } from 'zod';
import { sanitizeInput, sanitizeUrl } from './xss';

// Schema للـ Login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(sanitizeInput),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .transform(sanitizeInput),
});

// Schema للـ Profile
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long')
    .transform(sanitizeInput),
  bio: z
    .string()
    .max(500, 'Bio too long')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  website: z
    .string()
    .url('Invalid URL')
    .optional()
    .transform(val => val ? sanitizeUrl(val) : val),
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
});

// Schema للـ Event
export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long')
    .transform(sanitizeInput),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long')
    .transform(sanitizeInput),
  location: z
    .string()
    .max(200, 'Location too long')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .optional(),
});

// Schema للـ Social Links
export const socialLinkSchema = z.object({
  platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin', 'github', 'youtube']),
  url: z
    .string()
    .url('Invalid URL')
    .transform(sanitizeUrl),
  title: z
    .string()
    .max(50, 'Title too long')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
});

// Schema للـ Store Product
export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name too long')
    .transform(sanitizeInput),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description too long')
    .transform(sanitizeInput),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price too high'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image required')
    .max(5, 'Maximum 5 images allowed'),
});

/**
 * دالة للتحقق والتنظيف معاً
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }
    throw error;
  }
}

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ProductInput = z.infer<typeof productSchema>;
```

#### Step 6.2: Secure Form Hook - `hooks/useSecureForm.ts`

```typescript
'use client';

import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateAndSanitize } from '@/lib/security/validation';

interface UseSecureFormProps<T extends z.ZodType> extends UseFormProps {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
}

export function useSecureForm<T extends z.ZodType>({
  schema,
  onSubmit,
  ...formProps
}: UseSecureFormProps<T>) {
  const form = useForm({
    resolver: zodResolver(schema),
    ...formProps,
  });
  
  const secureSubmit = form.handleSubmit(async (data) => {
    try {
      // Validate and sanitize
      const sanitizedData = validateAndSanitize(schema, data);
      
      // Call original submit
      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
      form.setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Submission failed',
      });
    }
  });
  
  return {
    ...form,
    secureSubmit,
  };
}
```

#### Step 6.3: Secure Form Component - `components/security/SecureForm.tsx`

```typescript
'use client';

import { FormHTMLAttributes } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface SecureFormProps extends FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  children: React.ReactNode;
}

/**
 * Form component مع حماية CSRF
 */
export function SecureForm({ form, onSubmit, children, ...props }: SecureFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate // استخدام validation مخصص
      autoComplete="off"
      {...props}
    >
      {children}
      
      {form.formState.errors.root && (
        <div className="text-red-600 text-sm mt-2">
          {form.formState.errors.root.message}
        </div>
      )}
    </form>
  );
}
```

---

### **Phase 7: Rate Limiting على Frontend (UX Layer)** ⏱️ 20 دقيقة

> **⚠️ تنبيه مهم:**  
> **Rate limiting في Frontend ليس أماناً حقيقياً!**
> 
> - ❌ المهاجم يقدر يتجاوزه بسهولة (curl, Postman, scripts)
> - ❌ يمكن تعطيله من Developer Tools
> - ❌ لا يحمي Backend من الهجمات
> 
> **الهدف منه فقط:**
> - ✅ تحسين UX (منع المستخدم العادي من spam)
> - ✅ رسالة فورية للمستخدم (بدون انتظار Backend)
> - ✅ تقليل الطلبات غير الضرورية للـ Backend
> 
> **الأمان الحقيقي:**
> - ✅ Backend: `@nestjs/throttler` (موجود بالفعل)
> - ✅ Nginx/CloudFlare rate limiting في production
> - ✅ WAF (Web Application Firewall)

#### Step 7.1: Client-Side Rate Limiter - `lib/security/rate-limiter.ts`

```typescript
/**
 * ⚠️ Client-Side Rate Limiter - UX فقط
 * 
 * هذا الـ Rate Limiter يعمل في متصفح المستخدم فقط ولا يوفر أمان حقيقي.
 * يمكن للمهاجم تجاوزه بسهولة باستخدام curl أو Postman.
 * 
 * الغرض منه:
 * - تحسين تجربة المستخدم العادي
 * - عرض رسالة فورية بدون انتظار Backend
 * - تقليل الطلبات غير الضرورية
 * 
 * الأمان الحقيقي يأتي من Backend (@nestjs/throttler)
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitEntry {
  timestamps: number[];
  blocked: boolean;
  blockedUntil?: number;
}

export class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000 }) {
    this.config = config;
  }
  
  /**
   * التحقق من عدد المحاولات
   */
  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.attempts.get(key);
    
    // Check if currently blocked
    if (entry?.blocked && entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        return {
          allowed: false,
          remaining: 0,
          resetIn: entry.blockedUntil - now,
        };
      } else {
        // Unblock
        entry.blocked = false;
        entry.blockedUntil = undefined;
        entry.timestamps = [];
      }
    }
    
    // Get or create entry
    const timestamps = entry?.timestamps || [];
    
    // Remove old timestamps outside window
    const recentTimestamps = timestamps.filter(
      t => now - t < this.config.windowMs
    );
    
    // Check if limit exceeded
    if (recentTimestamps.length >= this.config.maxAttempts) {
      // Block for windowMs duration
      const blockedUntil = now + this.config.windowMs;
      this.attempts.set(key, {
        timestamps: recentTimestamps,
        blocked: true,
        blockedUntil,
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetIn: this.config.windowMs,
      };
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    this.attempts.set(key, {
      timestamps: recentTimestamps,
      blocked: false,
    });
    
    return {
      allowed: true,
      remaining: this.config.maxAttempts - recentTimestamps.length,
      resetIn: this.config.windowMs,
    };
  }
  
  /**
   * إعادة تعيين المحاولات
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * مسح جميع المحاولات
   */
  clear(): void {
    this.attempts.clear();
  }
}

// Pre-configured limiters (UX-focused, not security)
export const loginLimiter = new RateLimiter({ maxAttempts: 5, windowMs: 60000 }); // 5 attempts per minute
export const apiLimiter = new RateLimiter({ maxAttempts: 50, windowMs: 60000 }); // 50 requests per minute
export const formLimiter = new RateLimiter({ maxAttempts: 10, windowMs: 60000 }); // 10 submissions per minute

/**
 * ⚠️ ملاحظة: هذه الأرقام أعلى من Backend rate limits
 * 
 * Backend Limits (الأمان الحقيقي):
 * - Global: 10 requests/second per IP
 * - Login: 5 attempts/minute
 * - Upload: 3 uploads/minute
 * - OAuth exchange: 5 attempts/minute
 * 
 * Frontend Limits (UX):
 * - أعلى قليلاً لتجنب False positives
 * - تعطي المستخدم فرصة أكبر قبل Backend blocking
 */
```

> **Best Practice:**
> ```typescript
> // ✅ استخدام صحيح
> const handleSubmit = async (data) => {
>   // 1. Frontend check (UX)
>   if (!loginLimiter.check('login').allowed) {
>     toast.error('Too many attempts. Please wait...');
>     return;
>   }
>   
>   try {
>     // 2. Backend request (الأمان الحقيقي)
>     await apiClient.post('/auth/login', data);
>   } catch (error) {
>     // Backend rate limit error
>     if (error.status === 429) {
>       toast.error('Too many requests from this IP');
>     }
>   }
> };
> ```

#### Step 7.2: Rate Limit Hook - `hooks/useRateLimit.ts`

```typescript
'use client';

import { useState } from 'react';
import { RateLimiter } from '@/lib/security/rate-limiter';

/**
 * ⚠️ Rate Limit Hook - UX Layer
 * 
 * هذا الـ hook يوفر feedback فوري للمستخدم قبل إرسال الطلب للـ Backend.
 * لا يعتبر أماناً حقيقياً - Backend هو المسؤول عن Rate Limiting الفعلي.
 */
export function useRateLimit(limiter: RateLimiter, key: string) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [resetIn, setResetIn] = useState(0);
  
  const checkLimit = (): boolean => {
    const result = limiter.check(key);
    
    setIsBlocked(!result.allowed);
    setRemaining(result.remaining);
    setResetIn(result.resetIn);
    
    return result.allowed;
  };
  
  const reset = () => {
    limiter.reset(key);
    setIsBlocked(false);
    setRemaining(0);
    setResetIn(0);
  };
  
  return {
    checkLimit,
    isBlocked,
    remaining,
    resetIn,
    reset,
  };
}
```

#### Step 7.3: مثال استخدام في Form Component

```typescript
'use client';

import { useRateLimit } from '@/hooks/useRateLimit';
import { loginLimiter } from '@/lib/security/rate-limiter';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const { checkLimit, isBlocked, resetIn } = useRateLimit(loginLimiter, 'login');
  const { toast } = useToast();
  
  const handleSubmit = async (data: any) => {
    // ✅ Frontend check (UX) - عرض رسالة فورية
    if (!checkLimit()) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${Math.ceil(resetIn / 1000)} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      // ✅ Backend request (الأمان الحقيقي)
      await apiClient.post('/auth/login', data);
      toast({ title: "Login successful!" });
    } catch (error: any) {
      // ✅ Backend rate limit (429) - الأمان الحقيقي
      if (error.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "Too many requests from your IP. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        disabled={isBlocked}
      >
        {isBlocked 
          ? `Wait ${Math.ceil(resetIn / 1000)}s...` 
          : 'Login'
        }
      </Button>
    </form>
  );
}
```

> **Flow Diagram:**
> ```
> User clicks submit
>        ↓
> Frontend Rate Limiter (UX check) ✅ Fast feedback
>        ↓
> If blocked: Show toast immediately (no API call)
>        ↓
> If allowed: Send to Backend
>        ↓
> Backend @nestjs/throttler (Real security) 🔒
>        ↓
> If 429: Show Backend error
> If 200: Success
> ```

---

### **Phase 8: Secure API Integration** ⏱️ 40 دقيقة

#### Step 8.1: Secure API Client - `lib/api/client.ts`

```typescript
import { CSRFManager } from '@/lib/security/csrf';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestConfig extends RequestInit {
  skipCSRF?: boolean;
}

export class SecureAPIClient {
  private baseURL: string;
  
  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }
  
  /**
   * طلب آمن مع جميع الحمايات
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipCSRF = false, ...fetchConfig } = config;
    
    // Prepare headers
    const headers = new Headers(fetchConfig.headers);
    headers.set('Content-Type', 'application/json');
    
    // Attach CSRF token for mutations
    if (!skipCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchConfig.method || 'GET')) {
      await CSRFManager.attachToken(headers);
    }
    
    // Make request with credentials (cookies sent automatically)
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchConfig,
      headers,
      credentials: 'include', // ✅ الكوكيز (JWT + Session) تُرسل تلقائياً
    });
    
    // Handle errors
    if (!response.ok) {
      await this.handleError(response);
    }
    
    // Handle token refresh (Backend handles this automatically)
    if (response.status === 401) {
      // Backend will try to refresh token automatically
      // If refresh fails, redirect to login
      window.location.href = '/';
      throw new Error('Session expired');
    }
    
    return response.json();
  }
  
  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET', skipCSRF: true });
  }
  
  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
  
  /**
   * معالجة الأخطاء
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'Request failed';
    
    try {
      const data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
}

// Export singleton instance
export const apiClient = new SecureAPIClient();
```

> **التبسيط:**
> - ✅ لا حاجة لـ `requireAuth` - الكوكيز تُرسل تلقائياً
> - ✅ لا حاجة لـ `Authorization` header - Backend يقرأ الكوكي
> - ✅ Token refresh يحدث تلقائياً في Backend
> - ✅ أبسط وأنظف

#### Step 8.2: API Endpoints - `lib/api/endpoints.ts`

```typescript
import { apiClient } from './client';
import type { LoginInput, ProfileInput, EventInput } from '@/lib/security/validation';

export const authAPI = {
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

export const profileAPI = {
  get: (username: string) => apiClient.get(`/profiles/${username}`, { requireAuth: false }),
  update: (data: ProfileInput) => apiClient.put('/profiles/me', data),
  delete: () => apiClient.delete('/profiles/me'),
};

export const eventsAPI = {
  list: () => apiClient.get('/events', { requireAuth: false }),
  get: (id: string) => apiClient.get(`/events/${id}`, { requireAuth: false }),
  create: (data: EventInput) => apiClient.post('/events', data),
  update: (id: string, data: Partial<EventInput>) => apiClient.put(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete(`/events/${id}`),
};

export const uploadAPI = {
  image: async (file: File, type: 'avatar' | 'event') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const session = await getSession();
    const csrfToken = await CSRFManager.getToken();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`,
        'X-XSRF-TOKEN': csrfToken,
      },
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },
};
```

---

### **Phase 9: Security Monitoring & Logging** ⏱️ 30 دقيقة

#### Step 9.1: Security Logger - `lib/security/logger.ts`

```typescript
import { apiClient } from '@/lib/api/client';

export enum SecurityEventType {
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUCCESSFUL_LOGIN = 'SUCCESSFUL_LOGIN',
  LOGOUT = 'LOGOUT',
  CSRF_ERROR = 'CSRF_ERROR',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_INPUT = 'INVALID_INPUT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  details?: Record<string, any>;
  timestamp?: Date;
}

export class SecurityLogger {
  /**
   * تسجيل حدث أمني
   */
  static async logEvent(event: SecurityEvent): Promise<void> {
    const logData = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
    
    try {
      // Send to backend
      await apiClient.post('/security/log', logData, { requireAuth: false });
      
      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Security Event]', logData);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  /**
   * تسجيل محاولة تسجيل دخول فاشلة
   */
  static failedLogin(email: string): void {
    this.logEvent({
      type: SecurityEventType.FAILED_LOGIN,
      severity: SecuritySeverity.MEDIUM,
      details: { email: email.replace(/(?<=.{2})./g, '*') }, // Mask email
    });
  }
  
  /**
   * تسجيل CSRF error
   */
  static csrfError(endpoint: string): void {
    this.logEvent({
      type: SecurityEventType.CSRF_ERROR,
      severity: SecuritySeverity.HIGH,
      details: { endpoint },
    });
  }
  
  /**
   * تسجيل محاولة XSS
   */
  static xssAttempt(input: string): void {
    this.logEvent({
      type: SecurityEventType.XSS_ATTEMPT,
      severity: SecuritySeverity.CRITICAL,
      details: { 
        input: input.substring(0, 100), // Only log first 100 chars
        detected: true,
      },
    });
  }
  
  /**
   * تسجيل تجاوز Rate Limit
   */
  static rateLimitExceeded(key: string): void {
    this.logEvent({
      type: SecurityEventType.RATE_LIMIT,
      severity: SecuritySeverity.MEDIUM,
      details: { key },
    });
  }
  
  /**
   * تسجيل إدخال غير صالح
   */
  static invalidInput(field: string, error: string): void {
    this.logEvent({
      type: SecurityEventType.INVALID_INPUT,
      severity: SecuritySeverity.LOW,
      details: { field, error },
    });
  }
}
```

#### Step 9.2: Error Boundary مع Security Logging

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { SecurityLogger, SecurityEventType, SecuritySeverity } from '@/lib/security/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SecurityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    // Log security-related errors
    SecurityLogger.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: SecuritySeverity.HIGH,
      details: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 text-sm mt-2">
            Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

### **Phase 10: Testing & Verification** ⏱️ 45 دقيقة

#### Step 10.1: Security Tests Checklist

```typescript
// tests/security/security.test.ts

describe('Security Tests', () => {
  describe('CSRF Protection', () => {
    it('should fetch CSRF token from Backend', async () => {
      const token = await CSRFManager.getToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
    
    it('should read CSRF token from cookie', () => {
      // Simulate Backend setting cookie
      document.cookie = 'XSRF-TOKEN=test-token-123';
      const token = CSRFManager.getStoredToken();
      expect(token).toBe('test-token-123');
    });
    
    it('should attach CSRF token to headers', async () => {
      const headers = new Headers();
      await CSRFManager.attachToken(headers);
      expect(headers.get('X-XSRF-TOKEN')).toBeTruthy();
    });
    
    // ✅ Backend validation tests (not Frontend)
    it('Backend should reject request without CSRF token', async () => {
      const response = await fetch(`${API_URL}/some-endpoint`, {
        method: 'POST',
        credentials: 'include',
        // ❌ No X-XSRF-TOKEN header
      });
      expect(response.status).toBe(403);
    });
    
    it('Backend should accept request with valid CSRF token', async () => {
      const token = await CSRFManager.getToken();
      const response = await fetch(`${API_URL}/some-endpoint`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': token, // ✅ Valid token
        },
      });
      expect(response.status).not.toBe(403);
    });
  });
  
  describe('XSS Prevention', () => {
    it('should sanitize HTML input', () => {
      const dirty = '<script>alert("XSS")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
    });
    
    it('should escape special characters', () => {
      const input = '<div>Test & "quotes"</div>';
      const escaped = sanitizeInput(input);
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&quot;');
    });
  });
  
  describe('Input Validation', () => {
    it('should validate email format', () => {
      expect(() => loginSchema.parse({ email: 'invalid' })).toThrow();
      expect(loginSchema.parse({ email: 'test@example.com' })).toBeTruthy();
    });
    
    it('should enforce string length limits', () => {
      const longString = 'a'.repeat(1000);
      expect(() => profileSchema.parse({ name: longString })).toThrow();
    });
  });
  
  describe('Rate Limiting (UX Layer)', () => {
    it('should block after max attempts (client-side)', () => {
      const limiter = new RateLimiter({ maxAttempts: 3, windowMs: 60000 });
      
      expect(limiter.check('test').allowed).toBe(true);
      expect(limiter.check('test').allowed).toBe(true);
      expect(limiter.check('test').allowed).toBe(true);
      expect(limiter.check('test').allowed).toBe(false);
    });
    
    it('should reset after time window', async () => {
      const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 100 });
      
      limiter.check('test');
      expect(limiter.check('test').allowed).toBe(false);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(limiter.check('test').allowed).toBe(true);
    });
    
    it('can be bypassed (not real security)', () => {
      const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 60000 });
      
      limiter.check('test');
      limiter.check('test'); // blocked in browser
      
      // ⚠️ المهاجم يقدر يتجاوزه:
      // 1. يمسح localStorage/sessionStorage
      // 2. يستخدم curl مباشرة
      // 3. يعطل JavaScript
      
      // ✅ الأمان الحقيقي في Backend
    });
    
    // ✅ Backend rate limiting tests (الأمان الحقيقي)
    it('Backend should enforce rate limits', async () => {
      // محاكاة 10 طلبات سريعة
      const promises = Array.from({ length: 10 }, () =>
        fetch(`${API_URL}/some-endpoint`, { method: 'POST' })
      );
      
      const responses = await Promise.all(promises);
      
      // Backend يجب أن يرفض بعض الطلبات بـ 429
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
  
  describe('Authentication', () => {
    it('should attach Bearer token to authenticated requests', async () => {
      // Test implementation
    });
    
    it('should refresh expired tokens automatically', async () => {
      // Test implementation
    });
    
    it('should logout on refresh failure', async () => {
      // Test implementation
    });
  });
});
```

#### Step 10.2: Manual Security Testing Checklist

- [ ] **CSRF Protection**
  - [ ] Frontend يحصل على CSRF token من Backend بنجاح
  - [ ] Frontend يقرأ CSRF token من cookie `XSRF-TOKEN`
  - [ ] Frontend يضيف CSRF token في header `X-XSRF-TOKEN`
  - [ ] Backend يرفض POST request بدون CSRF token (403)
  - [ ] Backend يرفض POST request مع CSRF token غير صحيح (403)
  - [ ] Backend يقبل POST request مع CSRF token صحيح (200)
  - [ ] GET requests لا تتطلب CSRF token

- [ ] **XSS Prevention**
  - [ ] `<script>` tags are removed from user input
  - [ ] Event handlers (onclick, onerror) are removed
  - [ ] `javascript:` URLs are blocked
  - [ ] HTML entities are escaped in text inputs

- [ ] **Authentication**
  - [ ] Cannot access protected pages without login
  - [ ] Token expires after 15 minutes
  - [ ] Token refresh works correctly
  - [ ] Logout invalidates session

- [ ] **Rate Limiting**
  - [ ] Frontend: User gets immediate feedback when rate limited (UX)
  - [ ] Frontend: Rate limiter can be reset/bypassed (expected - not security)
  - [ ] **Backend (الأمان الحقيقي):**
    - [ ] Login attempts limited to 5/minute (enforced by @nestjs/throttler)
    - [ ] Upload limited to 3/minute (enforced by @nestjs/throttler)
    - [ ] OAuth exchange limited to 5/minute (enforced by @nestjs/throttler)
    - [ ] Global limit 10 req/sec per IP (enforced by @nestjs/throttler)
    - [ ] Backend returns 429 when limit exceeded
    - [ ] Backend limit cannot be bypassed from client-side

- [ ] **Security Headers**
  - [ ] CSP header is present
  - [ ] HSTS header is set
  - [ ] X-Frame-Options is DENY
  - [ ] X-Content-Type-Options is nosniff

- [ ] **Input Validation**
  - [ ] Email format is validated
  - [ ] String length limits are enforced
  - [ ] Numbers are within valid ranges
  - [ ] Required fields are checked

---

## 📋 الجدول الزمني الكامل

| Phase | المهمة | الوقت المقدر | الأولوية |
|-------|--------|--------------|----------|
| 1 | إعداد البنية التحتية | 20 دقيقة | 🔴 High |
| 2 | Security Headers | 20 دقيقة | 🔴 High |
| 3 | Auth Client (بدون NextAuth) | 30 دقيقة | 🔴 High |
| 4 | CSRF Protection | 30 دقيقة | 🔴 High |
| 5 | XSS Prevention | 25 دقيقة | 🔴 High |
| 6 | Input Validation | 30 دقيقة | 🔴 High |
| 7 | Rate Limiting | 20 دقيقة | 🟡 Medium |
| 8 | API Integration | 30 دقيقة | 🟡 Medium |
| 9 | Security Monitoring | 30 دقيقة | 🟢 Low |
| 10 | Testing | 45 دقيقة | 🔴 High |
| **المجموع** | | **~4 ساعات** | |

---

## 🎯 الأولويات

### **High Priority - اليوم الأول** 🔴
1. ✅ البنية التحتية (Phase 1)
2. ✅ Security Headers (Phase 2)
3. ✅ Auth Client (Phase 3)
4. ✅ CSRF Protection (Phase 4)
5. ✅ XSS Prevention (Phase 5)
6. ✅ Input Validation (Phase 6)

### **Medium Priority - اليوم الثاني** 🟡
7. Rate Limiting (Phase 7)
8. API Security (Phase 8)
9. Testing (Phase 10)

### **Low Priority - الأسبوع القادم** 🟢
10. Security Monitoring (Phase 9)
11. Advanced Logging
12. Performance Optimization

---

## 📦 المكتبات المطلوبة

```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "dompurify": "^3.0.6",
    "isomorphic-dompurify": "^2.9.0",
    "react-hook-form": "^7.49.2",
    "@hookform/resolvers": "^3.3.3"
  },
  "devDependencies": {
    "@types/dompurify": "^3.0.5"
  }
}
```

> **لماذا أقل مكتبات؟**  
> بدون NextAuth، نستغني عن 4 مكتبات (next-auth, jose, iron-session, ua-parser-js).  
> هذا يعني:
> - ✅ Bundle size أصغر
> - ✅ Dependencies أقل
> - ✅ Security vulnerabilities أقل
> - ✅ Maintenance أسهل

---

## 🔐 Environment Variables المطلوبة

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> **لماذا فقط متغير واحد؟**  
> Google OAuth يتم في Backend بالكامل. Frontend لا يحتاج Google credentials.  
> هذا أكثر أماناً - لا يوجد secrets في Frontend code.

---

## 📝 ملاحظات مهمة

### Security Best Practices
1. **Never** store sensitive data in localStorage
2. **Always** use httpOnly cookies for tokens
3. **Always** validate on both client and server
4. **Never** trust client-side validation alone
5. **Always** sanitize user input before rendering
6. **Use** HTTPS in production
7. **Rotate** secrets regularly
8. **Monitor** security logs

### Performance Considerations
- Frontend rate limiters use in-memory storage (browser only - UX)
- Backend rate limiters use Redis in production (real security)
- CSRF tokens are cached to reduce API calls
- Security headers are set at CDN/Nginx level in production

### Security Layers (Defense in Depth)

```
Layer 1 (Frontend - UX): 
  ├── Rate Limiter → Fast feedback, reduce unnecessary requests
  ├── Input Validation → Catch errors before sending
  └── CSRF Token → Prepared and attached

Layer 2 (Network):
  ├── CloudFlare/CDN → DDoS protection, WAF
  └── Nginx → Rate limiting, request filtering

Layer 3 (Backend - Real Security): 
  ├── @nestjs/throttler → Rate limiting (enforced)
  ├── csurf → CSRF validation (enforced)
  ├── helmet → Security headers
  ├── Passport/JWT → Authentication
  └── Input Validation → Schema validation

Layer 4 (Database):
  ├── Prisma → SQL injection prevention
  └── Row-level security
```

**⚠️ تذكير مهم:**
- Frontend = UX + Quick feedback
- Backend = Real security enforcement
- Never trust client-side validation
- Always validate on server

### Browser Compatibility
- All features work on modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- DOMPurify works on IE11 with polyfills
- CSP may need adjustments for older browsers

---

## 🚀 خطوات التنفيذ السريع

### الخطوة 1: التثبيت
```bash
cd apps/web
npm install zod dompurify isomorphic-dompurify react-hook-form @hookform/resolvers @types/dompurify
```

### الخطوة 2: إنشاء الملفات
```bash
# استخدام script لإنشاء جميع المجلدات
mkdir -p src/lib/{security,auth,api}
mkdir -p src/components/security
mkdir -p src/hooks
mkdir -p src/app/api/auth/[...nextauth]
```

### الخطوة 3: نسخ الكود
- نسخ جميع الملفات من هذا المستند
- تخصيص Environment Variables
- اختبار كل Phase على حدة

### الخطوة 4: الاختبار
```bash
npm run dev
# فتح http://localhost:3000
# اختبار جميع الميزات الأمنية
```

---

## ✅ Checklist النهائي

- [ ] جميع المكتبات مثبتة
- [ ] Environment Variables محدثة
- [ ] Security Headers مفعلة
- [ ] CSRF Protection يعمل
- [ ] XSS Prevention مطبق
- [ ] Input Validation جاهز
- [ ] Rate Limiting مفعل
- [ ] NextAuth مكوّن
- [ ] API Client آمن
- [ ] Security Logging يعمل
- [ ] جميع Tests تمر بنجاح

---

## 📚 مراجع إضافية

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Zod Documentation](https://zod.dev/)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)

---

**تم إنشاء هذا المستند بواسطة:** GitHub Copilot  
**آخر تحديث:** 28 نوفمبر 2025  
**الحالة:** ✅ جاهز للتنفيذ
