# دليل التكاملات الخارجية - Backend Integration Guide

> 📅 تاريخ الإنشاء: December 13, 2025
> 📁 المسار: `apps/web/app/(UserDashboard)/app/setting`
> 🔗 المكونات: `apps/web/components/(UserDashboard)/settings/`

---

## 📋 نظرة عامة

تم إنشاء واجهة المستخدم الكاملة لقسم التكاملات الخارجية في صفحة الإعدادات. هذا المستند يوثق المتطلبات اللازمة لربط الواجهة مع Backend API.

---

## 🗂️ المكونات المُنشأة

| المكون | الملف | الوصف |
|--------|-------|-------|
| IntegrationsOverview | `IntegrationsOverview.tsx` | نظرة عامة على جميع التكاملات |
| SocialIntegrations | `SocialIntegrations.tsx` | تكاملات التواصل الاجتماعي |
| AnalyticsIntegrations | `AnalyticsIntegrations.tsx` | تكاملات التحليلات والتتبع |
| NotificationIntegrations | `NotificationIntegrations.tsx` | تكاملات الإشعارات |
| StorageIntegrations | `StorageIntegrations.tsx` | تكاملات التخزين السحابي |

---

## 🗄️ قاعدة البيانات - Prisma Schema

### جدول التكاملات الرئيسي

```prisma
// schema.prisma

model Integration {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Integration Info
  type            IntegrationType
  platform        String   // twitter, instagram, google-analytics, etc.
  name            String
  
  // Connection Status
  isConnected     Boolean  @default(false)
  connectedAt     DateTime?
  lastSyncAt      DateTime?
  
  // Credentials (encrypted)
  credentials     Json?    // Encrypted JSON containing tokens, keys, etc.
  
  // Settings
  settings        Json?    // Platform-specific settings
  notificationTypes Json?  // For notification integrations
  
  // Metadata
  externalId      String?  // External account ID
  externalUsername String? // External username/handle
  
  // Stats
  stats           Json?    // Usage statistics
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId, platform])
  @@index([userId])
  @@index([platform])
}

enum IntegrationType {
  SOCIAL
  ANALYTICS
  NOTIFICATIONS
  STORAGE
}
```

### جدول سجل التكاملات

```prisma
model IntegrationLog {
  id            String   @id @default(cuid())
  integrationId String
  integration   Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  
  action        String   // connect, disconnect, sync, error
  status        String   // success, failed
  message       String?
  metadata      Json?
  
  createdAt     DateTime @default(now())
  
  @@index([integrationId])
}
```

---

## 🔌 API Endpoints

### Base URL: `/api/v1/integrations`

### 1. التكاملات العامة

```typescript
// GET /api/v1/integrations
// الحصول على جميع التكاملات للمستخدم
interface GetIntegrationsResponse {
  integrations: Integration[];
  stats: {
    total: number;
    connected: number;
    byType: Record<IntegrationType, number>;
  };
}

// GET /api/v1/integrations/:platform
// الحصول على تكامل محدد
interface GetIntegrationResponse {
  integration: Integration | null;
  availableFeatures: string[];
}

// DELETE /api/v1/integrations/:platform
// حذف/إلغاء ربط تكامل
interface DisconnectResponse {
  success: boolean;
  message: string;
}
```

### 2. تكاملات التواصل الاجتماعي

```typescript
// POST /api/v1/integrations/social/connect
interface ConnectSocialRequest {
  platform: 'twitter' | 'instagram' | 'tiktok' | 'snapchat' | 'youtube' | 'linkedin';
  authCode?: string; // OAuth authorization code
  redirectUri?: string;
}

interface ConnectSocialResponse {
  success: boolean;
  integration?: Integration;
  oauthUrl?: string; // If OAuth redirect needed
}

// GET /api/v1/integrations/social/:platform/stats
interface SocialStatsResponse {
  posts: number;
  reach: number;
  engagement: number;
  followers: number;
  lastSync: string;
}

// POST /api/v1/integrations/social/:platform/post
interface CreatePostRequest {
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}
```

### 3. تكاملات التحليلات

