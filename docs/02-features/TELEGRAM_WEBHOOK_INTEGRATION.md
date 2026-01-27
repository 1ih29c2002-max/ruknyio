# 🤖 Telegram Webhook Integration - نظام الربط الاحترافي

> **المستوى**: متقدم | **الأمان**: 🔒🔒🔒 | **التعقيد**: معقد

---

## 📋 نظرة عامة

هذا التوثيق يشرح كيفية تطبيق نظام ربط Telegram باستخدام **Webhook Callback** - الطريقة الاحترافية والآمنة للتطبيقات الضخمة.

### لماذا Webhook؟

| المميزة | الفائدة |
|--------|--------|
| **Real-time** | استجابة فورية لأحداث Telegram |
| **Stateless** | لا نحتاج polling أو WebSocket |
| **آمن** | التحقق من التوقيع (signature verification) |
| **قابل للتوسع** | يدعم ملايين المستخدمين |
| **فعّال** | استهلاك موارد أقل |

---

## 🎯 التدفق الكامل

### المرحلة 1️⃣: إنشاء جلسة التحقق (Frontend)

```
┌─────────────────────────────────────────┐
│   لوحة تحكم المستخدم                    │
│   Settings → Security → Telegram        │
│                                         │
│   [ ربط Telegram ]  👈 يضغط المستخدم   │
└──────────────┬──────────────────────────┘
               │
               ├─── POST /api/telegram/generate-session
               │
               └─→ Backend ينشئ session مؤقت
                   {
                     "sessionId": "sess_abc123xyz",
                     "expiresAt": "2025-12-24T12:15:00Z",
                     "botLink": "https://t.me/RuknyBot?start=sess_abc123xyz"
                   }
```

### المرحلة 2️⃣: مسح QR Code أو فتح الرابط (Bot)

```
┌──────────────────────────────────┐
│  Telegram App / Web              │
│                                  │
│  User يضغط: https://t.me/...    │
│                                  │
│  /start sess_abc123xyz           │
└──────────────┬───────────────────┘
               │
               ├─── Bot استقبل الـ session_id
               │    يطلب تأكيد من المستخدم
               │
               └─→ "اضغط ✅ للتأكيد"
                   [✅ تأكيد] [❌ إلغاء]
```

### المرحلة 3️⃣: Webhook Callback (Backend)

```
┌─────────────────────────┐
│  Telegram Servers       │
│                         │
│  User اضغط ✅           │
│  Bot استقبل الـ update  │
└────────┬────────────────┘
         │
         ├─── Telegram يرسل Webhook POST
         │    إلى: https://your-domain/api/telegram/webhook
         │
         ├─→ Body مع التوقيع:
         │   {
         │     "update_id": 123456,
         │     "message": {...},
         │     "X-Telegram-Bot-Api-Secret-Hash": "..."
         │   }
         │
         └─→ Backend يتحقق من التوقيع
              ✅ توقيع صحيح؟
              ✅ session_id صالح؟
              ✅ لم ينتهِ وقته؟
              
              يحفظ: Chat ID + User ID
              يرسل تأكيد للـ Bot
              يُحدّث لوحة التحكم
```

### المرحلة 4️⃣: تحديث الواجهة (Frontend Real-time)

```
┌──────────────────────────────┐
│  لوحة التحكم (مفتوحة)        │
│                              │
│  تراقب: /api/telegram/status │
│  أو WebSocket listener       │
│                              │
│  ✅ تم الربط!               │
│  Chat ID: 123456789         │
│  [ فصل ]                    │
└──────────────────────────────┘
```

---

## 🔧 خطوات التطبيق التفصيلية

### ✅ الخطوة 1: تحديث قاعدة البيانات

