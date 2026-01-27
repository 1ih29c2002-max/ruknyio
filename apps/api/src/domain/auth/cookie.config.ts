import { Response, Request } from 'express';

/**
 * 🔒 Secure Cookie Configuration
 * 
 * ⚠️ نظام الأمان المُحسّن (كلا التوكنين في httpOnly Cookies):
 * - Access Token في httpOnly Cookie (10-15 دقيقة)
 * - Refresh Token في httpOnly Cookie (30 يوم)
 * 
 * الحماية:
 * - httpOnly: يمنع XSS من قراءة التوكنات
 * - SameSite=Strict للـ Access Token: حماية CSRF
 * - SameSite=Lax للـ Refresh Token: دعم OAuth redirects
 * - CSRF Token إضافي للعمليات الحساسة
 */

// تحديد بيئة العمل
const isProduction = process.env.NODE_ENV === 'production';
// Allow override to force non-secure cookies in local dev if NODE_ENV is mis-set
const cookieSecure = (process.env.COOKIE_SECURE === 'true') || isProduction;

// 🔒 Domain للكوكيز (مهم للـ cross-origin)
// في بيئة التطوير، نستخدم 'localhost' للسماح بمشاركة الكوكيز بين ports مختلفة
// (Frontend على 3000، API على 3001)
const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? undefined : 'localhost');

// 🔒 Origins المسموحة للـ CSRF validation
// إضافة دعم للشبكة المحلية في بيئة التطوير
const ALLOWED_ORIGINS: string[] = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Local network IPs are handled dynamically in validateCsrfOrigin()
].filter(Boolean) as string[];

// أسماء الكوكيز
// 🔒 نستخدم __Secure- prefix فقط عندما تكون الكوكيز آمنة (secure=true)
export const COOKIE_NAMES = {
  ACCESS_TOKEN: cookieSecure ? '__Secure-access_token' : 'access_token',
  REFRESH_TOKEN: cookieSecure ? '__Secure-refresh_token' : 'refresh_token',
  CSRF_TOKEN: cookieSecure ? '__Secure-csrf_token' : 'csrf_token',
} as const;

// إعدادات الأمان للكوكيز
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
  domain?: string;
}

/**
 * 🔒 تحديد إعدادات SameSite
 * 
 * ⚠️ نستخدم 'lax' بدلاً من 'strict' لأن:
 * - strict يمنع إرسال الكوكي عند العودة من OAuth (Google/LinkedIn)
 * - strict يمنع فتح الروابط من البريد/تطبيقات خارجية
 * 
 * 'lax' يسمح بإرسال الكوكي في:
 * - Top-level navigations (GET requests)
 * - لكن ليس في cross-site POST/iframe/AJAX
 * 
 * الحماية الإضافية:
 * - Origin header validation في /auth/refresh
 * - Rate limiting
 */
const getSameSite = (): 'strict' | 'lax' | 'none' => {
  return 'lax'; // آمن مع OAuth + حماية CSRF إضافية
};

/**
 * 🔒 إعدادات Access Token Cookie
 * 
 * - httpOnly: true → لا يمكن قراءته من JavaScript (XSS protection)
 * - secure: true → HTTPS فقط في الإنتاج
 * - sameSite: lax → حماية CSRF مع دعم OAuth/QuickSign redirects
 * - path: / → متاح لجميع المسارات (الـ proxy يستخدم /api/v1)
 * - صلاحية: 15 دقيقة
 * 
 * ⚠️ ملاحظة: نستخدم path: '/' و sameSite: 'lax' لأن:
 * - QuickSign/OAuth يوجه من API (port 3001) إلى Frontend (port 3000)
 * - strict يمنع إرسال الكوكي عند الـ redirect
 * - path: '/api' لا يعمل مع Next.js proxy على /api/v1
 */
export const ACCESS_TOKEN_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: 'lax', // 🔒 Lax لدعم OAuth/QuickSign redirects
  path: '/',  // 🔒 متاح لجميع المسارات (للتوافق مع proxy)
  maxAge: 15 * 60 * 1000, // 15 دقيقة
  ...(cookieDomain && { domain: cookieDomain }),
};

/**
 * 🔒 إعدادات Refresh Token Cookie
 * 
 * - httpOnly: true → لا يمكن قراءته من JavaScript (XSS protection)
 * - secure: true → HTTPS فقط في الإنتاج
 * - sameSite: lax → حماية CSRF مع دعم OAuth redirects
 * - path: / → في التطوير لدعم proxy، /api/v1/auth في الإنتاج
 * - صلاحية: 30 يوم
 * 
 * ⚠️ في التطوير: نستخدم path: '/' لأن Next.js proxy يمرر الطلبات
 * والكوكيز تحتاج أن تكون متاحة لجميع المسارات
 */
export const REFRESH_TOKEN_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: cookieSecure,
  sameSite: getSameSite(), // Lax للسماح بـ OAuth
  path: isProduction ? '/api/v1/auth' : '/',  // 🔒 في الإنتاج فقط للـ auth، في التطوير للجميع
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
  ...(cookieDomain && { domain: cookieDomain }),
};

/**
 * 🔒 إعدادات CSRF Token Cookie (قابل للقراءة من JS)
 * 
 * ⚠️ نستخدم sameSite: 'lax' بدلاً من 'strict' لأن:
 * - strict يمنع إرسال الكوكي عند الـ redirect من API إلى Frontend
 * - الـ CSRF token يحتاج أن يكون متاحاً بعد OAuth/QuickSign redirects
 */
