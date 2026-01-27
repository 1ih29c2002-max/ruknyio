# 🔒 دليل تحسينات الأمان - Rukny.io

## نظرة عامة

تم تطبيق نظام أمان متكامل يتبع أفضل الممارسات لحماية المصادقة وإدارة الجلسات.

---

## ⚠️ مبدأ التصميم الأساسي

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🔒 فصل التوكنز                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Refresh Token  →  httpOnly Cookie (حماية XSS)                            │
│   Access Token   →  Memory + Authorization Header (حماية CSRF)             │
│                                                                             │
│   لماذا؟                                                                    │
│   - Cookie يُرسل تلقائياً → عرضة لـ CSRF                                    │
│   - Authorization Header يُضاف يدوياً → آمن من CSRF                        │
│   - httpOnly Cookie لا يُقرأ بـ JavaScript → آمن من XSS                    │
│                                                                             │
│   CSRF Attack Surface:  /auth/refresh فقط ✅                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. نظام الجلسات الهجين (Hybrid Sessions)

### المفهوم
```
User Login → Access Token (Memory) + Refresh Token (Cookie) + Session (DB)
```

### المكونات

| المكون | التخزين | الإرسال | مدة الصلاحية |
|--------|---------|---------|--------------|
| **Access Token** | Memory (Frontend) | Authorization Header | 15 دقيقة |
| **Refresh Token** | httpOnly Cookie | تلقائي مع Cookie | 30 يوم |
| **Session Record** | PostgreSQL | - | يُحدّث مع كل استخدام |

### الفوائد
- ✅ حماية CSRF (Access Token لا يُرسل تلقائياً)
- ✅ حماية XSS (Refresh Token في httpOnly)
- ✅ تجربة مستخدم جيدة (تجديد تلقائي)
- ✅ إمكانية إبطال الجلسات فوراً
- ✅ تسجيل خروج من جميع الأجهزة

---

## 2. إعداد الكوكيز الآمنة

### ملف: `cookie.config.ts`

```typescript
// Refresh Token Cookie
httpOnly: true,        // 🔒 حماية XSS - لا يمكن قراءته بـ JavaScript
secure: true,          // 🔒 HTTPS فقط في الإنتاج
sameSite: 'lax',       // 🔒 يسمح بـ OAuth redirects + حماية CSRF أساسية
path: '/api/v1/auth',  // 🔒 متاح فقط لمسارات المصادقة
maxAge: 30 * 24 * 60 * 60 * 1000 // 30 يوم

// ⚠️ Access Token لا يُخزن في Cookie
// يُخزن في Memory ويُرسل في Authorization header
```

### لماذا `SameSite=Lax` بدلاً من `Strict`؟

| SameSite | OAuth Redirect | روابط خارجية | CSRF Protection |
|----------|---------------|--------------|-----------------|
| `strict` | ❌ لا يعمل | ❌ لا يعمل | ✅ كامل |
| `lax` | ✅ يعمل | ✅ يعمل | ✅ جزئي (GET فقط) |
| `none` | ✅ يعمل | ✅ يعمل | ❌ لا حماية |

**المشكلة مع `strict`:**
- عند العودة من Google OAuth، الكوكي لا يُرسل
- فتح رابط من البريد لا يرسل الكوكي

**الحل:** `lax` + حماية CSRF إضافية

---

## 3. حماية CSRF للـ Refresh Endpoint

بما أننا نستخدم `SameSite=Lax`، نضيف حماية CSRF إضافية:

```typescript
// في /auth/refresh
const csrfCheck = validateCsrfOrigin(req);
if (!csrfCheck.valid) {
  throw new ForbiddenException('CSRF validation failed');
}
```

### آلية الحماية:
1. **Origin Header** - يتحقق من أن الطلب من الـ Frontend
2. **Referer Header** - fallback إذا لم يوجد Origin
3. **Rate Limiting** - 30 طلب/دقيقة

### لماذا هذا آمن؟
- `SameSite=Lax` يمنع إرسال الكوكي مع POST من مواقع أخرى
- Origin validation يتحقق من مصدر الطلب
- حتى لو تمكن المهاجم من إرسال الكوكي، لن يمر من Origin check

---

## 4. تدفق المصادقة

