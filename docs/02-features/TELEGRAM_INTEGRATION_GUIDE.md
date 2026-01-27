# 🔗 Telegram Integration Guide - دليل التكامل

## كيفية استخدام Telegram Integration من الـ Services

### 📌 المقدمة

هذا الدليل يشرح كيفية دمج Telegram notifications مع خدماتك الموجودة مثل AuthService و SecurityService.

---

## 1️⃣ إضافة TelegramService و Helper إلى Service

### مثال: AuthService

```typescript
// src/domain/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { TelegramService } from '../../integrations/telegram/telegram.service';
import { TelegramIntegrationHelper } from '../../integrations/telegram/telegram.helper';

@Injectable()
export class AuthService {
  constructor(
    // ... الـ dependencies الأخرى
    private telegramService: TelegramService,
    private telegramHelper: TelegramIntegrationHelper,
  ) {}

  // ...
}
```

---

## 2️⃣ إرسال تنبيهات عند تسجيل الدخول

### الحالة 1: دخول جديد

```typescript
// في auth.service.ts

async handleLogin(user: User, request: Request) {
  const { device, browser, os } = parseUserAgent(request.headers['user-agent']);
  const { location, ip } = await getGeolocation(request.ip);

  // تسجيل الجلسة...
  const session = await this.createSession(user.id);

  // ✅ إرسال تنبيه Telegram
  await this.telegramHelper.sendLoginNotification(
    user.id,
    { device: `${browser} on ${os}`, browser, os },
    { location, ip }
  );

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}
```

### الحالة 2: محاولات دخول فاشلة

```typescript
// في auth.service.ts

async handleFailedLogin(email: string, request: Request) {
  const { ip } = getClientIp(request);
  const { location } = await getGeolocation(ip);

  // تسجيل المحاولة الفاشلة...
  const failedAttempts = await this.getFailedAttempts(email);

  // ⚠️ إرسال تنبيه بعد 3 محاولات فاشلة
  if (failedAttempts >= 3) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await this.telegramHelper.sendFailedLoginAlert(user.id, {
        attempts: failedAttempts,
        location,
        ip,
        reason: 'بيانات دخول غير صحيحة',
      });
    }
  }

  throw new UnauthorizedException('بيانات دخول غير صحيحة');
}
```

---

## 3️⃣ تنبيهات الأمان (Security Service)

### مثال: تغيير كلمة المرور

```typescript
// src/infrastructure/security/security.service.ts

import { TelegramIntegrationHelper } from '../../integrations/telegram/telegram.helper';

@Injectable()
export class SecurityService {
  constructor(
    private prisma: PrismaService,
    private telegramHelper: TelegramIntegrationHelper,
  ) {}

  async changePassword(userId: string, newPassword: string, deviceInfo: any) {
    // تحديث كلمة المرور...
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 📤 إرسال تنبيه
    await this.telegramHelper.sendPasswordChangeNotification(userId, {
      device: deviceInfo.device,
    });
  }
}
```

### مثال: تفعيل التحقق الثنائي

```typescript
async enableTwoFactor(userId: string) {
  // تفعيل 2FA...
  await this.prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true },
  });

  // 🔐 إرسال تنبيه
  await this.telegramHelper.sendTwoFactorEnabledNotification(userId);
}
```

---

## 4️⃣ ملخصات النشاط

### مثال: مهمة مجدولة يومية

```typescript
// src/infrastructure/jobs/daily-summary.job.ts

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TelegramIntegrationHelper } from '../../integrations/telegram/telegram.helper';

@Injectable()
export class DailySummaryJob {
  constructor(
    private prisma: PrismaService,
    private telegramHelper: TelegramIntegrationHelper,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9_AM)
  async sendDailySummaries() {
    const users = await this.prisma.user.findMany({
      where: { telegramEnabled: true },
    });

    for (const user of users) {
      const stats = await this.getUserDailyStats(user.id);

      await this.telegramHelper.sendDailySummary(user.id, {
        totalLogins: stats.loginCount,
        newDevices: stats.newDevicesCount,
        failedAttempts: stats.failedAttemptsCount,
        location: stats.lastLocation,
      });
    }
  }

  private async getUserDailyStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logins = await this.prisma.session.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const failedAttempts = await this.prisma.securityLog.count({
      where: {
        userId,
        type: 'FAILED_LOGIN',
        createdAt: { gte: today },
      },
    });

    // ... حسابات إضافية

    return {
      loginCount: logins,
      failedAttemptsCount: failedAttempts,
      newDevicesCount: 0, // حساب الأجهزة الجديدة
      lastLocation: 'Cairo, Egypt', // آخر موقع معروف
    };
  }
}
```

---

## 5️⃣ التحقق من أن المستخدم متصل

### مثال: قبل إرسال رسالة

```typescript
async notifyUser(userId: string, message: string) {
  // التحقق من الاتصال
  const isConnected = await this.telegramHelper.isUserConnected(userId);

  if (!isConnected) {
    console.log(`User ${userId} is not connected to Telegram`);
    return;
  }

  // إرسال الرسالة
  await this.telegramHelper.sendCustomNotification(
    userId,
    'إشعار مهم',
    message
  );
}
```

---

## 6️⃣ رسائل مخصصة

### إرسال رسالة مع أزرار

```typescript
async sendVerificationRequest(userId: string, code: string) {
  const buttons = [
    [
      { text: '✅ أوافق', callback_data: `verify_${code}` },
      { text: '❌ أرفض', callback_data: `reject_${code}` },
    ],
  ];

  const message = `
