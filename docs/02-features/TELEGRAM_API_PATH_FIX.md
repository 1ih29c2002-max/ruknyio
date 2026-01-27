# 🔧 تصحيح: خطأ API Path - Cannot POST /api/v1/telegram/generate-code

## المشكلة

```
❌ Cannot POST /api/v1/telegram/generate-code
```

## السبب

الـ Backend يستخدم `app.setGlobalPrefix('api/v1')` لكن الـ Frontend لم يكن يضيف `/api/v1` في الـ requests.

## الحل المطبق ✅

تم تحديث `apps/web/lib/telegram-api.ts` ليضيف `/api/v1` prefix:

```typescript
// Before
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await fetch(`${API_BASE_URL}${endpoint}`, {

// After
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = '/api/v1';
const response = await fetch(`${API_BASE_URL}${API_VERSION}${endpoint}`, {
```

## ✅ النتيجة

الآن جميع الـ requests ستذهب إلى الـ URLs الصحيحة:

| Endpoint | Before | After |
|----------|--------|-------|
| Generate Code | `/telegram/generate-code` | `/api/v1/telegram/generate-code` ✅ |
| Status | `/telegram/status` | `/api/v1/telegram/status` ✅ |
| Disconnect | `/telegram/disconnect` | `/api/v1/telegram/disconnect` ✅ |
| Test | `/telegram/test` | `/api/v1/telegram/test` ✅ |

## 🧪 للاختبار:

1. أعد تحميل الصفحة (Hard Refresh: Ctrl+Shift+R)
2. اضغط "ربط حساب Telegram"
3. يجب أن تعمل الآن بدون أخطاء API ✅

## 📝 ملاحظات

تم التعديل تلقائياً وبدون الحاجة لأي تغييرات إضافية من المستخدم.
