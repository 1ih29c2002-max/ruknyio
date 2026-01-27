# 🚀 Quick Start Guide - دليل البدء السريع

> دليل سريع لبدء استخدام Telegram Integration

---

## ✅ 5 دقائق فقط للبدء!

### الخطوة 1️⃣: إنشاء Bot على Telegram (2 دقائق)

```
1. افتح Telegram وابحث عن: @BotFather
2. أرسل: /newbot
3. اختر اسم البوت (مثل: RuknyBot)
4. اختر username فريد (مثل: rukny_bot)
5. سيعطيك Token مثل: 123456789:ABCDefGhIjKlMnOpQrStUvWxYz...
6. احفظ الـ Token
```

### الخطوة 2️⃣: إضافة البيانات في .env (1 دقيقة)

**الملف:** `apps/api/.env`

```env
# Copy وأضف هذه الأسطر:

TELEGRAM_BOT_TOKEN=123456789:ABCDefGhIjKlMnOpQrStUvWxYz...
TELEGRAM_BOT_NAME=RuknyBot
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TELEGRAM_ENABLED=true
```

### الخطوة 3️⃣: تشغيل Migration (1 دقيقة)

```bash
cd apps/api

# تشغيل migration
npx prisma migrate dev --name add_telegram_integration

# سيسأل: أريد أن أنشئ migration جديد؟
# اختر: yes
```

### الخطوة 4️⃣: بدء التطبيق (1 دقيقة)

```bash
# في نفس المجلد apps/api
npm run start:dev

# يجب أن ترى:
# [Nest] 12/24/2025, 12:00:00 AM     LOG [NestFactory] Starting Nest application...
# ...
# ✅ Webhook set successfully
```

---

## 🧪 اختبار سريع

### اختبار 1: إنشاء جلسة

```bash
# استخدم Postman أو curl

curl -X POST http://localhost:3001/api/telegram/generate-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# يجب تحصل على:
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123xyz",
    "botLink": "https://t.me/RuknyBot?start=sess_abc123xyz",
    "expiresAt": "2025-12-24T12:15:00Z"
  }
}
```

### اختبار 2: اختبار الربط

```bash
# 1. انسخ الـ botLink من الـ response أعلاه
# 2. افتحه في Telegram (أو انقر عليه)
# 3. سيفتح البوت وترسل: /start sess_abc123xyz
# 4. سيسأل: هل تريد ربط الحساب؟ (✅ تأكيد)
# 5. سيرسل رسالة: ✅ تم ربط الحساب بنجاح!
```

### اختبار 3: التحقق من حالة الربط

```bash
curl http://localhost:3001/api/telegram/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# يجب تحصل على:
{
  "success": true,
  "data": {
    "connected": true,
    "enabled": true,
    "chatId": "123456789",
    "username": "username",
    "firstName": "أحمد",
    "connectedAt": "2025-12-24T12:00:00Z"
  }
}
```

### اختبار 4: اختبار الإرسال

```bash
curl -X POST http://localhost:3001/api/telegram/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# يجب تستقبل رسالة في Telegram:
# ✅ اختبار الاتصال
# إذا رأيت هذه الرسالة، فالاتصال يعمل بشكل صحيح! 🎉
```

---

## 🔗 ربط مع Service الآخرى

### في AuthService: إرسال تنبيه دخول

```typescript
// src/domain/auth/auth.service.ts

import { TelegramIntegrationHelper } from '../../integrations/telegram/telegram.helper';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private telegramHelper: TelegramIntegrationHelper,
  ) {}

  async login(credentials: LoginDto, @Req() request: Request) {
    const user = await this.validateCredentials(credentials);
    
    // تسجيل الجلسة...
    const session = await this.createSession(user.id);

    // 📤 إرسال تنبيه
    await this.telegramHelper.sendLoginNotification(
      user.id,
      {
        device: `Chrome on Windows`,
        browser: 'Chrome',
        os: 'Windows',
      },
      {
        location: 'Cairo, Egypt',
        ip: request.ip,
      }
    );

    return { accessToken: session.accessToken };
  }
}
```

### في AuthModule: تسجيل الـ Helper

```typescript
// src/domain/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { TelegramModule } from '../../integrations/telegram/telegram.module';
import { TelegramIntegrationHelper } from '../../integrations/telegram/telegram.helper';

@Module({
  imports: [TelegramModule],
  providers: [
    AuthService,
    {
      provide: TelegramIntegrationHelper,
      inject: [TelegramService, PrismaService],
      useFactory: (telegramService, prismaService) =>
        new TelegramIntegrationHelper(telegramService, prismaService),
    },
  ],
})
export class AuthModule {}
```