<b>طلب تحقق من الهوية</b>

لتأكيد عملية حساسة، يرجى التحقق:

الكود: <code>${code}</code>
  `.trim();

  await this.telegramHelper.sendMessageWithButtons(
    userId,
    message,
    buttons
  );
}
```

---

## 7️⃣ معالجة الأخطاء

### الطريقة الموصى بها

```typescript
async loginWithTelegramNotification(userId: string) {
  try {
    // عملية الدخول...

    // إرسال التنبيه (اختياري)
    try {
      await this.telegramHelper.sendLoginNotification(userId, {}, {});
    } catch (telegramError) {
      // لا نفشل العملية الرئيسية بسبب خطأ Telegram
      this.logger.warn('Failed to send Telegram notification', telegramError);
    }

    return { success: true };
  } catch (error) {
    // معالجة الخطأ الرئيسي
    throw error;
  }
}
```

---

## 8️⃣ Module Imports

### إضافة Telegram Helper إلى Module

```typescript
// src/domain/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TelegramModule } from '../../integrations/telegram/telegram.module';
import { TelegramIntegrationHelper } from '../../integrations/telegram/telegram.helper';

@Module({
  imports: [TelegramModule],
  controllers: [AuthController],
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

## 📊 أمثلة سيناريوهات عملية

### السيناريو 1: تسجيل دخول من جهاز جديد

```typescript
async login(credentials: LoginDto, request: Request) {
  const user = await this.validateCredentials(credentials);
  const deviceInfo = parseUserAgent(request.headers['user-agent']);
  const isNewDevice = !(await this.isTrustedDevice(user.id, deviceInfo));

  const session = await this.createSession(user.id, deviceInfo);

  // ✅ إرسال تنبيه لكل دخول من جهاز جديد
  if (isNewDevice && user.telegramEnabled && user.telegramChatId) {
    await this.telegramHelper.sendLoginNotification(
      user.id,
      deviceInfo,
      {
        ip: request.ip,
        location: await getLocation(request.ip),
      }
    );
  }

  return { accessToken: session.accessToken };
}
```

### السيناريو 2: نشاط غير عادي

```typescript
async detectAnomalousActivity(userId: string) {
  const recentLogins = await this.getRecentLogins(userId, 24);
  const locationVariance = this.calculateLocationVariance(recentLogins);

  if (locationVariance > THRESHOLD) {
    // 🚨 نشاط غير عادي
    await this.telegramHelper.sendCustomNotification(
      userId,
      '⚠️ نشاط غير عادي',
      `تم رصد عمليات دخول من مواقع مختلفة جداً في وقت قصير.\n
إذا لم تقم بهذا، يرجى تأمين حسابك فوراً.`
    );
  }
}
```

### السيناريو 3: تنبيهات مجدولة

```typescript
// src/infrastructure/jobs/security-digest.job.ts

@Cron('0 9 * * *') // كل يوم في 9 صباحاً
async sendSecurityDigest() {
  const users = await this.prisma.user.findMany({
    where: { telegramEnabled: true },
  });

  for (const user of users) {
    const logs = await this.getSecurityLogs(user.id, 24);
    
    const stats = {
      totalLogins: logs.filter(l => l.type === 'LOGIN').length,
      failedAttempts: logs.filter(l => l.type === 'FAILED_LOGIN').length,
      newDevices: logs.filter(l => l.type === 'NEW_DEVICE').length,
    };

    await this.telegramHelper.sendDailySummary(user.id, stats);
  }
}
```

---

## ⚙️ Best Practices

### ✅ افضل الممارسات

1. **لا تفشل العملية الرئيسية بسبب Telegram**
   ```typescript
   try {
     await this.telegramHelper.send...();
   } catch (error) {
     this.logger.warn('Telegram notification failed', error);
     // استمر في التنفيذ
   }
   ```

2. **استخدم الـ Helper بدلاً من الـ Service مباشرة**
   ```typescript
   // ✅ صحيح
   await this.telegramHelper.sendLoginNotification(userId, ...);
   
   // ❌ تجنب
   await this.telegramService.sendMessage(...);
   ```

3. **تحقق من الاتصال قبل الإرسال**
   ```typescript
   if (await this.telegramHelper.isUserConnected(userId)) {
     await this.telegramHelper.send...();
   }
   ```

4. **استخدم الـ Templates**
   ```typescript
   // ✅ صحيح
   const message = TelegramMessageTemplates.getLoginNotification(...);
   
   // ❌ تجنب
   const message = 'تم الدخول من...';
   ```

---

## 🧪 الاختبار

### مثال: Unit Test

```typescript
describe('AuthService - Telegram Integration', () => {
  let service: AuthService;
  let telegramHelper: TelegramIntegrationHelper;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TelegramIntegrationHelper,
          useValue: {
            sendLoginNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    telegramHelper = module.get<TelegramIntegrationHelper>(
      TelegramIntegrationHelper
    );
  });

  it('should send login notification on successful login', async () => {
    const user = { id: '123', email: 'test@example.com' };
    const request = { headers: { 'user-agent': 'Chrome' }, ip: '127.0.0.1' };

    await service.login(credentials, request);

    expect(telegramHelper.sendLoginNotification).toHaveBeenCalledWith(
      user.id,
      expect.any(Object),
      expect.any(Object)
    );
  });
});
```

---

## 📞 الدعم

للمساعدة أو الأسئلة، تواصل مع فريق الدعم.

---

**آخر تحديث:** ديسمبر 2025
