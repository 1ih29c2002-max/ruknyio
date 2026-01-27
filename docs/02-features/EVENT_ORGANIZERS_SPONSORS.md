# نظام المنظمين والرعاة للأحداث

## 🎯 المنظمين المشاركين (Co-Organizers)

### الأدوار المتاحة:

#### 1. **OWNER** (المالك) 
- منشئ الحدث
- ✅ جميع الصلاحيات
- يمكنه دعوة منظمين آخرين
- لا يمكن إزالته

#### 2. **CO_ORGANIZER** (منظم مشارك)
- صلاحيات كاملة تقريباً
- ✅ تعديل الحدث
- ✅ إدارة الرعاة
- ✅ إدارة التسجيلات
- ✅ عرض الإحصائيات
- ✅ إرسال إشعارات
- ✅ دعوة منظمين آخرين

#### 3. **MODERATOR** (مشرف)
- صلاحيات محدودة
- ✅ إدارة التسجيلات
- ✅ عرض الإحصائيات
- ❌ لا يمكنه تعديل الحدث

#### 4. **ASSISTANT** (مساعد)
- صلاحيات عرض فقط
- ✅ عرض التسجيلات
- ✅ عرض الإحصائيات
- ❌ لا يمكنه التعديل

### API Endpoints:

```http
# دعوة منظم
POST /events/:eventId/organizers/invite
Authorization: Bearer {token}
Body: {
  "email": "organizer@example.com",
  "role": "MODERATOR",
  "permissions": ["manage_registrations", "view_analytics"]
}

# قبول الدعوة
POST /events/:eventId/organizers/accept
Authorization: Bearer {token}

# رفض الدعوة
POST /events/:eventId/organizers/decline
Authorization: Bearer {token}

# عرض جميع المنظمين
GET /events/:eventId/organizers
Authorization: Bearer {token}

# تحديث دور منظم
PUT /events/:eventId/organizers/:userId
Authorization: Bearer {token}
Body: {
  "role": "CO_ORGANIZER",
  "permissions": ["edit_event", "manage_sponsors"]
}

# إزالة منظم
DELETE /events/:eventId/organizers/:userId
Authorization: Bearer {token}
```

### الصلاحيات المتاحة:

- `manage_event` - إدارة الحدث كاملاً
- `edit_event` - تعديل تفاصيل الحدث
- `delete_event` - حذف الحدث
- `manage_organizers` - إدارة المنظمين
- `manage_sponsors` - إدارة الرعاة
- `manage_registrations` - إدارة التسجيلات
- `view_registrations` - عرض التسجيلات
- `view_analytics` - عرض الإحصائيات
- `send_notifications` - إرسال إشعارات

---

## 💼 الرعاة (Sponsors)

### المستويات (Tiers):

1. **PLATINUM** 🏆 - راعي بلاتيني (الأعلى)
2. **GOLD** 🥇 - راعي ذهبي
3. **SILVER** 🥈 - راعي فضي
4. **BRONZE** 🥉 - راعي برونزي
5. **PARTNER** 🤝 - شريك

### API Endpoints:

```http
# إضافة راعي
POST /events/:eventId/sponsors
Authorization: Bearer {token}
Body: {
  "name": "Tech Company",
  "nameAr": "شركة التقنية",
  "logo": "https://example.com/logo.png",
  "website": "https://techcompany.com",
  "description": "Leading tech solutions provider",
  "tier": "GOLD",
  "displayOrder": 1,
  "isActive": true
}

# عرض جميع الرعاة
GET /events/:eventId/sponsors
Query: ?includeInactive=false

# تحديث راعي
PUT /events/:eventId/sponsors/:sponsorId
Authorization: Bearer {token}
Body: {
  "tier": "PLATINUM",
  "displayOrder": 0
}

# حذف راعي
DELETE /events/:eventId/sponsors/:sponsorId
Authorization: Bearer {token}
```

---

## 📧 إشعارات البريد الإلكتروني

### دعوة منظم

عند دعوة منظم جديد، يتم إرسال email يحتوي على:
- اسم الحدث
- الدور المحدد
- قائمة الصلاحيات
- اسم الشخص الذي أرسل الدعوة
- أزرار للقبول أو الرفض

---

## 🔐 الحماية والأمان

### التحقق من الصلاحيات:

```typescript
// فحص صلاحية معينة
const hasPermission = await eventOrganizersService.hasPermission(
  eventId,
  userId,
  'manage_registrations'
);

if (!hasPermission) {
  throw new ForbiddenException('No permission');
}
```

### القواعد الأمنية:

1. **المالك فقط** يمكنه:
   - حذف الحدث
   - تغيير أدوار المنظمين
   - دعوة CO_ORGANIZERS

2. **CO_ORGANIZER** يمكنه:
   - دعوة MODERATORS و ASSISTANTS
   - إدارة معظم جوانب الحدث

3. **MODERATOR** يمكنه:
   - إدارة التسجيلات فقط

4. **ASSISTANT** يمكنه:
   - العرض فقط

---

## 🗄️ قاعدة البيانات

### جدول EventOrganizer:

```prisma
model EventOrganizer {
  id          String
  eventId     String
  userId      String
  role        OrganizerRole
  permissions String[]
  status      InvitationStatus  // PENDING, ACCEPTED, DECLINED
  invitedBy   String
  invitedAt   DateTime
  acceptedAt  DateTime?
}
```

### جدول EventSponsor:

```prisma
model EventSponsor {
  id           String
  eventId      String
  name         String
  nameAr       String?
  logo         String?
  website      String?
  description  String?
  tier         SponsorTier
  displayOrder Int
  isActive     Boolean
}
```

---

## 🎨 عرض الرعاة

الرعاة يتم ترتيبهم حسب:
1. `displayOrder` (تصاعدي)
2. `tier` (من PLATINUM إلى PARTNER)
3. `createdAt` (الأحدث أولاً)

---

## 📝 مثال كامل

```typescript
// 1. إنشاء حدث
const event = await eventsService.create(userId, eventDto);

// 2. دعوة منظم مشارك
await organizersService.inviteOrganizer(
  event.id,
  userId,
  {
    email: 'coorganizer@example.com',
    role: 'CO_ORGANIZER',
    permissions: ['edit_event', 'manage_sponsors'],
  }
);

// 3. قبول الدعوة
await organizersService.acceptInvitation(event.id, coOrganizerUserId);

// 4. إضافة رعاة
await sponsorsService.addSponsor(event.id, userId, {
  name: 'Tech Corp',
  tier: 'PLATINUM',
  logo: 'https://...',
});

await sponsorsService.addSponsor(event.id, userId, {
  name: 'Software Inc',
  tier: 'GOLD',
  logo: 'https://...',
});
```

---

## 🚀 الخطوات التالية

1. ✅ تشغيل Migration
2. ✅ توليد Prisma Client
3. ✅ تسجيل Services في Module
4. ✅ إضافة Controllers
5. ✅ اختبار APIs
