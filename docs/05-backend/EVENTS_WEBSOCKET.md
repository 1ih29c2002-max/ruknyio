# Events WebSocket Documentation

## 📡 نظام الإشعارات في الوقت الفعلي للأحداث

تم تطبيق **Socket.IO** لتوفير تحديثات فورية للمستخدمين والمنظمين في قسم الأحداث.

---

## 🔌 الاتصال (Connection)

### Backend URL
```typescript
const socket = io('http://localhost:3000/events', {
  auth: {
    userId: 'user-id-here'
  }
});
```

### Namespace
- **`/events`** - مخصص لكل الأحداث والإشعارات المتعلقة بها

---

## 🏠 Rooms (الغرف)

يتم تنظيم الاتصالات في غرف لضمان وصول الإشعارات للمستخدمين المناسبين فقط:

| Room | الوصف | من يدخل |
|------|-------|---------|
| `user:{userId}` | غرفة خاصة بمستخدم معين | تلقائياً عند الاتصال |
| `event:{eventId}` | كل المهتمين بحدث معين | عند الانضمام يدوياً |
| `event:{eventId}:organizers` | المنظمون فقط | عند الانضمام كمنظم |
| `event:{eventId}:attendees` | المسجلون فقط | عند الانضمام كمسجل |

---

## 📤 Client → Server Events

### 1. الانضمام لحدث معين
```typescript
socket.emit('join-event', {
  eventId: 'event-uuid',
  role: 'organizer' // or 'attendee' or undefined
});

// Response
{
  success: true,
  message: 'Joined event {eventId}'
}
```

### 2. مغادرة حدث
```typescript
socket.emit('leave-event', {
  eventId: 'event-uuid'
});

// Response
{
  success: true,
  message: 'Left event {eventId}'
}
```

---

## 📥 Server → Client Events

### 🎯 للمنظمين (Organizers Only)

#### 1. `new-registration` - تسجيل جديد
```typescript
socket.on('new-registration', (data) => {
  console.log(data);
  // {
  //   attendeeName: 'أحمد محمد',
  //   attendeeAvatar: 'https://...',
  //   totalRegistrations: 15,
  //   maxAttendees: 50,
  //   timestamp: '2025-11-01T10:30:00Z'
  // }
});
```

**متى يُرسل**: عند تسجيل شخص جديد في الحدث

**Use Case**: 
- عرض إشعار فوري للمنظم
- تحديث لوحة التحكم
- عرض اسم المسجل الجديد

---

#### 2. `registration-cancelled` - إلغاء تسجيل
```typescript
socket.on('registration-cancelled', (data) => {
  // {
  //   attendeeName: 'سارة علي',
  //   totalRegistrations: 14,
  //   maxAttendees: 50,
  //   timestamp: '2025-11-01T11:00:00Z'
  // }
});
```

**متى يُرسل**: عند إلغاء شخص تسجيله

**Use Case**: 
- إشعار المنظم بالإلغاء
- تحديث العداد

---

#### 3. `event-stats-update` - تحديث الإحصائيات
```typescript
socket.on('event-stats-update', (data) => {
  // {
  //   totalRegistrations: 15,
  //   confirmedAttendees: 12,
  //   waitlistCount: 3,
  //   checkInsCount: 0,
  //   avgRating: 4.5,
  //   totalReviews: 8
  // }
});
```

**متى يُرسل**: بعد كل تسجيل/إلغاء/مراجعة

**Use Case**: 
- Dashboard لوحة تحكم المنظم
- عرض الإحصائيات الحية

---

#### 4. `new-review` - مراجعة جديدة
```typescript
socket.on('new-review', (data) => {
  // {
  //   reviewerName: 'خالد أحمد',
  //   rating: 5,
  //   comment: 'حدث رائع!',
  //   isAnonymous: false,
  //   avgRating: 4.7,
  //   totalReviews: 9,
  //   timestamp: '2025-11-01T15:00:00Z'
  // }
});
```

**متى يُرسل**: عند إضافة مراجعة جديدة

---

### 👥 للمسجلين (Attendees Only)

#### 5. `event-status-changed` - تغيير حالة الحدث
```typescript
socket.on('event-status-changed', (data) => {
  // {
  //   status: 'ONGOING', // SCHEDULED | ONGOING | COMPLETED | CANCELLED
  //   message: 'Event has started!',
  //   timestamp: '2025-11-01T14:00:00Z'
  // }
});
```

**متى يُرسل**: عند تغيير حالة الحدث

**Use Case**: 
- إشعار فوري عند بدء الحدث
- إشعار بالإلغاء
- تحديث واجهة المستخدم

---

#### 6. `event-details-updated` - تحديث تفاصيل الحدث
```typescript
socket.on('event-details-updated', (data) => {
  // {
  //   updatedFields: ['startDate', 'location'],
  //   changes: {
  //     startDate: '2025-11-05T10:00:00Z',
  //     location: 'قاعة جديدة'
  //   },
  //   message: 'Event details have been updated',
  //   timestamp: '2025-11-01T12:00:00Z'
  // }
});
```

