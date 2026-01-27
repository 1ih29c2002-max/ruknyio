# تكامل الإشعارات في النظام - دليل كامل

## ✅ تم التكامل بنجاح في:

### 1. 🔒 نظام الأمان (Security)
**الموقع**: `apps/api/src/modules/core/security/log.service.ts`

**متى تظهر الإشعارات**:
- ✅ عند محاولات تسجيل دخول فاشلة
- ✅ عند اكتشاف أنشطة مشبوهة
- ✅ عند أي حدث أمني بحالة `FAILED`
- ✅ عند أي action يحتوي على كلمة `SUSPICIOUS`

**مثال**:
```typescript
// تلقائي - يرسل إشعار عند فشل تسجيل الدخول
await this.securityLogService.createLog({
  userId: 'user-id',
  action: 'LOGIN_ATTEMPT',
  status: 'FAILED',
  description: 'محاولة تسجيل دخول فاشلة',
});
// سيظهر إشعار تنبيه أمني للمستخدم فوراً
```

---

### 2. 👤 نظام المستخدمين (User)
**الموقع**: `apps/api/src/modules/core/user/user.service.ts`

**متى تظهر الإشعارات**:
- ✅ عند تحديث معلومات الملف الشخصي
- ✅ عند تغيير كلمة المرور
- ✅ عند تغيير البريد الإلكتروني

**أمثلة**:

#### تحديث الملف الشخصي:
```typescript
await userService.updateProfile(userId, {
  name: 'اسم جديد',
  phone: '123456789'
});
// إشعار: "تم تحديث معلومات ملفك الشخصي بنجاح: name, phone"
```

#### تغيير كلمة المرور:
```typescript
await userService.changePassword(userId, {
  currentPassword: 'old',
  newPassword: 'new'
});
// إشعار أمني: "تم تغيير كلمة المرور الخاصة بحسابك بنجاح"
```

---

### 3. 📅 نظام الأحداث (Events)
**الموقع**: `apps/api/src/modules/events/events.service.ts`

**متى تظهر الإشعارات**:
- ✅ عند إنشاء حدث جديد
- ✅ عند تحديث حدث موجود

**أمثلة**:

#### إنشاء حدث:
```typescript
await eventsService.create(userId, {
  title: 'ورشة عمل',
  description: 'ورشة عمل تقنية',
  startDate: new Date(),
  endDate: new Date()
});
// إشعار: "تم إنشاء حدث 'ورشة عمل' بنجاح"
```

#### تحديث حدث:
```typescript
await eventsService.update(eventId, userId, {
  title: 'عنوان محدث',
  maxAttendees: 100
});
// إشعار: "تم تحديث حدث 'عنوان محدث' بنجاح"
```

---

### 4. 📝 نظام النماذج (Forms)
**الموقع**: `apps/api/src/modules/forms/forms.service.ts`

**متى تظهر الإشعارات**:
- ✅ عند إنشاء نموذج جديد

**مثال**:
```typescript
await formsService.create(userId, {
  title: 'استبيان رضا العملاء',
  slug: 'customer-satisfaction',
  type: 'SURVEY',
  fields: [...]
});
// إشعار: "تم إنشاء نموذج 'استبيان رضا العملاء' بنجاح"
```

---

## 🧪 كيفية الاختبار

### 1. اختبار سريع عبر API

أرسل طلب POST إلى:
```http
POST /api/notifications/test
Authorization: Bearer YOUR_JWT_TOKEN
```

سيرسل إشعار تجريبي عشوائي للمستخدم المسجل دخوله.

### 2. اختبار من الأنظمة الفعلية

#### اختبار نظام الأمان:
```bash
# حاول تسجيل دخول بكلمة مرور خاطئة
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "wrong-password"
}
# سيظهر إشعار تنبيه أمني
```

#### اختبار نظام المستخدمين:
```bash
# حدث معلومات ملفك
PUT /api/user/profile
{
  "name": "اسم جديد",
  "phone": "123456789"
}
# سيظهر إشعار النجاح
```

#### اختبار نظام الأحداث:
```bash
# أنشئ حدث جديد
POST /api/events
{
  "title": "ورشة عمل تجريبية",
  "startDate": "2025-12-01T10:00:00Z",
  "endDate": "2025-12-01T12:00:00Z"
}
# سيظهر إشعار النجاح
```

#### اختبار نظام النماذج:
```bash
# أنشئ نموذج جديد
POST /api/forms
{
  "title": "نموذج تجريبي",
  "slug": "test-form",
  "type": "SURVEY"
}
# سيظهر إشعار النجاح
```

---

## 📱 كيف تظهر الإشعارات؟

### على الـ Frontend:

1. **في الوقت الفعلي** (Real-time):
   - عبر WebSocket يصل الإشعار فوراً
   - يظهر Badge على أيقونة الجرس
   - يظهر Browser Notification إذا كانت الأذونات ممنوحة