### تسجيل الدخول (OAuth)
```
1. User → /auth/google
2. Google → /auth/google/callback
3. Backend:
   - إنشاء Access Token + Refresh Token
   - Refresh Token → Set-Cookie (httpOnly, SameSite=Lax)
   - Access Token → OAuth Code → Frontend
4. Frontend:
   - Exchange Code → Access Token
   - تخزين Access Token في Memory
   - إرساله في Authorization header
```

### تجديد التوكن
```
1. Frontend: Access Token انتهى (401)
2. Frontend → POST /auth/refresh
   - Cookie يُرسل تلقائياً (SameSite=Lax يسمح)
   - Origin header يُرسل للتحقق من CSRF
3. Backend:
   - ✅ CSRF check (Origin validation)
   - ✅ التحقق من Refresh Token
   - إنشاء Access Token + Refresh Token جديدين
   - Refresh Token الجديد → Set-Cookie
   - Access Token الجديد → Response Body
4. Frontend:
   - تخزين Access Token الجديد في Memory
   - إعادة المحاولة
```

---

## 5. جدول الجلسات المحسّن

### لماذا لا نخزن Access Token Hash؟

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ❌ الطريقة القديمة (غير فعالة):                                            │
│     كل طلب: hash(accessToken) → DB lookup → مقارنة                         │
│     مشكلة: JWT يجب أن يكون Stateless                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ الطريقة الجديدة (فعالة):                                                │
│     JWT payload: { sub: userId, sid: sessionId, ... }                      │
│     كل طلب: sessionId → DB lookup → isRevoked?                             │
│     فائدة: Revocation سريع + JWT Stateless                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### الحقول في `Session`

```prisma
model Session {
  id                String    @id @default(uuid())
  userId            String
  
  // 🔒 فقط Refresh Token Hash (لا Access Token)
  // Access Token يحتوي على sid (Session ID) للربط
  refreshTokenHash  String?   @unique
  
  // معلومات الجهاز
  deviceName        String?
  deviceType        String?
  browser           String?
  os                String?
  ipAddress         String?
  userAgent         String?
  
  // أوقات الانتهاء
  expiresAt         DateTime  // Session expiry
  refreshExpiresAt  DateTime? // Refresh Token expiry
  
  // 🔒 التحكم في الإبطال
  isRevoked         Boolean   @default(false)
  revokedAt         DateTime?
  revokedReason     String?
  
  // 🔒 تتبع التدوير
  rotationCount     Int       @default(0)
  lastRotatedAt     DateTime?
}
```

### JWT Payload

```typescript
{
  sub: "user-uuid",           // User ID
  sid: "session-uuid",        // Session ID للتحقق من الجلسة
  email: "user@example.com",
  type: "access",
  iat: 1734567890,            // Issued At
  exp: 1734568790             // Expires (15 min)
}
```

### آلية Revocation

```typescript
// في jwt.strategy.ts
const session = await prisma.session.findUnique({
  where: { id: payload.sid }  // sessionId من JWT
});

if (session.isRevoked) {
  throw new UnauthorizedException('Session revoked');
}
```

---

## 6. تحسينات OAuth (Google & LinkedIn)

### التحقق من email_verified

```typescript
// Google Strategy
if (primaryEmail.verified === false) {
  throw new UnauthorizedException('البريد غير مُتحقق منه');
}

// LinkedIn Strategy
if (userInfo.email_verified === false) {
  throw new UnauthorizedException('البريد غير مُتحقق منه');
}
```

### Provider Isolation
- كل مزود خدمة له ID منفصل (`googleId`, `linkedinId`)
- نفس الإيميل من Google ≠ LinkedIn إلا إذا تم الربط صراحة

---

## 6. تحسينات Magic Link (QuickSign)

### قواعد الأمان

| القاعدة | القيمة |
|---------|--------|
| مدة الصلاحية | 15 دقيقة |
| الاستخدام | مرة واحدة فقط |
| Rate Limit | 3 طلبات / 15 دقيقة |
| إبطال الروابط السابقة | تلقائي عند طلب جديد |

### التحقق من IP
```
1. المستخدم يفتح الرابط
2. إذا IP جديد → إرسال رمز تحقق بالبريد
3. المستخدم يدخل الرمز
4. تحديث lastKnownIP
5. إصدار الجلسة
```