**الملف:** `apps/api/prisma/schema.prisma`

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  // ... الحقول الأخرى
  
  // ===== Telegram Integration =====
  telegramChatId      String?   @unique
  telegramUsername    String?
  telegramFirstName   String?
  telegramLastName    String?
  
  // Session للتحقق
  telegramSession     TelegramSession?
  
  // الإعدادات
  telegramEnabled     Boolean   @default(true)
  telegramConnectedAt DateTime?
  
  // Webhook logs
  telegramLogs        TelegramWebhookLog[]
  
  @@index([telegramChatId])
  @@index([telegramConnectedAt])
}

// ===== جلسة التحقق =====
model TelegramSession {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  sessionId       String    @unique          // رمز الجلسة المرسل للـ Bot
  expiresAt       DateTime                   // متى تنتهي الجلسة
  
  // لما يتم التحقق
  verifiedAt      DateTime?
  verifiedChatId  String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ===== سجل Webhook =====
model TelegramWebhookLog {
  id              String    @id @default(cuid())
  userId          String?
  user            User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  updateId        String    @unique         // Telegram update ID
  eventType       String                    // "message", "callback_query", etc
  payload         Json                      // الـ payload الكامل
  
  verified        Boolean   @default(false) // هل التوقيع صحيح
  status          String    @default("pending") // pending, processed, failed
  
  error           String?
  processedAt     DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

**تشغيل Migration:**
```bash
npx prisma migrate dev --name add_telegram_integration
```

---

### ✅ الخطوة 2: إنشاء Telegram Service

**الملف:** `apps/api/src/integrations/telegram/telegram.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: any;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly botName: string;
  private readonly webhookUrl: string;
  private readonly telegramApiUrl = 'https://api.telegram.org';
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.getOrThrow('TELEGRAM_BOT_TOKEN');
    this.botName = this.configService.getOrThrow('TELEGRAM_BOT_NAME', 'RuknyBot');
    this.webhookUrl = this.configService.getOrThrow('TELEGRAM_WEBHOOK_URL');

    this.httpClient = axios.create({
      baseURL: `${this.telegramApiUrl}/bot${this.botToken}`,
      timeout: 10000,
    });
  }

  /**
   * 🔐 التحقق من توقيع Webhook
   * Telegram يرسل: X-Telegram-Bot-Api-Secret-Hash
   * نحسبها: HMAC-SHA256(update_json, sha256(bot_token))
   */
  verifyWebhookSignature(
    payload: Record<string, any>,
    signature: string,
  ): boolean {
    try {
      const secretKey = crypto
        .createHash('sha256')
        .update(this.botToken)
        .digest();

      const payloadString = JSON.stringify(payload);
      const hmac = crypto.createHmac('sha256', secretKey);
      hmac.update(payloadString);
      const hash = hmac.digest('hex');

      const isValid = hash === signature;
      
      if (!isValid) {
        this.logger.warn(`Invalid webhook signature: ${signature}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying webhook signature', error);
      return false;
    }
  }

  /**
   * 📱 إرسال رسالة إلى المستخدم
   */
  async sendMessage(message: TelegramMessage): Promise<any> {
    try {
      const response = await this.httpClient.post('/sendMessage', message);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send message to ${message.chat_id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 🎨 إرسال رسالة مع أزرار (inline buttons)
   */
  async sendMessageWithButtons(
    chatId: string | number,
    text: string,
    buttons: Array<Array<{ text: string; callback_data: string }>>,
    parseMode: 'HTML' | 'Markdown' = 'HTML',
  ): Promise<any> {
    return this.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  /**
   * 📸 إرسال صورة مع تعليق
   */
  async sendPhoto(
    chatId: string | number,
    photoUrl: string,
    caption: string,
  ): Promise<any> {
    try {
      const response = await this.httpClient.post('/sendPhoto', {
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send photo to ${chatId}`, error);
      throw error;
    }
  }

  /**
   * 🔔 إرسال إشعار (بدون صوت)
   */
  async sendNotification(
    chatId: string | number,
    text: string,
  ): Promise<any> {
    return this.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  }

  /**
   * ⚠️ إرسال تنبيه أمني
   */
  async sendSecurityAlert(
    chatId: string | number,
    title: string,
    details: {
      location?: string;
      device?: string;
      time?: string;
      ip?: string;
      reason?: string;
    },
  ): Promise<any> {
    const message = `
<b>⚠️ تنبيه أمني</b>
<b>${title}</b>

${details.location ? `📍 <b>الموقع:</b> ${details.location}` : ''}
${details.device ? `📱 <b>الجهاز:</b> ${details.device}` : ''}
${details.ip ? `🌐 <b>الـ IP:</b> ${details.ip}` : ''}
${details.time ? `🕐 <b>الوقت:</b> ${details.time}` : ''}
${details.reason ? `<b>السبب:</b> ${details.reason}` : ''}

<i>إذا لم تقم بهذا الإجراء، غيّر كلمة المرور فوراً</i>
    `.trim();

    return this.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
  }

  /**
   * 🔗 إرسال رابط التحقق
   */
  async sendVerificationLink(
    chatId: string | number,
    sessionId: string,
  ): Promise<any> {
    const confirmationCode = sessionId.slice(-6).toUpperCase();
    
    const message = `
<b>🔐 ربط حساب Rukny</b>

أنت طلبت ربط حسابك مع Telegram.

<b>كود التحقق:</b> <code>${confirmationCode}</code>

<i>أو استخدم الزر أدناه للتأكيد</i>
    `.trim();

    return this.sendMessageWithButtons(
      chatId,
      message,
      [[
        { text: '✅ تأكيد', callback_data: `verify_${sessionId}` },
        { text: '❌ إلغاء', callback_data: `cancel_${sessionId}` },
      ]],
    );
  }

  /**
   * 🌐 تعيين Webhook (يتم عند بدء التطبيق)
   */
  async setWebhook(): Promise<any> {
    try {
      const response = await this.httpClient.post('/setWebhook', {
        url: this.webhookUrl,
        allowed_updates: [
          'message',
          'callback_query',
          'my_chat_member',
          'chat_member',
        ],
      });

      this.logger.log('Webhook set successfully', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to set webhook', error);
      throw error;
    }
  }

  /**
   * 🗑️ حذف Webhook
   */
  async deleteWebhook(): Promise<any> {
    try {
      const response = await this.httpClient.post('/deleteWebhook');
      this.logger.log('Webhook deleted successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to delete webhook', error);
      throw error;
    }
  }

  /**
   * ℹ️ الحصول على معلومات الـ Bot
   */
  async getMe(): Promise<any> {
    try {
      const response = await this.httpClient.get('/getMe');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get bot info', error);
      throw error;
    }
  }

  /**
   * ✏️ تعديل رسالة
   */
  async editMessage(
    chatId: string | number,
    messageId: number,
    text: string,
  ): Promise<any> {
    try {
      const response = await this.httpClient.post('/editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to edit message', error);
      throw error;
    }
  }

  /**
   * 📤 الرد على Callback Query
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text: string,
    showAlert: boolean = false,
  ): Promise<any> {
    try {
      const response = await this.httpClient.post('/answerCallbackQuery', {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to answer callback query', error);
      throw error;
    }
  }
}
```

---

### ✅ الخطوة 3: إنشاء Telegram Session Service

**الملف:** `apps/api/src/integrations/telegram/telegram-session.service.ts`

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { nanoid } from 'nanoid';

@Injectable()
export class TelegramSessionService {
  private readonly logger = new Logger(TelegramSessionService.name);
  private readonly SESSION_EXPIRY_MINUTES = 5;

  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  /**
   * 🎫 إنشاء جلسة تحقق جديدة
   */
  async createVerificationSession(userId: string): Promise<{
    sessionId: string;
    botLink: string;
    expiresAt: Date;
  }> {
    // حذف الجلسات القديمة
    await this.prisma.telegramSession.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    // إنشاء جلسة جديدة
    const sessionId = `sess_${nanoid(24)}`;
    const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY_MINUTES * 60000);

    const session = await this.prisma.telegramSession.create({
      data: {
        sessionId,
        userId,
        expiresAt,
      },
    });

    const botLink = `https://t.me/RuknyBot?start=${sessionId}`;

    this.logger.log(`Created verification session for user ${userId}`);

    return {
      sessionId,
      botLink,
      expiresAt,
    };
  }

  /**
   * 🔍 البحث عن جلسة وتحقق من صلاحيتها
   */
  async getValidSession(sessionId: string) {
    const session = await this.prisma.telegramSession.findUnique({
      where: { sessionId },
      include: { user: true },
    });

    if (!session) {
      throw new NotFoundException('جلسة التحقق غير موجودة');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.telegramSession.delete({ where: { id: session.id } });
      throw new NotFoundException('انتهت صلاحية جلسة التحقق');
    }

    if (session.verifiedAt) {
      throw new NotFoundException('تم استخدام هذه الجلسة بالفعل');
    }

    return session;
  }

  /**
   * ✅ تأكيد الجلسة (عند استقبال Webhook من الـ Bot)
   */
  async verifySession(
    sessionId: string,
    chatId: number,
    firstName?: string,
    lastName?: string,
    username?: string,
  ) {
    const session = await this.getValidSession(sessionId);

    // تحديث الجلسة
    const updatedSession = await this.prisma.telegramSession.update({
      where: { id: session.id },
      data: {
        verifiedAt: new Date(),
        verifiedChatId: chatId.toString(),
      },
    });

    // تحديث بيانات المستخدم
    const user = await this.prisma.user.update({
      where: { id: session.userId },
      data: {
        telegramChatId: chatId.toString(),
        telegramFirstName: firstName,
        telegramLastName: lastName,
        telegramUsername: username,
        telegramConnectedAt: new Date(),
        telegramEnabled: true,
      },
    });

    this.logger.log(
      `Verified Telegram session for user ${session.userId}: Chat ID ${chatId}`,
    );

    return { user, session: updatedSession };
  }

  /**
   * 🚫 إلغاء جلسة
   */
  async cancelSession(sessionId: string) {
    const session = await this.getValidSession(sessionId);

    await this.prisma.telegramSession.delete({
      where: { id: session.id },
    });

    this.logger.log(`Cancelled verification session: ${sessionId}`);
  }

  /**
   * 🔌 فصل Telegram عن حساب المستخدم
   */
  async disconnectTelegram(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramChatId: null,
        telegramEnabled: false,
      },
    });

    // حذف الجلسات المتعلقة
    await this.prisma.telegramSession.deleteMany({
      where: { userId },
    });

    this.logger.log(`Disconnected Telegram for user ${userId}`);
  }

  /**
   * 🛠️ الحصول على حالة الربط للمستخدم
   */
  async getConnectionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramChatId: true,
        telegramEnabled: true,
        telegramConnectedAt: true,
        telegramUsername: true,
        telegramFirstName: true,
      },
    });

    return {
      connected: !!user.telegramChatId,
      enabled: user.telegramEnabled,
      chatId: user.telegramChatId,
      username: user.telegramUsername,
      firstName: user.telegramFirstName,
      connectedAt: user.telegramConnectedAt,
    };
  }
}
```

---

### ✅ الخطوة 4: إنشاء Webhook Controller

**الملف:** `apps/api/src/integrations/telegram/telegram-webhook.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { TelegramSessionService } from './telegram-session.service';
import { PrismaService } from '../../core/database/prisma/prisma.service';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat_instance: string;
    data?: string;
    message?: {
      message_id: number;
      chat: { id: number };
    };
  };
}

