# استخدام CallbackUrl في المشروع - نظام محسّن وآمن

## 📋 نظرة عامة

تم إضافة نظام `callbackUrl` محسّن وآمن للمشروع مع middleware قوي وحماية متعددة المستويات.

## 🔒 الميزات الأمنية

### 1. **Middleware Protection**
- حماية تلقائية للصفحات المحمية
- إعادة توجيه آمنة مع حفظ query parameters
- Headers أمنية إضافية
- منع الوصول لصفحات المصادقة للمستخدمين المسجلين

### 2. **Secure Token Storage**
- تخزين في localStorage للوصول السريع
- تخزين في Cookies آمنة للـ middleware
- SameSite=Strict لحماية من CSRF
- Secure flag في Production (HTTPS only)
- انتهاء صلاحية تلقائي بعد 7 أيام

### 3. **Smart Redirect**
- حفظ المسار الكامل مع query parameters
- إعادة توجيه تلقائية بعد تسجيل الدخول
- منع loops إعادة التوجيه اللانهائية

---

## 🚀 كيفية الاستخدام

### **الطريقة 1: استخدام Hook (الأسهل)**

```tsx
import { useRequireAuth } from '@/lib/useRequireAuth';

function SettingsPage() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>مرحباً {user?.name}</h1>
      {/* محتوى محمي */}
    </div>
  );
}
```

### **الطريقة 2: استخدام HOC**

```tsx
import { withAuth } from '@/lib/useRequireAuth';

function SettingsPage() {
  return <div>محتوى محمي</div>;
}

export default withAuth(SettingsPage);
```

### **الطريقة 3: استخدام Hook مع خيارات متقدمة**

```tsx
import { useRequireAuth } from '@/lib/useRequireAuth';

function SettingsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth({
    redirectToLogin: true,
    callbackUrl: '/settings/profile', // مسار مخصص
    redirectDelay: 500, // تأخير نصف ثانية
  });
  
  if (isLoading) return <Loading />;
  
  return <PageContent />;
}
```

---

## 🛡️ الصفحات المحمية

```typescript
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/stores',
  '/events',
  '/analytics',
];
```

---

## 📝 أمثلة عملية

### **مثال 1: صفحة إعدادات محمية**

```tsx
'use client';

import { useRequireAuth } from '@/lib/useRequireAuth';

export default function SettingsPage() {
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#CBE957]"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>الإعدادات</h1>
      <p>مرحباً {user?.name}</p>
    </div>
  );
}
```

### **مثال 2: زر يتطلب تسجيل دخول**

```tsx
import { getToken, getLoginUrl } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

function CreateStoreButton() {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleClick = () => {
    if (!getToken()) {
      router.push(getLoginUrl(pathname));
      return;
    }
    
    router.push('/stores/create');
  };
  
  return (
    <button onClick={handleClick}>
      إنشاء متجر جديد
    </button>
  );
}
```

### **مثال 3: API Request آمن**