```typescript
// POST /api/v1/integrations/analytics/connect
interface ConnectAnalyticsRequest {
  platform: 'google-analytics' | 'meta-pixel' | 'hotjar' | 'tiktok-pixel' | 'snapchat-pixel' | 'twitter-pixel' | 'clarity';
  trackingId: string;
  additionalConfig?: Record<string, string>;
}

interface ConnectAnalyticsResponse {
  success: boolean;
  integration?: Integration;
  validationStatus: 'pending' | 'verified' | 'failed';
}

// GET /api/v1/integrations/analytics/:platform/stats
interface AnalyticsStatsResponse {
  visitors: number;
  pageViews: number;
  conversions: number;
  bounceRate: number;
  avgSessionDuration: number;
  period: string;
}

// POST /api/v1/integrations/analytics/:platform/verify
// التحقق من صحة معرّف التتبع
interface VerifyTrackingResponse {
  valid: boolean;
  error?: string;
}
```

### 4. تكاملات الإشعارات

```typescript
// POST /api/v1/integrations/notifications/connect
interface ConnectNotificationRequest {
  platform: 'telegram' | 'slack' | 'discord' | 'whatsapp' | 'email-webhook' | 'custom-webhook';
  credentials: {
    webhookUrl?: string;
    botToken?: string;
    channelId?: string;
    accessToken?: string;
  };
}

interface ConnectNotificationResponse {
  success: boolean;
  integration?: Integration;
  testMessageSent: boolean;
}

// PUT /api/v1/integrations/notifications/:platform/settings
interface UpdateNotificationSettingsRequest {
  notificationTypes: {
    new_order: boolean;
    new_customer: boolean;
    low_stock: boolean;
    new_review: boolean;
    [key: string]: boolean;
  };
}

// POST /api/v1/integrations/notifications/:platform/test
// إرسال إشعار تجريبي
interface TestNotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

### 5. تكاملات التخزين

```typescript
// POST /api/v1/integrations/storage/connect
interface ConnectStorageRequest {
  platform: 'cloudinary' | 'aws-s3' | 'google-cloud-storage' | 'digitalocean-spaces' | 'bunny-storage' | 'backblaze-b2';
  credentials: {
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
    endpoint?: string;
    projectId?: string;
  };
}

interface ConnectStorageResponse {
  success: boolean;
  integration?: Integration;
  testUploadSuccess: boolean;
}

// GET /api/v1/integrations/storage/:platform/usage
interface StorageUsageResponse {
  used: number; // in bytes
  total: number; // in bytes
  files: number;
  bandwidth: {
    used: number;
    total: number;
  };
}

// POST /api/v1/integrations/storage/:platform/upload
// رفع ملف عبر التكامل
interface UploadFileRequest {
  file: File;
  folder?: string;
  optimize?: boolean;
}

interface UploadFileResponse {
  success: boolean;
  url: string;
  publicId: string;
  size: number;
}
```

---

## 🔐 OAuth Configuration

### المنصات التي تتطلب OAuth

| المنصة | نوع OAuth | Scopes المطلوبة |
|--------|-----------|-----------------|
| Twitter/X | OAuth 2.0 | `tweet.read`, `tweet.write`, `users.read` |
| Instagram | OAuth 2.0 | `instagram_basic`, `instagram_content_publish` |
| TikTok | OAuth 2.0 | `user.info.basic`, `video.list` |
| YouTube | OAuth 2.0 | `youtube.readonly`, `youtube.upload` |
| LinkedIn | OAuth 2.0 | `r_liteprofile`, `w_member_social` |
| Google Analytics | OAuth 2.0 | `analytics.readonly` |

### متغيرات البيئة المطلوبة

```env
# Twitter/X
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_CALLBACK_URL=

# Instagram/Meta
META_APP_ID=
META_APP_SECRET=
META_CALLBACK_URL=

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_CALLBACK_URL=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# YouTube
YOUTUBE_API_KEY=

# Encryption Key for storing credentials
INTEGRATION_ENCRYPTION_KEY=
```

---

## 🛡️ الأمان

### 1. تشفير Credentials

```typescript
// utils/encryption.ts
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.INTEGRATION_ENCRYPTION_KEY!, 'hex');