@ApiTags('telegram')
@Controller('telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(
    private telegramService: TelegramService,
    private telegramSessionService: TelegramSessionService,
    private prisma: PrismaService,
  ) {}

  /**
   * 🎣 استقبال Webhook من Telegram
   */
  @Post('webhook')
  @ApiBody({ type: Object })
  async handleWebhook(
    @Body() update: TelegramUpdate,
    @Headers('x-telegram-bot-api-secret-hash') signature: string,
  ) {
    try {
      // ✅ التحقق من التوقيع
      if (!this.telegramService.verifyWebhookSignature(update, signature)) {
        this.logger.warn(`Invalid webhook signature for update ${update.update_id}`);
        throw new BadRequestException('Invalid signature');
      }

      // 📝 حفظ الـ log
      await this.prisma.telegramWebhookLog.create({
        data: {
          updateId: update.update_id.toString(),
          eventType: update.message ? 'message' : 'callback_query',
          payload: update as any,
          verified: true,
        },
      });

      // 🔄 معالجة الـ update
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }

      return { ok: true };
    } catch (error) {
      this.logger.error('Error handling webhook', error);

      // 📝 حفظ الخطأ
      if (update.update_id) {
        await this.prisma.telegramWebhookLog.update({
          where: { updateId: update.update_id.toString() },
          data: {
            status: 'failed',
            error: error.message,
          },
        }).catch(() => {});
      }

      return { ok: true }; // Telegram يجب أن نرجع 200 OK دائماً
    }
  }

  /**
   * 💬 معالجة الرسائل
   */
  private async handleMessage(message: TelegramUpdate['message']) {
    const { text, from, chat } = message;

    this.logger.log(
      `Message from ${from.username || from.first_name}: ${text}`,
    );

    // التحقق من الأمر /start
    if (text?.startsWith('/start')) {
      await this.handleStartCommand(text, from, chat);
    }
  }

  /**
   * 🚀 معالجة أمر /start
   */
  private async handleStartCommand(
    text: string,
    from: TelegramUpdate['message']['from'],
    chat: TelegramUpdate['message']['chat'],
  ) {
    const sessionId = text.replace('/start ', '').trim();

    try {
      // 🔍 البحث عن الجلسة
      const session = await this.telegramSessionService.getValidSession(
        sessionId,
      );

      // ✅ تأكيد الجلسة
      const { user } = await this.telegramSessionService.verifySession(
        sessionId,
        chat.id,
        from.first_name,
        from.last_name,
        from.username,
      );

      // 📤 إرسال رسالة تأكيد
      await this.telegramService.sendMessage({
        chat_id: chat.id,
        text: `<b>✅ تم ربط الحساب بنجاح!</b>\n\nالبريد: <code>${user.email}</code>\n\nستتلقى الآن الإشعارات على هذا الحساب.`,
        parse_mode: 'HTML',
      });

      this.logger.log(`Verified user ${user.id} with Telegram chat ${chat.id}`);
    } catch (error) {
      // ❌ رسالة خطأ
      await this.telegramService.sendMessage({
        chat_id: chat.id,
        text: `<b>❌ خطأ في الربط</b>\n\n${error.message}`,
        parse_mode: 'HTML',
      });

      this.logger.error(`Error verifying session ${sessionId}`, error);
    }
  }

  /**
   * 🔘 معالجة الأزرار (Callback Query)
   */
  private async handleCallbackQuery(
    callbackQuery: TelegramUpdate['callback_query'],
  ) {
    const { id: callbackId, data, from, message } = callbackQuery;

    try {
      if (data?.startsWith('verify_')) {
        const sessionId = data.replace('verify_', '');

        // ✅ تأكيد الجلسة
        const { user } = await this.telegramSessionService.verifySession(
          sessionId,
          message.chat.id,
          from.first_name,
          undefined,
          from.username,
        );

        // 📤 تحديث الرسالة
        await this.telegramService.editMessage(
          message.chat.id,
          message.message_id,
          `<b>✅ تم ربط الحساب بنجاح!</b>\n\nالبريد: <code>${user.email}</code>`,
        );

        // 📢 الرد على الـ callback
        await this.telegramService.answerCallbackQuery(
          callbackId,
          '✅ تم الربط بنجاح!',
        );
      } else if (data?.startsWith('cancel_')) {
        const sessionId = data.replace('cancel_', '');

        // 🚫 إلغاء الجلسة
        await this.telegramSessionService.cancelSession(sessionId);

        // 📤 تحديث الرسالة
        await this.telegramService.editMessage(
          message.chat.id,
          message.message_id,
          '<b>❌ تم إلغاء الربط</b>',
        );

        // 📢 الرد على الـ callback
        await this.telegramService.answerCallbackQuery(callbackId, 'تم الإلغاء');
      }
    } catch (error) {
      this.logger.error('Error handling callback query', error);

      await this.telegramService.answerCallbackQuery(
        callbackId,
        `❌ حدث خطأ: ${error.message}`,
        true,
      );
    }
  }
}
```

---

### ✅ الخطوة 5: إنشاء REST API Endpoints

**الملف:** `apps/api/src/integrations/telegram/telegram.controller.ts`

```typescript
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TelegramService } from './telegram.service';
import { TelegramSessionService } from './telegram-session.service';
import { PrismaService } from '../../core/database/prisma/prisma.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string };
}

