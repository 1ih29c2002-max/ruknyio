# نظام الإشعارات - WebSocket Integration

## نظرة عامة
تم تطبيق نظام إشعارات فوري باستخدام WebSocket يسمح للمستخدمين باستقبال الإشعارات في الوقت الفعلي.

## البنية التحتية

### Frontend Components

#### 1. NotificationsContext (`src/contexts/NotificationsContext.tsx`)
- **المسؤولية**: إدارة حالة الإشعارات والاتصال بـ WebSocket
- **الوظائف الرئيسية**:
  - `notifications`: قائمة جميع الإشعارات
  - `unreadCount`: عدد الإشعارات غير المقروءة
  - `markAsRead(id)`: تحديد إشعار كمقروء
  - `markAllAsRead()`: تحديد جميع الإشعارات كمقروءة
  - `deleteNotification(id)`: حذف إشعار معين
  - `clearAll()`: حذف جميع الإشعارات

#### 2. SidebarNav Component
- تم تحديثه ليستخدم `useNotifications()` hook
- عرض Badge بعدد الإشعارات غير المقروءة
- Sheet لعرض قائمة الإشعارات
- دعم التفاعل مع الإشعارات (قراءة، حذف)

### WebSocket Connection

```typescript
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  auth: {
    userId: user.id,
  },
});
```

### Events المستمع إليها

1. **`connect`**: عند الاتصال بنجاح
2. **`notification`**: استقبال إشعار جديد
3. **`disconnect`**: عند قطع الاتصال
4. **`error`**: عند حدوث خطأ

## Backend Requirements

يحتاج الـ Backend إلى تطبيق الـ endpoints والـ WebSocket التالية:

### 1. WebSocket Gateway

```typescript
// apps/api/src/notifications/notifications.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  async handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    
    if (userId) {
      this.userSockets.set(userId, client.id);
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSockets.entries())
      .find(([_, socketId]) => socketId === client.id)?.[0];
    
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  // إرسال إشعار لمستخدم معين
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // إرسال إشعار لجميع المستخدمين
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }
}
```

### 2. API Endpoints

```typescript
// apps/api/src/notifications/notifications.controller.ts

import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /api/notifications - جلب جميع الإشعارات
  @Get()
  async getNotifications(@CurrentUser() user: any) {
    return this.notificationsService.findByUserId(user.id);
  }

  // PATCH /api/notifications/:id/read - تحديد إشعار كمقروء
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  // PATCH /api/notifications/read-all - تحديد جميع الإشعارات كمقروءة
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  // DELETE /api/notifications/:id - حذف إشعار
  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationsService.delete(id, user.id);
  }

  // DELETE /api/notifications - حذف جميع الإشعارات
  @Delete()
  async clearAll(@CurrentUser() user: any) {
    return this.notificationsService.clearAll(user.id);
  }
}
```

### 3. Notification Service

```typescript
// apps/api/src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // إنشاء إشعار جديد
  async create(userId: string, data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });

    // إرسال الإشعار عبر WebSocket
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  // جلب إشعارات المستخدم
  async findByUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // آخر 50 إشعار
    });
  }

  // تحديد إشعار كمقروء
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  }

  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  // حذف إشعار
  async delete(id: string, userId: string) {
    return this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  // حذف جميع الإشعارات
  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
```

### 4. Prisma Schema

```prisma
// apps/api/prisma/schema.prisma

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String   @default("info") // info, success, warning, error
  read      Boolean  @default(false)
  data      Json?    // بيانات إضافية
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("notifications")
}
```

## أمثلة الاستخدام

### إرسال إشعار عند إنشاء طلب جديد

```typescript
// في أي service
async createOrder(userId: string, orderData: any) {
  const order = await this.prisma.order.create({
    data: orderData,
  });

  // إرسال إشعار
  await this.notificationsService.create(userId, {
    title: 'طلب جديد',
    message: `تم إنشاء طلب جديد برقم #${order.id}`,
    type: 'success',
    data: { orderId: order.id },
  });

  return order;
}
```

### إرسال إشعار لجميع المستخدمين

```typescript
async sendMaintenanceNotification() {
  const users = await this.prisma.user.findMany();
  
  for (const user of users) {
    await this.notificationsService.create(user.id, {
      title: 'صيانة مجدولة',
      message: 'سيتم إجراء صيانة للنظام يوم الجمعة',
      type: 'warning',
    });
  }
}
```

## Browser Notifications

يدعم النظام أيضاً إشعارات المتصفح الأصلية:
- يطلب الإذن عند تحميل الصفحة
- يعرض إشعار المتصفح عند استقبال إشعار جديد
- يعمل حتى عندما يكون التطبيق في الخلفية

## الخطوات التالية للتطبيق

1. ✅ إنشاء ملف migration لجدول الإشعارات
2. ✅ تطبيق NotificationsGateway
3. ✅ تطبيق NotificationsController
4. ✅ تطبيق NotificationsService
5. ✅ تسجيل NotificationsModule في AppModule
6. ✅ اختبار الاتصال بـ WebSocket
7. ✅ اختبار إرسال واستقبال الإشعارات

## الأمان

- WebSocket يستخدم المصادقة عبر `userId` في `handshake.auth`
- جميع الـ endpoints محمية بـ `JwtAuthGuard`
- المستخدم يمكنه فقط الوصول لإشعاراته الخاصة
- استخدام CORS للسماح فقط للـ Frontend المصرح به