**متى يُرسل**: عند تحديث تفاصيل الحدث (الوقت، المكان، إلخ)

**Use Case**: 
- إشعار المسجلين بالتغييرات المهمة
- تحديث معلومات الحدث في الواجهة

---

#### 7. `organizer-announcement` - إعلان من المنظم
```typescript
socket.on('organizer-announcement', (data) => {
  // {
  //   message: 'تم تغيير موعد الحدث',
  //   organizerName: 'أحمد محمد',
  //   timestamp: '2025-11-01T10:00:00Z',
  //   priority: 'high' // 'low' | 'medium' | 'high'
  // }
});
```

**متى يُرسل**: عند إرسال المنظم إعلان (يحتاج API endpoint)

**Use Case**: 
- إشعارات عاجلة للمسجلين
- تحديثات مهمة أثناء الحدث

---

#### 8. `event-starting-soon` - الحدث سيبدأ قريباً
```typescript
socket.on('event-starting-soon', (data) => {
  // {
  //   eventTitle: 'ورشة البرمجة',
  //   startDate: '2025-11-01T14:00:00Z',
  //   minutesUntilStart: 15,
  //   meetingUrl: 'https://zoom.us/...'
  // }
});
```

**متى يُرسل**: قبل 15 دقيقة من بدء الحدث (يحتاج Cron Job)

**Use Case**: 
- تذكير المسجلين
- عرض رابط الاجتماع للأحداث الافتراضية

---

### 🌍 للجميع (Public - في غرفة الحدث)

#### 9. `attendees-count-update` - تحديث عدد المسجلين
```typescript
socket.on('attendees-count-update', (data) => {
  // {
  //   totalRegistrations: 15,
  //   maxAttendees: 50,
  //   availableSeats: 35,
  //   isFull: false
  // }
});
```

**متى يُرسل**: بعد كل تسجيل أو إلغاء

**Use Case**: 
- عداد حي للأماكن المتاحة
- عرض "مكتمل" إذا امتلأ
- تشجيع المستخدمين على التسجيل السريع

---

#### 10. `availability-changed` - تغيير التوفر
```typescript
socket.on('availability-changed', (data) => {
  // {
  //   isAvailable: true,
  //   availableSeats: 5,
  //   message: '5 seats now available!'
  // }
});
```

**متى يُرسل**: عند توفر أماكن جديدة (بعد إلغاءات)

**Use Case**: 
- إشعار المتصفحين بتوفر أماكن
- عرض رسالة تشجيعية

---

### 🎫 لقائمة الانتظار (Waitlist)

#### 11. `waitlist-promotion` - ترقية من قائمة الانتظار
```typescript
socket.on('waitlist-promotion', (data) => {
  // {
  //   eventId: 'event-uuid',
  //   eventTitle: 'ورشة البرمجة',
  //   eventStartDate: '2025-11-05T10:00:00Z',
  //   position: 1,
  //   expiresAt: '2025-11-02T10:00:00Z' // 24 hours
  // }
});
```

**متى يُرسل**: عند إلغاء شخص وأنت أول في قائمة الانتظار

**Use Case**: 
- إشعار فوري بتوفر مكان
- عداد تنازلي (24 ساعة للرد)
- زر "قبول" مباشر

---

#### 12. `waitlist-position-update` - تحديث موقعك في القائمة
```typescript
socket.on('waitlist-position-update', (data) => {
  // {
  //   eventId: 'event-uuid',
  //   position: 2,
  //   totalWaiting: 5
  // }
});
```

**متى يُرسل**: عند تغيير موقعك في قائمة الانتظار

**Use Case**: 
- عرض ترتيبك الحالي
- تقدير الوقت المتوقع

---

## 🎨 Frontend Implementation Example

### React + Socket.IO Client

#### Installation
```bash
npm install socket.io-client
```

#### Connection Hook
```typescript
// hooks/useEventsSocket.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useEventsSocket = (userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io('http://localhost:3000/events', {
      auth: { userId }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to /events');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from /events');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return { socket, isConnected };
};
```

#### Event Page Component
```typescript
// components/EventPage.tsx
import { useEffect } from 'react';
import { useEventsSocket } from '../hooks/useEventsSocket';
import { toast } from 'react-hot-toast';

export const EventPage = ({ eventId, userId, isOrganizer }) => {
  const { socket, isConnected } = useEventsSocket(userId);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // الانضمام لغرفة الحدث
    socket.emit('join-event', {
      eventId,
      role: isOrganizer ? 'organizer' : 'attendee'
    });

    // الاستماع للإشعارات
    if (isOrganizer) {
      // إشعارات المنظم
      socket.on('new-registration', (data) => {
        toast.success(`${data.attendeeName} just registered!`);
        // تحديث UI
      });

      socket.on('event-stats-update', (data) => {
        // تحديث Dashboard
      });
    } else {
      // إشعارات المسجلين
      socket.on('event-status-changed', (data) => {
        toast.info(`Event status: ${data.status}`);
      });

      socket.on('event-details-updated', (data) => {
        toast.warning('Event details have been updated!');
      });
    }

    // للجميع
    socket.on('attendees-count-update', (data) => {
      // تحديث العداد
      setAttendeesCount(data.totalRegistrations);
      setAvailableSeats(data.availableSeats);
    });

    // Cleanup
    return () => {
      socket.emit('leave-event', { eventId });
      socket.off('new-registration');
      socket.off('event-stats-update');
      socket.off('event-status-changed');
      socket.off('event-details-updated');
      socket.off('attendees-count-update');
    };
  }, [socket, isConnected, eventId, isOrganizer]);

  return (
    <div>
      {/* UI */}
    </div>
  );
};
```