export const CSRF_TOKEN_OPTIONS: Omit<CookieOptions, 'httpOnly'> & { httpOnly: false } = {
  httpOnly: false, // 🔒 يجب أن يكون قابل للقراءة من JS
  secure: cookieSecure,
  sameSite: 'lax', // 🔒 Lax لدعم redirects بين API و Frontend
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
  ...(cookieDomain && { domain: cookieDomain }),
};

/**
 * 🔒 إعداد Access Token في httpOnly Cookie
 */
export function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_TOKEN_OPTIONS);
}

/**
 * 🔒 إعداد Refresh Token في httpOnly Cookie
 */
export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, REFRESH_TOKEN_OPTIONS);
}

/**
 * 🔒 إعداد CSRF Token
 */
export function setCsrfTokenCookie(res: Response, csrfToken: string): void {
  res.cookie(COOKIE_NAMES.CSRF_TOKEN, csrfToken, CSRF_TOKEN_OPTIONS);
}

/**
 * 🔒 مسح جميع Auth Cookies
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'lax',
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
  });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: getSameSite(),
    path: isProduction ? '/api/v1/auth' : '/',
    ...(cookieDomain && { domain: cookieDomain }),
  });
  res.clearCookie(COOKIE_NAMES.CSRF_TOKEN, {
    httpOnly: false,
    secure: cookieSecure,
    sameSite: 'lax',
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
  });
}

/**
 * 🔒 مسح Refresh Token Cookie فقط
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: getSameSite(),
    path: isProduction ? '/api/v1/auth' : '/',
    ...(cookieDomain && { domain: cookieDomain }),
  });
}

/**
 * 🔒 استخراج Access Token من Cookie أو Authorization Header
 * 
 * الأولوية:
 * 1. Cookie (الأكثر أماناً)
 * 2. Authorization Header (للتوافق مع mobile apps/APIs)
 */
export function extractAccessToken(req: Request): string | null {
  // أولاً: من الـ Cookie
  const cookieToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (cookieToken) {
    return cookieToken;
  }
  
  // ثانياً: من Authorization Header (fallback)
  const authHeader = req.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * استخراج Refresh Token من Cookie
 */
export function extractRefreshToken(req: Request): string | null {
  return req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || null;
}

/**
 * استخراج CSRF Token من Header
 */
export function extractCsrfToken(req: Request): string | null {
  return req.headers?.['x-csrf-token'] as string || null;
}

/**
 * التحقق من وجود tokens صالحة
 */
export function hasAuthTokens(req: Request): { 
  hasAccessToken: boolean; 
  hasRefreshToken: boolean;
  hasCsrfToken: boolean;
} {
  return {
    hasAccessToken: !!extractAccessToken(req),
    hasRefreshToken: !!extractRefreshToken(req),
    hasCsrfToken: !!extractCsrfToken(req),
  };
}

/**
 * 🔒 توليد CSRF Token
 */
export function generateCsrfToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * 🔒 التحقق من CSRF Token
 */
export function validateCsrfToken(req: Request): { valid: boolean; reason?: string } {
  const headerToken = extractCsrfToken(req);
  const cookieToken = req.cookies?.[COOKIE_NAMES.CSRF_TOKEN];
  
  if (!headerToken) {
    return { valid: false, reason: 'Missing CSRF token in header' };
  }
  
  if (!cookieToken) {
    return { valid: false, reason: 'Missing CSRF token in cookie' };
  }
  
  if (headerToken !== cookieToken) {
    return { valid: false, reason: 'CSRF token mismatch' };
  }
  
  return { valid: true };
}

/**
 * 🔒 CSRF Protection للـ Refresh Endpoint
 * 
 * بما أننا نستخدم SameSite=Lax (لدعم OAuth)،
 * نحتاج حماية إضافية للـ POST requests مثل /auth/refresh
 * 
 * نتحقق من:
 * 1. Origin header يطابق FRONTEND_URL
 * 2. أو Referer header من نفس الـ domain
 */
export function validateCsrfOrigin(req: Request): { valid: boolean; reason?: string } {
  const origin = req.headers?.origin;
  const referer = req.headers?.referer;

  // Helper function to check if origin is a local network IP
  const isLocalNetworkOrigin = (url: string | undefined): boolean => {
    if (!url) return false;
    return (
      url.includes('localhost') || 
      url.includes('127.0.0.1') ||
      /^https?:\/\/192\.168\.\d+\.\d+/.test(url) ||
      /^https?:\/\/10\.\d+\.\d+\.\d+/.test(url) ||
      /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/.test(url)
    );
  };

  // 🔒 في Development، نسمح بأي origin محلي (localhost + local network IPs)
  if (!isProduction) {
    if (!origin && !referer) {
      return { valid: true }; // Postman, curl, etc.
    }
    if (isLocalNetworkOrigin(origin)) {
      return { valid: true };
    }
    if (isLocalNetworkOrigin(referer)) {
      return { valid: true };
    }
  }

  // 🔒 في Production، نتحقق من Origin
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      return { valid: true };
    }
    return { valid: false, reason: `Invalid origin: ${origin}` };
  }

  // 🔒 Fallback إلى Referer
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (ALLOWED_ORIGINS.includes(refererOrigin)) {
      return { valid: true };
    }
    return { valid: false, reason: `Invalid referer: ${referer}` };
  }

  // 🔒 لا يوجد Origin أو Referer - نرفض في Production
  if (isProduction) {
    return { valid: false, reason: 'Missing origin header' };
  }

  return { valid: true };
}

/**
 * 🔒 قائمة Origins المسموحة (للتصدير)
 */
export function getAllowedOrigins(): string[] {
  return [...ALLOWED_ORIGINS];
}
