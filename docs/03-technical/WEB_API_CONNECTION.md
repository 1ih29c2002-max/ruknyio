# 🔗 دليل الاتصال بين Web و API

## 📋 نظرة عامة

يتصل تطبيق **Web (Next.js)** مع **API (NestJS)** عبر HTTP requests مع المصادقة باستخدام JWT في Cookies.

---

## 🏗️ البنية

```
┌─────────────────┐         HTTP/HTTPS         ┌─────────────────┐
│   Web (Next.js) │ ───────────────────────────▶│  API (NestJS)   │
│  localhost:3000 │         + Cookies           │  localhost:3001 │
│                 │ ◀───────────────────────────│                 │
└─────────────────┘         JSON Response       └─────────────────┘
```

---

## ⚙️ الإعداد

### 1. ملف `.env.local` للـ Web

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Rukny.io
NEXT_PUBLIC_GOOGLE_CLIENT_ID=340538807682-00isdi0mul9ftvqlg509n9oa9d223396.apps.googleusercontent.com
```

### 2. ملف `.env` للـ API

```bash
# apps/api/.env
DATABASE_URL="postgresql://rukny_admin:password@localhost:5432/rukny_io"
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:3000"
ALLOW_COOKIE_AUTH="true"
```

---

## 🔌 كيفية الاتصال

### الطريقة 1: استخدام API Client (موصى به)

```typescript
import { apiClient, authAPI } from '@/lib/api';

// جلب بيانات المستخدم
const user = await authAPI.me();

// تسجيل الدخول
const response = await authAPI.login({ 
  email: 'user@example.com', 
  password: 'password' 
});

// جلب الفعاليات
const events = await apiClient.get('/events');

// إنشاء فعالية
const newEvent = await apiClient.post('/events', {
  title: 'My Event',
  description: 'Event description',
  startDate: new Date(),
});
```

### الطريقة 2: استخدام fetch مباشرة

```typescript
const response = await fetch('http://localhost:3001/api/events', {
  method: 'GET',
  credentials: 'include', // مهم لإرسال الكوكيز
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

---

## 🔐 المصادقة (Authentication)

### نظام المصادقة المستخدم

المشروع يستخدم **QuickSign** (Magic Link) و **Google OAuth** فقط - **لا يوجد نظام Email + Password تقليدي**.

### كيف تعمل QuickSign؟

1. **المستخدم يُدخل بريده الإلكتروني فقط**
2. **API ترسل رابط سحري** (Magic Link) للبريد (صالح لمدة 10 دقائق)
3. **المستخدم يضغط على الرابط:**
   - **مستخدم موجود** → تسجيل دخول مباشر
   - **IP جديد** → طلب رمز تحقق إضافي
   - **مستخدم جديد** → طلب إكمال الملف الشخصي (الاسم + اسم المستخدم)
4. **API ترسل JWT في Cookie** تلقائياً
5. **كل طلب لاحق** يرسل الكوكي مع `credentials: 'include'`

### مثال: نموذج QuickSign

```typescript
// في مكون React
'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function QuickSignForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authAPI.quickSignRequest({ email });
      
      if (response.type === 'LOGIN') {
        setMessage('✅ تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني');
      } else {
        setMessage('✅ تم إرسال رابط التسجيل إلى بريدك الإلكتروني');
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'حدث خطأ'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="أدخل بريدك الإلكتروني"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'جاري الإرسال...' : '⚡ إرسال رابط الدخول'}
        </button>
      </form>
      
      {message && <p>{message}</p>}
      
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => authAPI.googleLogin()}>
          🔐 تسجيل الدخول عبر Google
        </button>
      </div>
    </div>
  );
}
```

### مثال: التحقق من Token (صفحة Callback)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function QuickSignVerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        const response = await authAPI.quickSignVerify(token);

        if (response.requiresProfileCompletion) {
          // إظهار نموذج إكمال الملف
          setStatus('needs_profile');
        } else {
          // تسجيل دخول ناجح
          setStatus('success');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        setStatus('error');
      }
    }

    verify();
  }, [token]);

  if (status === 'loading') return <div>جاري التحقق...</div>;
  if (status === 'error') return <div>رابط غير صالح أو منتهي</div>;
  if (status === 'success') return <div>تم تسجيل الدخول بنجاح!</div>;

  return null;
}
```

---

## 📡 Endpoints المتاحة

### Authentication (QuickSign + Google OAuth)

#### QuickSign
- `POST /auth/quicksign/request` - طلب رابط QuickSign
- `GET /auth/quicksign/verify/:token` - التحقق من الرابط
- `POST /auth/quicksign/auth-verify` - التحقق من IP جديد
- `POST /auth/quicksign/complete-profile` - إكمال الملف الشخصي (للمستخدمين الجدد)
- `POST /auth/quicksign/resend` - إعادة إرسال الرابط
- `GET /auth/quicksign/check-username/:username` - التحقق من توفر اسم المستخدم

#### Google OAuth
- `GET /auth/google` - بدء OAuth (redirect)
- `GET /auth/google/callback` - معالجة الرد من Google
- `POST /auth/oauth/exchange` - تبديل الكود بـ Token
- `GET /auth/google/status` - حالة ربط حساب Google
- `POST /auth/google/disconnect` - فك ربط حساب Google

#### Common
- `GET /auth/me` - جلب بيانات المستخدم الحالي
- `POST /auth/logout` - تسجيل الخروج
- `POST /auth/socket-token` - الحصول على token للـ WebSocket

### Users
- `GET /users/me` - جلب بيانات المستخدم
- `PUT /users/me` - تحديث بيانات المستخدم
- `DELETE /users/me` - حذف الحساب

### Events
- `GET /events` - جلب الفعاليات
- `GET /events/:id` - جلب فعالية واحدة
- `POST /events` - إنشاء فعالية
- `PUT /events/:id` - تحديث فعالية
- `DELETE /events/:id` - حذف فعالية

### Forms
- `GET /forms/public/:slug` - جلب نموذج عام
- `POST /forms/public/:slug/submit` - إرسال نموذج
- `GET /forms` - جلب نماذجي
- `POST /forms` - إنشاء نموذج

### Profiles
- `GET /profiles/:username` - جلب ملف شخصي
- `PUT /profiles/me` - تحديث ملفي الشخصي

### Social Links
- `GET /social-links/my-links` - جلب روابطي
- `POST /social-links` - إنشاء رابط
- `PUT /social-links/:id` - تحديث رابط
- `DELETE /social-links/:id` - حذف رابط

---

## 🧪 اختبار الاتصال

### 1. تشغيل API

```bash
cd apps/api
npm run start:dev
```

### 2. تشغيل Web

```bash
cd apps/web
npm run dev
```

### 3. اختبار من المتصفح

افتح: `http://localhost:3000`