export function encryptCredentials(data: object): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptCredentials(encryptedData: string): object {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}
```

### 2. Token Refresh

```typescript
// services/token-refresh.service.ts
@Injectable()
export class TokenRefreshService {
  async refreshTokenIfNeeded(integration: Integration): Promise<void> {
    if (!integration.credentials) return;
    
    const credentials = decryptCredentials(integration.credentials);
    
    if (this.isTokenExpired(credentials.expiresAt)) {
      const newTokens = await this.refreshToken(
        integration.platform,
        credentials.refreshToken
      );
      
      await this.updateCredentials(integration.id, newTokens);
    }
  }
}
```

---

## 📊 NestJS Module Structure

```
apps/api/src/
├── integrations/
│   ├── integrations.module.ts
│   ├── integrations.controller.ts
│   ├── integrations.service.ts
│   │
│   ├── dto/
│   │   ├── connect-integration.dto.ts
│   │   ├── update-settings.dto.ts
│   │   └── index.ts
│   │
│   ├── providers/
│   │   ├── social/
│   │   │   ├── twitter.provider.ts
│   │   │   ├── instagram.provider.ts
│   │   │   ├── tiktok.provider.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── google-analytics.provider.ts
│   │   │   ├── meta-pixel.provider.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── telegram.provider.ts
│   │   │   ├── slack.provider.ts
│   │   │   ├── discord.provider.ts
│   │   │   └── index.ts
│   │   │
│   │   └── storage/
│   │       ├── cloudinary.provider.ts
│   │       ├── aws-s3.provider.ts
│   │       └── index.ts
│   │
│   ├── guards/
│   │   └── integration-owner.guard.ts
│   │
│   └── utils/
│       ├── encryption.ts
│       └── oauth-helper.ts
```

---

## 🔄 Frontend Hooks

### useIntegrations Hook

```typescript
// hooks/useIntegrations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useIntegrations() {
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations').then(res => res.data),
  });

  const connectMutation = useMutation({
    mutationFn: ({ type, platform, credentials }) => 
      api.post(`/integrations/${type}/connect`, { platform, credentials }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (platform: string) => 
      api.delete(`/integrations/${platform}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ platform, settings }) => 
      api.put(`/integrations/${platform}/settings`, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  return {
    integrations,
    isLoading,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  };
}
```

---

## ✅ قائمة المهام للتنفيذ

### Phase 1: Database & Basic API
- [ ] إضافة Prisma schema للتكاملات
- [ ] تشغيل migration
- [ ] إنشاء IntegrationsModule
- [ ] إنشاء CRUD endpoints أساسية
- [ ] إنشاء encryption utilities

### Phase 2: OAuth Integrations
- [ ] إعداد Twitter OAuth
- [ ] إعداد Instagram OAuth
- [ ] إعداد Google OAuth
- [ ] إنشاء callback endpoints
- [ ] Token refresh service

### Phase 3: Notification Integrations
- [ ] Telegram Bot integration
- [ ] Slack Webhook integration
- [ ] Discord Webhook integration
- [ ] WhatsApp Business API
- [ ] Custom Webhook support

### Phase 4: Analytics Integrations
- [ ] Google Analytics 4 verification
- [ ] Meta Pixel verification
- [ ] Script injection service
- [ ] Analytics dashboard data

### Phase 5: Storage Integrations
- [ ] Cloudinary SDK integration
- [ ] AWS S3 SDK integration
- [ ] File upload service
- [ ] Usage tracking

### Phase 6: Frontend Connection
- [ ] إنشاء useIntegrations hook
- [ ] تحديث المكونات لاستخدام API حقيقي
- [ ] إضافة loading states
- [ ] إضافة error handling
- [ ] Toast notifications

---

## 📚 مراجع مفيدة

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [TikTok for Developers](https://developers.tiktok.com/)
- [Google Analytics 4 API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Cloudinary SDK](https://cloudinary.com/documentation)
- [AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)

---

## 🎯 الأولوية المقترحة

1. **عالية**: Telegram Bot (الأكثر استخداماً في المنطقة العربية)
2. **عالية**: Cloudinary (لإدارة الصور)
3. **متوسطة**: Google Analytics 4
4. **متوسطة**: Instagram
5. **منخفضة**: باقي التكاملات

---

> 💡 **ملاحظة**: هذا المستند يُعتبر مرجعاً للتطوير المستقبلي. يُنصح بتنفيذ التكاملات بشكل تدريجي حسب الأولوية وطلب المستخدمين.
