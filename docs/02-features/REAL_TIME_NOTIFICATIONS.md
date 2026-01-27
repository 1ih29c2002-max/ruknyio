# Real-time Notifications System
# نظام الإشعارات الفورية

## 📡 **نظرة عامة | Overview**

تم إنشاء نظام إشعارات فورية متكامل باستخدام **Socket.io** و **WebSockets** لتوفير تجربة تفاعلية في الوقت الفعلي.

---

## ✅ **ما تم تنفيذه | What's Implemented**

### **1. NotificationsGateway** 🔔
**الموقع:** `apps/api/src/notifications/notifications.gateway.ts`

**المسؤوليات:**
- إدارة اتصالات WebSocket
- إرسال إشعارات في الوقت الفعلي
- تتبع المستخدمين المتصلين (Online/Offline)
- معالجة رسائل العملاء

**الـ Namespace:**
```typescript
ws://localhost:3001/notifications
```

---

## 🎯 **أنواع الإشعارات | Notification Types**

### **1. Follow Notifications** 👥
```typescript
emitFollowNotification(targetUserId, followerInfo)
```
**متى يُرسل:**
- عندما يتابعك مستخدم جديد

**البيانات المرسلة:**
```typescript
{
  id: string;
  type: 'follow';
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderUsername?: string;
  message: "John Doe started following you";
  link: "/johndoe";
  createdAt: Date;
  read: false;
}
```

### **2. Post Like Notifications** ❤️
```typescript
emitPostLikeNotification(postOwnerId, likerInfo, postId, postPreview)
```
**متى يُرسل:**
- عندما يعجب شخص بمنشورك

**البيانات المرسلة:**
```typescript
{
  type: 'post_like';
  message: "John Doe liked your post";
  link: "/posts/abc123";
  metadata: {
    postId: "abc123",
    postPreview: "First 50 characters..."
  }
}
```

### **3. Comment Notifications** 💬
```typescript
emitPostCommentNotification(postOwnerId, commenterInfo, postId, commentPreview)
```
**متى يُرسل:**
- عندما يعلق شخص على منشورك

**البيانات المرسلة:**
```typescript
{
  type: 'post_comment';
  message: "John Doe commented on your post: 'Great post!...'";
  link: "/posts/abc123";
  metadata: {
    postId: "abc123",
    commentPreview: "Full comment text..."
  }
}
```

### **4. Mention Notifications** @️⃣
```typescript
emitMentionNotification(mentionedUserId, mentionerInfo, contentType, contentId, preview)
```
**متى يُرسل:**
- عندما يذكرك شخص في منشور أو تعليق (@username)

### **5. Comment Reply Notifications** 💭
```typescript
emitCommentReplyNotification(commentOwnerId, replierInfo, postId, replyPreview)
```
**متى يُرسل:**
- عندما يرد شخص على تعليقك

---

## 🔌 **كيفية الاتصال | How to Connect**

### **Backend Integration** (تم بالفعل ✅)

#### **في Follow Service:**
```typescript
import { NotificationsGateway } from '../notifications/notifications.gateway';

constructor(
  private prisma: PrismaService,
  private notificationsGateway: NotificationsGateway,
) {}

// عند المتابعة
async followUser(followerId: string, followingId: string) {
  // ... create follow
  
  // 🔔 إرسال إشعار
  this.notificationsGateway.emitFollowNotification(followingId, {
    id: follower.id,
    name: follower.name,
    username: follower.username,
    avatar: follower.avatar,
  });
}
```

#### **في Posts Service:**
```typescript
// عند الإعجاب بمنشور
async likePost(userId: string, postId: string) {
  // ... create like
  
  // 🔔 إرسال إشعار (فقط إذا لم يكن المنشور خاصًا بك)
  if (post.userId !== userId) {
    this.notificationsGateway.emitPostLikeNotification(
      post.userId,
      likerInfo,
      postId,
      post.content?.substring(0, 50)
    );
  }
}

// عند التعليق
async addComment(userId: string, postId: string, createCommentDto) {
  // ... create comment
  
  // 🔔 إرسال إشعار
  if (post.userId !== userId) {
    this.notificationsGateway.emitPostCommentNotification(
      post.userId,
      commenterInfo,
      postId,
      comment.content
    );
  }
}
```