@ApiTags('telegram')
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private telegramService: TelegramService,
    private telegramSessionService: TelegramSessionService,
    private prisma: PrismaService,
  ) {}

  /**
   * 🎫 إنشاء جلسة تحقق جديدة
   * POST /api/telegram/generate-session
   */
  @Post('generate-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء جلسة تحقق جديدة' })
  async generateSession(@Req() req: RequestWithUser) {
    const { sessionId, botLink, expiresAt } =
      await this.telegramSessionService.createVerificationSession(req.user.id);

    return {
      success: true,
      data: {
        sessionId,
        botLink,
        expiresAt,
        qrCode: null, // يمكن توليد QR code إن أردت
      },
    };
  }

  /**
   * ✅ الحصول على حالة الربط
   * GET /api/telegram/status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'الحصول على حالة الربط' })
  async getStatus(@Req() req: RequestWithUser) {
    const status = await this.telegramSessionService.getConnectionStatus(
      req.user.id,
    );

    return {
      success: true,
      data: status,
    };
  }

  /**
   * 🔌 فصل Telegram
   * DELETE /api/telegram/disconnect
   */
  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'فصل حساب Telegram' })
  async disconnect(@Req() req: RequestWithUser) {
    await this.telegramSessionService.disconnectTelegram(req.user.id);

    return {
      success: true,
      message: 'تم فصل حساب Telegram بنجاح',
    };
  }

  /**
   * 🧪 اختبار الإرسال
   * POST /api/telegram/test
   */
  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'اختبار إرسال رسالة' })
  async test(@Req() req: RequestWithUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user.telegramChatId) {
      return {
        success: false,
        message: 'لم يتم ربط حساب Telegram',
      };
    }

    await this.telegramService.sendMessage({
      chat_id: user.telegramChatId,
      text: '<b>✅ اختبار الاتصال</b>\n\nإذا رأيت هذه الرسالة، فالاتصال يعمل بشكل صحيح!',
      parse_mode: 'HTML',
    });

    return {
      success: true,
      message: 'تم إرسال رسالة الاختبار',
    };
  }
}
```

---

### ✅ الخطوة 6: إنشاء Module

**الملف:** `apps/api/src/integrations/telegram/telegram.module.ts`

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramSessionService } from './telegram-session.service';
import { TelegramController } from './telegram.controller';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { PrismaService } from '../../core/database/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramService, TelegramSessionService, PrismaService],
  controllers: [TelegramController, TelegramWebhookController],
  exports: [TelegramService],
})
export class TelegramModule implements OnModuleInit {
  constructor(private telegramService: TelegramService) {}

  /**
   * 🚀 تعيين الـ Webhook عند بدء التطبيق
   */
  async onModuleInit() {
    try {
      // اختياري: يمكنك تفعيل/تعطيل هذا حسب البيئة
      if (process.env.TELEGRAM_ENABLED === 'true') {
        await this.telegramService.setWebhook();
      }
    } catch (error) {
      console.error('Failed to set Telegram webhook', error);
    }
  }
}
```