---

## 🌐 للاختبار المحلي (ngrok)

### إذا كنت تختبر محلياً:

```bash
# 1. تثبيت ngrok
npm install -g ngrok

# 2. في terminal جديد، فتح tunnel
ngrok http 3333

# 3. سيظهر لك رابط مثل:
# https://7a9d-192-168-1-100.ngrok.io

# 4. حدّث .env
TELEGRAM_WEBHOOK_URL=https://7a9d-192-168-1-100.ngrok.io/api/telegram/webhook

# 5. أعد تشغيل التطبيق
npm run start:dev

# ✅ Webhook سيكون جاهز على الإنتاج الآن
```

---

## 📊 الملفات المهمة

```
✅ src/integrations/telegram/
   ├── telegram.service.ts ........... الخدمة الرئيسية
   ├── telegram-session.service.ts .. إدارة الجلسات
   ├── telegram.controller.ts ....... REST API
   ├── telegram-webhook.controller.ts استقبال Webhooks
   ├── telegram.helper.ts ........... دوال مساعدة
   ├── telegram.templates.ts ........ قوالب الرسائل
   └── README.md ................... توثيق كامل

✅ docs/02-features/
   ├── TELEGRAM_WEBHOOK_INTEGRATION.md
   ├── TELEGRAM_INTEGRATION_GUIDE.md
   ├── TELEGRAM_IMPLEMENTATION_CHECKLIST.md
   └── TELEGRAM_IMPLEMENTATION_SUMMARY.md
```

---

## 🎯 الخطوات التالية

### بعد الاختبار الناجح:

```
1. [ ] ربط مع AuthService
2. [ ] ربط مع SecurityService
3. [ ] إنشاء مهام مجدولة (Jobs)
4. [ ] اختبارات شاملة
5. [ ] نشر على الإنتاج
```

---

## 🆘 استكشاف الأخطاء

### المشكلة: "Webhook set successfully" لم تظهر

**الحل:**
- تأكد من `TELEGRAM_ENABLED=true`
- تأكد من Bot Token صحيح
- تحقق من الـ logs في console

### المشكلة: "Cannot create session" عند الاختبار

**الحل:**
- تأكد من تشغيل Migration
- تأكد من اتصال قاعدة البيانات
- شغل: `npx prisma migrate dev`

### المشكلة: "Invalid signature" في Webhook

**الحل:**
- تأكد من Bot Token صحيح
- تأكد من استخدام HTTPS (ngrok يوفره مجاناً)

---

## 💡 نصائح مهمة

```
✅ استخدم ngrok للاختبار المحلي
✅ احفظ Bot Token في مكان آمن
✅ لا تشاركها مع أحد
✅ استخدم HTTPS فقط للـ Webhook
✅ راقب الـ logs عند النشر
✅ اختبر قبل الإعلان
```

---

## 📚 موارد مفيدة

```
📖 Telegram Bot API
   https://core.telegram.org/bots/api

🤖 BotFather على Telegram
   https://t.me/botfather

🔧 ngrok للـ Tunneling
   https://ngrok.com

📘 NestJS Documentation
   https://docs.nestjs.com
```

---

## ⏱️ الوقت المتوقع

```
التثبيت والإعداد:     5 دقائق
الاختبار الأساسي:      10 دقائق
التكامل مع Services: 30-60 دقيقة
الاختبار الشامل:      1-2 ساعة
النشر:               30 دقيقة

الإجمالي: ساعة واحدة للبدء الكامل
```

---

## 🎉 تم!

الآن أنت مستعد للبدء! 🚀

**الخطوة التالية:**
```bash
cd apps/api
npm run start:dev
```

---

**للمزيد من المعلومات:**
- اقرأ [TELEGRAM_IMPLEMENTATION_SUMMARY.md](TELEGRAM_IMPLEMENTATION_SUMMARY.md)
- اقرأ [TELEGRAM_WEBHOOK_INTEGRATION.md](TELEGRAM_WEBHOOK_INTEGRATION.md)
- اقرأ [TELEGRAM_INTEGRATION_GUIDE.md](TELEGRAM_INTEGRATION_GUIDE.md)

---

**آخر تحديث:** 24 ديسمبر 2025