---

## 7. API Endpoints الجديدة

### تجديد التوكنز
```
POST /auth/refresh
Cookie: refresh_token=xxx

Response: {
  success: true,
  access_token: "..."  // للتطبيقات المحمولة
}
+ Set-Cookie: access_token=..., refresh_token=...
```

### الجلسات النشطة
```
GET /auth/sessions
Authorization: Bearer xxx

Response: [
  {
    id: "...",
    deviceName: "Chrome on Windows",
    browser: "Chrome",
    os: "Windows",
    ipAddress: "192.168.1.1",
    lastActivity: "2024-12-19T10:00:00Z"
  }
]
```

### تسجيل الخروج من جميع الأجهزة
```
POST /auth/logout-all
Authorization: Bearer xxx

Response: {
  success: true,
  message: "تم تسجيل الخروج من 3 جهاز",
  devicesLoggedOut: 3
}
```

---

## 8. تنفيذ Migration

### الخطوات المطلوبة

1. **تحديث Prisma Schema** ✅ (تم)
```bash
# تم تحديث schema.prisma
```

2. **إنشاء Migration**
```bash
cd apps/api
npx prisma migrate dev --name add_session_security_fields
```

3. **تحديث Prisma Client**
```bash
npx prisma generate
```

4. **تنظيف الجلسات القديمة** (اختياري)
```sql
-- حذف الجلسات القديمة التي لا تحتوي على الحقول الجديدة
UPDATE sessions SET is_revoked = false WHERE is_revoked IS NULL;
```

---

## 9. Frontend Integration

### تحديث AuthClient

```typescript
// lib/auth/auth-client.ts

export class AuthClient {
  // تجديد التوكنز تلقائياً
  static async refreshTokens(): Promise<boolean> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // ✅ مهم للكوكيز
    });
    return response.ok;
  }

  // Axios/Fetch Interceptor
  // إذا كان الرد 401 → حاول تجديد التوكن
  // إذا فشل التجديد → أعد توجيه لتسجيل الدخول
}
```

### مثال على Interceptor

```typescript
// في api-client.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await AuthClient.refreshTokens();
      if (refreshed) {
        // أعد المحاولة
        return api.request(error.config);
      }
      // وجّه لتسجيل الدخول
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 10. الأمان الإضافي

### Rate Limiting (محدود في الكود)

| Endpoint | الحد |
|----------|------|
| `/auth/quicksign/request` | 3 / 15 دقيقة |
| `/auth/quicksign/resend` | 2 / دقيقة |
| `/auth/refresh` | 30 / دقيقة |
| `/auth/oauth/exchange` | 20 / دقيقة |

### Security Logging
- كل تسجيل دخول يُسجّل في `SecurityLog`
- يشمل: IP, Device, Browser, OS, UserAgent
- يمكن مراجعته من لوحة التحكم

### Device Detection
- اكتشاف الأجهزة الجديدة
- إرسال إشعار للمستخدم عند تسجيل دخول من جهاز جديد

---

## 11. الملفات المُحدّثة

| الملف | التغييرات |
|-------|-----------|
| `prisma/schema.prisma` | إضافة حقول الأمان للجلسات |
| `cookie.config.ts` | إعدادات الكوكيز الآمنة |
| `token.service.ts` | خدمة إدارة التوكنز |
| `auth.service.ts` | تحديث لدعم Refresh Token |
| `auth.controller.ts` | endpoints جديدة |
| `jwt.strategy.ts` | التحقق من الجلسات المُبطلة |
| `google.strategy.ts` | التحقق من email_verified |
| `linkedin.strategy.ts` | التحقق من email_verified |
| `quicksign.service.ts` | تحسين أمان Magic Link |

---

## 12. قائمة التحقق للنشر

- [ ] تشغيل `prisma migrate dev`
- [ ] تشغيل `prisma generate`
- [ ] اختبار `/auth/refresh` endpoint
- [ ] اختبار `/auth/sessions` endpoint
- [ ] اختبار `/auth/logout-all` endpoint
- [ ] اختبار OAuth مع email_verified
- [ ] اختبار QuickSign مع الإعدادات الجديدة
- [ ] تحديث Frontend للتعامل مع Refresh Token
- [ ] مراجعة Rate Limits