---

### ✅ الخطوة 7: تسجيل Module في App

**الملف:** `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './integrations/telegram/telegram.module';
// ... الـ imports الأخرى

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ... modules أخرى
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

---

### ✅ الخطوة 8: متغيرات البيئة

**الملف:** `.env` و `.env.example`

```env
# ========== Telegram Bot Configuration ==========
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_BOT_NAME=RuknyBot
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TELEGRAM_ENABLED=true

# Webhook Secret (اختياري - للأمان الإضافي)
TELEGRAM_WEBHOOK_SECRET=your-secret-key
```

---

### ✅ الخطوة 9: Frontend - React Component

**الملف:** `apps/web/components/UserDashboard/TelegramSettings.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, LogOut, AlertCircle, Loader } from 'lucide-react';

interface TelegramStatus {
  connected: boolean;
  enabled: boolean;
  chatId: string;
  username: string;
  firstName: string;
  connectedAt: string;
}

export function TelegramSettings() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    botLink: string;
    expiresAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  // 🔄 جلب حالة الربط
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  // 🎫 إنشاء جلسة جديدة
  const handleGenerateSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/telegram/generate-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setSessionData(data.data);
        setTimeLeft(300);
      }
    } catch (err) {
      setError('فشل إنشاء الجلسة');
    } finally {
      setLoading(false);
    }
  };

  // 🔗 فتح رابط البوت
  const handleOpenBot = () => {
    if (sessionData) {
      window.open(sessionData.botLink, '_blank');
    }
  };

  // 📋 نسخ رابط البوت
  const handleCopyLink = () => {
    if (sessionData) {
      navigator.clipboard.writeText(sessionData.botLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 🔌 فصل الاتصال
  const handleDisconnect = async () => {
    if (!confirm('هل أنت متأكد؟')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/telegram/disconnect', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (res.ok) {
        setStatus(null);
        await fetchStatus();
      }
    } catch (err) {
      setError('فشل فصل الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // ⏱ عد تنازلي للجلسة
  useEffect(() => {
    if (!sessionData) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSessionData(null);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData]);

  // 🔄 جلب البيانات عند التحميل
  useEffect(() => {
    if (session) {
      fetchStatus();
    }
  }, [session]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">🤖 Telegram Integration</h3>
          <p className="text-sm text-gray-600 mt-1">
            اربط حسابك مع Telegram لتلقي إشعارات الأمان والدخول
          </p>
        </div>
        {status?.connected && (
          <Badge className="bg-green-100 text-green-800">متصل</Badge>
        )}
      </div>

      {/* ❌ رسالة خطأ */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* ✅ متصل */}
      {status?.connected ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">
              ✅ Telegram متصل بنجاح
            </p>
            <p className="text-sm text-green-700 mt-2">
              📱 <strong>اسم المستخدم:</strong> @{status.username}
            </p>
            <p className="text-sm text-green-700">
              📅 <strong>متصل منذ:</strong>{' '}
              {new Date(status.connectedAt).toLocaleDateString('ar-SA')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setStatus({ ...status, enabled: !status.enabled })}
              variant={status.enabled ? 'default' : 'outline'}
            >
              {status.enabled ? '✅ مفعّل' : '⊘ معطّل'}
            </Button>

            <Button
              onClick={handleDisconnect}
              variant="destructive"
              disabled={loading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              فصل الاتصال
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!sessionData ? (
            <Button
              onClick={handleGenerateSession}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                '🚀 ابدأ الربط الآن'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-3">
                  🔗 رابط ربط البوت
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 bg-white border rounded px-3 py-2 text-xs font-mono overflow-auto">
                    {sessionData.botLink}
                  </code>
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </Button>
                </div>

                <p className="text-xs text-blue-700">
                  ⏱ صالح لـ: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
                </p>
              </div>

              <Button
                onClick={handleOpenBot}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📱 افتح البوت الآن
              </Button>

              <p className="text-sm text-gray-600 text-center">
                أو انسخ الرابط أعلاه واستخدمه في Telegram
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
```

---

## 🔄 سيناريوهات الاستخدام

### السيناريو 1: تسجيل دخول جديد ✅

```
1. المستخدم يسجل دخول من جهاز جديد
   └─ AuthService يكتشف جهاز جديد

2. يرسل Telegram notification:
   "🔐 تسجيل دخول جديد
    📱 الجهاز: Chrome on Windows
    📍 الموقع: Cairo, Egypt
    🕐 الوقت: 2025-12-24 12:00 PM"

3. المستخدم يضغط 🔒 Secure
   └─ يتم تسجيل الدخول
```

### السيناريو 2: محاولات دخول فاشلة ⚠️

```
1. 3 محاولات دخول فاشلة متتالية
   └─ SecurityDetectorService يكتشفها

2. يرسل Telegram alert:
   "⚠️ محاولات دخول فاشلة
    🔴 عدد المحاولات: 3
    📍 الموقع: Unknown
    🕐 الوقت: 2025-12-24 12:05 PM
    
    اضغط 🔓 لتأكيد الهوية"
```

### السيناريو 3: تغيير كلمة المرور 🔐

```
1. المستخدم يطلب تغيير كلمة المرور
   └─ يرسل verification code

2. Telegram notification:
   "🔐 طلب تغيير كلمة المرور
    
    كود التحقق: 123456
    ⏱ صالح لـ: 10 دقائق"
```

---

## 📊 Webhook Logs و Monitoring

```sql
-- الاستعلام عن Webhook logs
SELECT 
  id,
  eventType,
  status,
  verified,
  createdAt
FROM TelegramWebhookLog
WHERE 
  userId = 'user_id'
  AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY createdAt DESC;

-- البحث عن الأخطاء
SELECT 
  id,
  error,
  payload,
  createdAt
FROM TelegramWebhookLog
WHERE 
  status = 'failed'
  AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY createdAt DESC;
```

---

## 🧪 اختبار الـ Webhook محلياً

### استخدام ngrok:

```bash
# تثبيت ngrok
npm install -g ngrok

# تشغيل التطبيق
npm run start:dev

# في terminal آخر، فتح ngrok tunnel
ngrok http 3333

# سيظهر لك: https://xxxx-xxx-xxx.ngrok.io
# استخدم هذا الرابط في: TELEGRAM_WEBHOOK_URL
```

### محاكاة Webhook:

```bash
curl -X POST http://localhost:3333/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Hash: your-signature" \
  -d '{
    "update_id": 123456,
    "message": {
      "message_id": 1,
      "from": {"id": 123, "is_bot": false, "first_name": "Test"},
      "chat": {"id": 123, "type": "private"},
      "date": 1703421600,
      "text": "/start sess_abc123"
    }
  }'
```

---

## ⚙️ Configuration الإنتاج

```bash
# في Telegram Bot Father:

setcommands

/start - بدء ربط الحساب
/status - عرض حالة الربط
/help - مساعدة

setdescription
🤖 بوت Rukny - اشعارات الامان والدخول

setshortdescription
🔐 تنبيهات الأمان والدخول فوراً
```

---

## 📈 المقاييس المهمة

```typescript
// trackالـ metrics
metrics.webhook.received.inc()        // عدد الـ webhooks المستقبلة
metrics.webhook.verified.inc()        // التوقيعات الصحيحة
metrics.webhook.failed.inc()          // الفشل
metrics.webhook.latency.observe(time) // التأخير
metrics.telegram.connected_users.set() // عدد المستخدمين المتصلين
```

---

هذا التوثيق يغطي كل شيء تحتاجه! 🚀

هل تريد توضيح أي جزء أو البدء بالتطبيق؟