افتح Console وجرب:

```javascript
// اختبار جلب الفعاليات
fetch('http://localhost:3001/api/events', {
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## ⚠️ مشاكل شائعة وحلولها

### 1. CORS Error

**المشكلة:** `Access to fetch has been blocked by CORS policy`

**الحل:** تأكد من أن `FRONTEND_URL` في `.env` للـ API يطابق رابط Web:

```bash
FRONTEND_URL="http://localhost:3000"
```

### 2. Cookies لا ترسل

**المشكلة:** API لا تستقبل الكوكيز

**الحل:** تأكد من إضافة `credentials: 'include'` في كل fetch request:

```typescript
fetch('http://localhost:3001/api/endpoint', {
  credentials: 'include', // مهم جداً!
});
```

### 3. 401 Unauthorized

**المشكلة:** API ترجع 401

**الحل:** 
- تأكد من تسجيل الدخول أولاً
- تأكد من أن `ALLOW_COOKIE_AUTH="true"` في `.env` للـ API

### 4. Port Already in Use

**المشكلة:** Port 3000 أو 3001 مستخدم

**الحل:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# أو غيّر البورت في .env
PORT=3002
```

---

## 📚 ملفات مهمة

```
apps/
├── web/
│   ├── .env.local                      # إعدادات Web
│   ├── src/
│   │   └── lib/
│   │       └── api/
│   │           ├── client.ts           # API Client الرئيسي
│   │           ├── auth.ts             # Authentication APIs
│   │           ├── index.ts            # Exports
│   │           └── examples.ts         # أمثلة الاستخدام
│   └── next.config.ts                  # إعدادات Next.js
│
└── api/
    ├── .env                            # إعدادات API
    └── src/
        ├── main.ts                     # CORS Configuration
        └── modules/
            └── auth/                   # Authentication Module
```

---

## 🚀 الخطوات التالية

1. ✅ تم إنشاء `.env.local` للـ Web
2. ✅ تم إنشاء API Client
3. ✅ تم إعداد CORS في API
4. 🔄 **اختبر الاتصال** عبر المتصفح
5. 🔄 **أنشئ صفحات** تستخدم API Client

---

## 💡 نصائح

- استخدم `apiClient` بدلاً من `fetch` المباشر
- دائماً أضف `credentials: 'include'` للـ cookies
- تحقق من Console للأخطاء
- استخدم Swagger Docs للـ API: `http://localhost:3001/api/docs`

---

تم! الآن Web و API متصلين ✅