2. **عند فتح قائمة الإشعارات**:
   - Sheet ينزلق من الجانب
   - يعرض جميع الإشعارات مع:
     - أيقونات ملونة حسب النوع
     - عنوان ورسالة
     - توقيت نسبي بالعربية
     - نقطة زرقاء للإشعارات غير المقروءة

3. **التفاعل**:
   - اضغط على الإشعار = تحديد كمقروء
   - زر "قراءة الكل" في الأعلى
   - زر حذف (X) لكل إشعار

---

## 🎨 أنواع الإشعارات والألوان

| النوع | اللون | الأيقونة | متى يُستخدم |
|------|------|---------|------------|
| `INFO` | أزرق | ℹ | معلومات عامة |
| `SUCCESS` | أخضر | ✓ | نجاح العملية |
| `WARNING` | أصفر | ⚠ | تحذير |
| `ERROR` | أحمر | ✕ | خطأ |
| `SECURITY_ALERT` | بنفسجي | 🔒 | تنبيهات أمنية |
| `ORDER_RECEIVED` | أزرق | 📦 | طلب جديد |
| `ORDER_CONFIRMED` | أخضر | ✓ | تأكيد طلب |
| `ORDER_SHIPPED` | أزرق | 📦 | شحن |
| `ORDER_DELIVERED` | أخضر | ✓ | توصيل |
| `ORDER_CANCELLED` | أحمر | ✕ | إلغاء |
| `LOW_STOCK` | أصفر | ⚠ | مخزون منخفض |
| `OUT_OF_STOCK` | أحمر | ✕ | نفاذ مخزون |
| `PRODUCT_BACK_IN_STOCK` | أخضر | 🔄 | عودة للمخزون |
| `PRICE_DROP` | برتقالي | 💰 | انخفاض سعر |
| `NEW_REVIEW` | برتقالي | ⭐ | مراجعة جديدة |

---

## 🔧 إضافة إشعارات لأنظمة أخرى

### خطوات الإضافة:

1. **استيراد NotificationsService**:
```typescript
import { NotificationsService } from '../shared/notifications/notifications.service';

constructor(
  private notificationsService: NotificationsService,
) {}
```

2. **إضافة NotificationsModule في Module**:
```typescript
@Module({
  imports: [
    // ... other imports
    NotificationsModule,
  ],
})
```

3. **إرسال الإشعار**:
```typescript
await this.notificationsService.create({
  userId: 'user-id',
  type: 'SUCCESS', // أو أي نوع آخر
  title: 'العنوان',
  message: 'الرسالة التفصيلية',
  data: { // بيانات إضافية (اختياري)
    orderId: 'order-123',
    amount: 1000
  },
});
```

---

## 📊 مثال كامل: إضافة إشعارات للطلبات

```typescript
// في OrdersService
import { NotificationsService } from '../shared/notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createOrder(userId: string, orderData: any) {
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        userId,
        status: 'PENDING',
      },
    });

    // إشعار للعميل
    await this.notificationsService.create({
      userId,
      type: 'ORDER_RECEIVED',
      title: 'تم استلام طلبك',
      message: `تم استلام طلبك #${order.id} وسيتم معالجته قريباً`,
      data: {
        orderId: order.id,
        amount: order.total,
        status: order.status,
      },
    });

    // إشعار لصاحب المتجر
    await this.notificationsService.create({
      userId: order.storeOwnerId,
      type: 'ORDER_RECEIVED',
      title: 'طلب جديد',
      message: `لديك طلب جديد #${order.id} بقيمة ${order.total} د.ع`,
      data: {
        orderId: order.id,
        customerName: order.customerName,
        amount: order.total,
      },
    });

    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { user: true },
    });

    // تحديد نوع الإشعار حسب الحالة
    const notificationTypes = {
      'CONFIRMED': 'ORDER_CONFIRMED',
      'SHIPPED': 'ORDER_SHIPPED',
      'DELIVERED': 'ORDER_DELIVERED',
      'CANCELLED': 'ORDER_CANCELLED',
    };

    const messages = {
      'CONFIRMED': 'تم تأكيد طلبك',
      'SHIPPED': 'تم شحن طلبك',
      'DELIVERED': 'تم توصيل طلبك',
      'CANCELLED': 'تم إلغاء طلبك',
    };

    await this.notificationsService.create({
      userId: order.userId,
      type: notificationTypes[newStatus] || 'ORDER_STATUS_CHANGED',
      title: messages[newStatus] || 'تحديث حالة الطلب',
      message: `حالة طلبك #${order.id}: ${newStatus}`,
      data: {
        orderId: order.id,
        status: newStatus,
      },
    });

    return order;
  }
}
```

---

## ✨ الخلاصة

الآن الإشعارات تعمل تلقائياً في:
- ✅ نظام الأمان (تنبيهات أمنية)
- ✅ نظام المستخدمين (تحديثات الملف الشخصي)
- ✅ نظام الأحداث (إنشاء وتحديث)
- ✅ نظام النماذج (إنشاء نماذج)

**للاختبار الفوري**: استخدم endpoint `/api/notifications/test` 🚀