---

## 🌐 **Frontend Integration** (يجب تنفيذه)

### **1. تثبيت Socket.io Client**
```bash
npm install socket.io-client
```

### **2. إنشاء Notifications Context**

**`apps/web/src/contexts/notifications-context.tsx`:**
```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  senderName: string;
  senderAvatar?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    // الاتصال بـ Socket.io
    const newSocket = io('http://localhost:3001/notifications', {
      auth: {
        userId: session.user.id,
      },
      transports: ['websocket'],
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Connected to notifications:', data);
    });

    // الاستماع للإشعارات الجديدة
    newSocket.on('new-notification', (notification: Notification) => {
      console.log('🔔 New notification:', notification);
      
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // إظهار toast notification
      showToast(notification);
    });

    // الاستماع لحالة المستخدمين (online/offline)
    newSocket.on('user-status-changed', (data) => {
      console.log('👤 User status:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.id]);

  const markAsRead = (notificationId: string) => {
    socket?.emit('mark-as-read', { notificationId });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const showToast = (notification: Notification) => {
    // استخدم مكتبة toast مثل sonner أو react-hot-toast
    // toast.success(notification.message);
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, socket, markAsRead, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
```

### **3. Notifications Bell Component**

**`apps/web/src/components/notifications/notifications-bell.tsx`:**
```typescript
'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/notifications-context';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function NotificationsBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  {notification.senderAvatar && (
                    <img
                      src={notification.senderAvatar}
                      alt={notification.senderName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### **4. استخدام في Layout**

**`apps/web/src/app/layout.tsx`:**
```typescript
import { NotificationsProvider } from '@/contexts/notifications-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 🔧 **ميزات إضافية | Additional Features**

### **1. Online/Offline Status**
```typescript
// التحقق من حالة المستخدم
socket.emit('get-online-status', { userIds: ['user1', 'user2'] });

// الاستماع للتحديثات
socket.on('user-status-changed', ({ userId, status }) => {
  console.log(`${userId} is now ${status}`);
});
```

### **2. Typing Indicators**
```typescript
// إرسال typing indicator
socket.emit('typing-start', { targetUserId: 'user123' });
socket.emit('typing-stop', { targetUserId: 'user123' });

// الاستماع
socket.on('user-typing', ({ userId }) => {
  showTypingIndicator(userId);
});
```

### **3. Mark as Read**
```typescript
socket.emit('mark-as-read', { notificationId: 'notif_123' });
```

---

## 📊 **الإحصائيات | Statistics**

### **Backend:**
```
✅ NotificationsGateway كامل
✅ مدمج مع Follow Module
✅ مدمج مع Posts Module
✅ 5 أنواع إشعارات
✅ Online/Offline tracking
✅ Typing indicators
```

### **Frontend (يجب تنفيذه):**
```
⏳ NotificationsContext
⏳ NotificationsBell Component
⏳ Socket.io Client Setup
⏳ Toast Notifications
```

---

## 🚀 **الخطوات التالية | Next Steps**

1. ⏳ **Frontend Implementation**
   - إنشاء NotificationsContext
   - إنشاء NotificationsBell Component
   - دمج Socket.io Client

2. ⏳ **Database Persistence**
   - إنشاء Notification Model في Prisma
   - حفظ الإشعارات في قاعدة البيانات
   - API لجلب الإشعارات القديمة

3. ⏳ **Advanced Features**
   - Push Notifications (Web Push API)
   - Email notifications
   - Notification preferences
   - Mute/Unmute users

---

## 🎯 **الخلاصة | Summary**

### ✅ **Backend: مكتمل 100%**
- NotificationsGateway جاهز
- مدمج مع جميع الـ Services
- يرسل إشعارات فورية للمتابعة والإعجاب والتعليق

### ⏳ **Frontend: يحتاج تنفيذ**
- Context API للـ Notifications
- Components للعرض
- Socket.io Client Integration

**الوقت المتوقع للتنفيذ الكامل:** 2-3 ساعات

---

**تاريخ الإنشاء:** 30 أكتوبر 2025  
**الحالة:** ✅ Backend جاهز | ⏳ Frontend قيد الانتظار