```tsx
import { getToken, removeToken, redirectToLogin } from '@/lib/auth';

async function fetchProtectedData() {
  const token = getToken();
  
  if (!token) {
    redirectToLogin();
    return;
  }
  
  const res = await fetch(`${API_URL}/protected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (res.status === 401) {
    // Token منتهي
    removeToken();
    redirectToLogin(window.location.pathname);
    return;
  }
  
  return res.json();
}
```

---

## 🔧 التخصيص

### إضافة مسارات محمية جديدة

```typescript
// middleware.ts
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/your-new-route', // ← أضف هنا
];
```

### تخصيص مدة صلاحية Token

```typescript
// lib/auth.ts - في دالة setToken
const maxAge = 60 * 60 * 24 * 30; // 30 يوم بدلاً من 7
```

---

## 🎯 الفوائد

✅ **أمان محسّن** - Cookies آمنة مع SameSite و Secure flags
✅ **تجربة مستخدم سلسة** - العودة التلقائية للصفحة المطلوبة
✅ **سهولة الاستخدام** - Hooks و HOCs جاهزة
✅ **حماية متعددة المستويات** - Middleware + Client-side checks
✅ **منع CSRF** - SameSite=Strict على جميع الـ cookies

---

## 📌 ملاحظات أمنية مهمة

### 1. **في Production:**
```typescript
// تأكد من تفعيل HTTPS
// الـ Secure flag سيُفعّل تلقائياً
```

### 2. **تنظيف Token:**
```typescript
// يتم مسح Token من localStorage و Cookies معاً
removeToken();
```

### 3. **التحقق من Token:**
```typescript
// Middleware يفحص وجود Token فقط
// التحقق الكامل يحدث في API
```

---

## 🐛 استكشاف الأخطاء

### **المشكلة: Middleware يعطي 404**
**الحل:** تأكد من matcher صحيح وعدم تضارب مع ملفات أخرى

### **المشكلة: Token غير موجود بعد تسجيل الدخول**
**الحل:** تأكد من استدعاء `setToken()` بشكل صحيح

### **المشكلة: Loop إعادة توجيه**
**الحل:** تأكد من عدم وجود `/login` في `protectedRoutes`

---

## 📚 ملفات النظام

### الملفات الرئيسية:
- ✅ `middleware.ts` - حماية Routes
- ✅ `lib/auth.ts` - إدارة Token
- ✅ `lib/useRequireAuth.ts` - Hooks للحماية
- ✅ `features/auth/LoginPage.tsx` - صفحة تسجيل الدخول
- ✅ `shared/contexts/AuthContext.tsx` - Context المصادقة

---

## 🔄 تدفق العمل

```
1. المستخدم يحاول → /settings
2. Middleware يتحقق من Cookie
3. لا يوجد Token ❌
4. Redirect → /login?callbackUrl=/settings
5. تسجيل دخول ناجح ✅
6. Token يُحفظ في Cookie + localStorage
7. Redirect → /settings
8. الوصول مسموح ✅
```

---

تم التحديث: 31 أكتوبر 2025
النسخة: 2.0 - محسّنة وآمنة

## ✨ الميزات المضافة

### 1. **Middleware Protection**
- حماية تلقائية للصفحات المحمية
- إعادة توجيه تلقائية لصفحة تسجيل الدخول مع حفظ الوجهة الأصلية

### 2. **Smart Redirect**
- بعد تسجيل الدخول الناجح، يتم إعادة المستخدم للصفحة التي كان يحاول الوصول إليها
- إذا لم يكن هناك callback، يذهب للوحة التحكم افتراضياً

### 3. **Helper Functions**
- دوال مساعدة لإنشاء روابط تسجيل الدخول مع callback

---

## 🚀 كيفية الاستخدام

### **1. الاستخدام التلقائي (عبر Middleware)**

عند محاولة الوصول لصفحة محمية بدون تسجيل دخول:

```typescript
// المستخدم يحاول الوصول إلى: /settings
// سيتم إعادة توجيهه تلقائياً إلى: /login?callbackUrl=%2Fsettings
// بعد تسجيل الدخول، سيعود إلى: /settings
```

### **2. الاستخدام اليدوي في الكود**

```typescript
import { getLoginUrl, redirectToLogin } from '@/lib/auth';

// الطريقة 1: الحصول على رابط تسجيل الدخول
const loginUrl = getLoginUrl('/settings');
// النتيجة: /login?callbackUrl=%2Fsettings

// الطريقة 2: إعادة توجيه مباشرة
redirectToLogin('/settings');
// سيتم إعادة التوجيه فوراً لصفحة تسجيل الدخول مع callback
```

### **3. استخدام في Router**

```typescript
import { useRouter } from 'next/navigation';
import { getLoginUrl } from '@/lib/auth';

function SomeComponent() {
  const router = useRouter();
  
  const handleProtectedAction = () => {
    const token = getToken();
    if (!token) {
      // إعادة توجيه لتسجيل الدخول مع الاحتفاظ بالصفحة الحالية
      router.push(getLoginUrl(window.location.pathname));
      return;
    }
    
    // تنفيذ العملية المحمية
  };
}
```

### **4. استخدام في Links**

```typescript
import Link from 'next/link';
import { getLoginUrl } from '@/lib/auth';

