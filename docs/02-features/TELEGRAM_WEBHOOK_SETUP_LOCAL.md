# ⚠️ تنبيه مهم: تفعيل Telegram Webhook محلياً

## المشكلة

في بيئة التطوير المحلي، لا يمكن لـ Telegram الوصول إلى `localhost:3001` لأنه عنوان محلي غير متاح عبر الإنترنت.

## الحل

استخدم **ngrok** لإنشاء نفق آمن يربط بين Telegram وسيرفرك المحلي:

### 1️⃣ تثبيت ngrok

```bash
# Windows
choco install ngrok
# أو تحميل من https://ngrok.com/download

# Mac
brew install ngrok

# Linux
# تحميل من https://ngrok.com/download
```

### 2️⃣ تشغيل ngrok

```bash
ngrok http 3001
```

ستظهر شاشة مثل:
```
Forwarding    https://abc123def.ngrok.io -> http://localhost:3001
```

### 3️⃣ تحديث `.env`

نسخ الـ URL من ngrok وأضفه في `.env`:

```env
TELEGRAM_WEBHOOK_URL="https://abc123def.ngrok.io/api/v1/telegram/webhook"
```

### 4️⃣ إعادة تشغيل Backend

```bash
npm run dev
```

### 5️⃣ اختبر الآن

- افتح Frontend: http://localhost:3000/settings/security
- اضغط "ربط حساب Telegram"
- أرسل الـ code للبوت
- يجب أن يعمل الآن! ✅

---

## للإنتاج

استخدم اسم النطاق الحقيقي:

```env
TELEGRAM_WEBHOOK_URL="https://your-domain.com/api/v1/telegram/webhook"
```

---

## ملاحظات

⚠️ ngrok URL يتغير كل مرة تعيد تشغيله  
⚠️ استخدم الخطة المدفوعة لـ ngrok للحصول على URL ثابت  
✅ للـ localhost testing فقط، لا تستخدمه في الإنتاج
