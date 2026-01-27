# Google OAuth Setup Guide

## خطوات إعداد Google OAuth

### 1. إنشاء مشروع في Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. قم بإنشاء مشروع جديد أو اختر مشروع موجود
3. تفعيل Google+ API من APIs & Services > Library

### 2. إعداد OAuth 2.0 Credentials

1. اذهب إلى APIs & Services > Credentials
2. انقر على "Create Credentials" > "OAuth 2.0 Client IDs"
3. اختر "Web application"
4. أضف هذه URLs في Authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (للتطوير)
   - `https://yourdomain.com/auth/google/callback` (للإنتاج)

### 3. تحديث متغيرات البيئة

في ملف `.env` في مجلد `apps/api`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
```

### 4. الـ Endpoints المتاحة

#### Backend (API)

- `GET /auth/google` - بدء عملية Google OAuth
- `GET /auth/google/callback` - معالجة callback من Google

#### Frontend

- زر "تسجيل الدخول بواسطة Google" في صفحات Login و Register
- صفحة `/auth/callback` لمعالجة النتيجة

### 5. كيفية الاستخدام

1. المستخدم ينقر على زر "تسجيل الدخول بواسطة Google"
2. يتم توجيهه إلى Google للمصادقة
3. بعد المصادقة، Google يعيد توجيهه إلى callback endpoint
4. النظام يتحقق من بيانات Google ويسجل المستخدم
5. يتم توجيه المستخدم إلى Dashboard مع token

### 6. ميزات إضافية

- ربط حسابات Google بحسابات موجودة عبر البريد الإلكتروني
- تسجيل العمليات الأمنية
- دعم الصور الشخصية من Google
- التحقق التلقائي من البريد الإلكتروني للمستخدمين القادمين من Google

### 7. الأمان

- يتم حفظ Google ID في قاعدة البيانات لربط الحساب
- كلمة المرور تكون null للمستخدمين القادمين من Google فقط
- نفس نظام الجلسات والأمان المطبق على تسجيل الدخول العادي

### 8. استكشاف الأخطاء

#### خطأ "redirect_uri_mismatch"
تأكد من أن URL في Google Console يطابق تماماً `GOOGLE_CALLBACK_URL`

#### خطأ "invalid_client"
تحقق من `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET`

#### خطأ في Frontend
تأكد من أن `NEXT_PUBLIC_API_URL` يشير إلى API الصحيح