#### Waitlist Notification Component
```typescript
// components/WaitlistNotification.tsx
import { useEffect } from 'react';
import { useEventsSocket } from '../hooks/useEventsSocket';

export const WaitlistNotification = ({ userId }) => {
  const { socket, isConnected } = useEventsSocket(userId);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('waitlist-promotion', (data) => {
      // عرض Modal فوري
      showPromotionModal({
        title: `🎉 مكان متاح في ${data.eventTitle}`,
        message: 'لديك 24 ساعة للتسجيل',
        expiresAt: data.expiresAt,
        onAccept: () => {
          // API call to register
          registerForEvent(data.eventId);
        }
      });
    });

    return () => {
      socket.off('waitlist-promotion');
    };
  }, [socket, isConnected, userId]);

  return null;
};
```

---

## 🔒 Authentication & Authorization

### الأمان في WebSocket

#### 1. التحقق من الهوية
```typescript
// في Gateway
handleConnection(client: Socket) {
  const userId = client.handshake.auth?.userId;
  
  if (!userId) {
    client.disconnect();
    return;
  }
  
  // يمكن إضافة JWT validation هنا
}
```

#### 2. التحقق من الصلاحيات
```typescript
// قبل الانضمام لغرفة المنظمين
@SubscribeMessage('join-event')
async handleJoinEvent(client: Socket, data: any) {
  if (data.role === 'organizer') {
    // التحقق من أن المستخدم منظم فعلاً
    const isOrganizer = await this.checkIsOrganizer(
      data.userId,
      data.eventId
    );
    
    if (!isOrganizer) {
      return { success: false, message: 'Unauthorized' };
    }
  }
  
  // ...
}
```

---

## 📊 Use Cases Summary

| Use Case | Event | Receiver | Priority |
|----------|-------|----------|----------|
| إشعار تسجيل جديد | `new-registration` | المنظمون | High |
| تحديث عدد المقاعد | `attendees-count-update` | الجميع | High |
| ترقية من قائمة الانتظار | `waitlist-promotion` | المستخدم | Critical |
| تحديث تفاصيل الحدث | `event-details-updated` | المسجلون | Medium |
| تغيير حالة الحدث | `event-status-changed` | المسجلون | High |
| مراجعة جديدة | `new-review` | المنظمون | Low |
| Dashboard إحصائيات | `event-stats-update` | المنظمون | Medium |
| الحدث سيبدأ قريباً | `event-starting-soon` | المسجلون | Critical |

---

## 🚀 Next Steps

### ميزات قادمة (Optional)
1. ✅ **Q&A Live System** - أسئلة حية أثناء الحدث
2. ✅ **Live Polls** - استطلاعات فورية
3. ✅ **Reactions** - تفاعلات (👍 ❤️ 👏)
4. ✅ **Chat Room** - دردشة أثناء الحدث
5. ✅ **Screen Sharing Notifications** - إشعارات مشاركة الشاشة

---

## 🧪 Testing

### Postman/WebSocket Testing
```javascript
// يمكن استخدام Postman أو أي WebSocket client
const socket = io('http://localhost:3000/events', {
  auth: { userId: 'test-user-id' }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  socket.emit('join-event', {
    eventId: 'test-event-id',
    role: 'organizer'
  });
});

socket.on('new-registration', console.log);
```

---

## 📝 Notes

- ✅ WebSocket يعمل على نفس البورت مع REST API
- ✅ استخدام Namespace منفصل `/events` لتنظيم أفضل
- ✅ Rooms تضمن وصول الإشعارات للأشخاص المناسبين فقط
- ✅ Auto-reconnection مفعّل تلقائياً في Socket.IO
- ⚠️ يجب إضافة JWT validation للأمان الكامل
- ⚠️ بعض الأحداث تحتاج Cron Jobs (مثل `event-starting-soon`)

---

## 🎯 Integration Status

- ✅ Gateway Setup
- ✅ Events Service Integration
- ✅ Registrations Notifications
- ✅ Waitlist Notifications
- ✅ Event Updates Notifications
- ⏳ Frontend Implementation (Pending)
- ⏳ Cron Jobs for Reminders (Pending)
- ⏳ Reviews Notifications (Pending)