function ProtectedLink() {
  const isLoggedIn = !!getToken();
  
  return (
    <Link href={isLoggedIn ? '/settings' : getLoginUrl('/settings')}>
      الإعدادات
    </Link>
  );
}
```

---

## 🛡️ الصفحات المحمية

الصفحات التالية محمية تلقائياً عبر middleware:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/stores',
  '/events',
  '/analytics',
];
```

---

## 📝 أمثلة عملية

### **مثال 1: حماية صفحة الإعدادات**

```typescript
// apps/web/src/app/settings/page.tsx
'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { redirectToLogin } from '@/lib/auth';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // سيتم إعادة التوجيه مع حفظ مسار الإعدادات
      redirectToLogin('/settings');
    }
  }, [user, loading]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  
  return <div>Settings Content</div>;
}
```

### **مثال 2: زر يتطلب تسجيل دخول**

```typescript
import { getToken } from '@/lib/auth';
import { getLoginUrl } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function CreateStoreButton() {
  const router = useRouter();
  
  const handleClick = () => {
    const token = getToken();
    
    if (!token) {
      // إعادة توجيه لتسجيل الدخول مع العودة لصفحة إنشاء المتجر
      router.push(getLoginUrl('/stores/create'));
      return;
    }
    
    // الانتقال لصفحة إنشاء المتجر
    router.push('/stores/create');
  };
  
  return (
    <button onClick={handleClick}>
      إنشاء متجر جديد
    </button>
  );
}
```

### **مثال 3: API Request مع معالجة 401**

```typescript
async function fetchProtectedData() {
  const token = getToken();
  
  const res = await fetch(`${API_URL}/protected-data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (res.status === 401) {
    // Token منتهي أو غير صالح
    removeToken();
    redirectToLogin(window.location.pathname);
    return;
  }
  
  return res.json();
}
```

---

## 🔧 التخصيص

### إضافة مسارات محمية جديدة

قم بتعديل ملف `middleware.ts`:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/stores',
  '/events',
  '/analytics',
  '/your-new-route', // ← أضف المسار الجديد هنا
];
```

### تغيير الوجهة الافتراضية

في ملف `LoginPage.tsx`:

```typescript
const callbackUrl = searchParams.get('callbackUrl') || '/your-default-page';
```

---

## 🎯 فوائد النظام

✅ **تجربة مستخدم أفضل** - المستخدم يعود للصفحة التي كان يريدها بعد تسجيل الدخول

✅ **أمان محسّن** - حماية تلقائية للصفحات الحساسة

✅ **كود أنظف** - لا حاجة لتكرار كود الحماية في كل صفحة

✅ **مرونة عالية** - سهل التخصيص والتوسع

---

## 📌 ملاحظات مهمة

1. **Token Storage**: يتم تخزين التوكن في localStorage و cookies معاً
   - localStorage للوصول السريع في JavaScript
   - Cookies للوصول في middleware

2. **Security**: تأكد من استخدام `httpOnly` cookies في production للأمان:
   ```typescript
   document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
   ```

3. **Cleanup**: يتم مسح التوكن من كلا المكانين عند تسجيل الخروج

---

## 🐛 استكشاف الأخطاء

### المشكلة: Middleware لا يعمل
**الحل**: تأكد من وجود ملف `middleware.ts` في المسار الصحيح: `apps/web/src/middleware.ts`

### المشكلة: Token غير موجود في middleware
**الحل**: تأكد من حفظ التوكن في cookies أيضاً في دالة `setToken()`

### المشكلة: Loop إعادة توجيه لا نهائي
**الحل**: تأكد من عدم إضافة صفحات المصادقة (`/login`, `/register`) في `protectedRoutes`

---

## 📚 ملفات ذات صلة

- `apps/web/src/middleware.ts` - Middleware للحماية
- `apps/web/src/lib/auth.ts` - دوال المصادقة والـ helpers
- `apps/web/src/features/auth/LoginPage.tsx` - صفحة تسجيل الدخول
- `apps/web/src/shared/contexts/AuthContext.tsx` - Context للمصادقة

---

تم التحديث: 31 أكتوبر 2025
