# مراجعة Backend لصفحة الإعدادات

مراجعة الـ API والـ Frontend قبل تنفيذ صفحة الإعدادات `/app/settings`.

---

## 1. الوضع الحالي

### Frontend
- **المسار:** `apps/web/src/app/(user)/app/settings` — **المجلد فارغ** (لا توجد صفحة بعد).
- **Layout:** الصفحات تحت `/app/settings` لا تعرض الـ Sidebar الرئيسي (لها sidebar خاص حسب التعليق في `layout.tsx`).
- **التوجيه:** الروابط تشير إلى `/app/settings` و`/app/settings?tab=security` (من الإيميلات).

### Backend – Endpoints المتاحة

| النوع | المسار | الوصف |
|-------|--------|--------|
| **User** (`/api/v1/user`) | | |
| GET | `/user/profile` | جلب الملف الشخصي (مع profile.name, username, avatar, bio, coverImage, …) |
| PUT | `/user/profile` | تحديث الملف (UpdateProfileDto: name?, email?, phone?, avatar?) |
| POST | `/user/2fa/setup` | إعداد 2FA → `{ secret, qrCode }` |
| POST | `/user/2fa/verify` | تفعيل 2FA (body: `{ code }`) |
| POST | `/user/2fa/disable` | تعطيل 2FA (body: `{ code }`) |
| GET | `/user/sessions` | الجلسات النشطة (يحتاج `Authorization` لمعرفة الجلسة الحالية) |
| DELETE | `/user/sessions/:id` | إنهاء جلسة محددة |
| DELETE | `/user/sessions` | تسجيل الخروج من كل الأجهزة عدا الحالي |
| GET | `/user/security-logs` | سجلات الأمان (query: page, limit, action) |
| GET | `/user/security-stats` | إحصائيات الأمان |
| DELETE | `/user/security-logs/:id` | حذف سجل |
| POST | `/user/security-logs/delete-multiple` | حذف عدة سجلات (body: `{ logIds[] }`) |
| GET | `/user/security-logs/export` | تصدير (format: csv\|json\|pdf, + filters) |
| GET | `/user/ip-blocklist` | عناوين IP المحظورة |
| POST | `/user/ip-blocklist` | حظر IP |
| DELETE | `/user/ip-blocklist/:id` | إلغاء حظر IP |
| PATCH | `/user/change-email` | تغيير البريد (ChangeEmailDto: `{ newEmail }`) |
| GET | `/user/security-preferences` | تفضيلات الأمان (خام من DB) |
| PATCH | `/user/security-preferences` | تحديث التفضيلات (UpdateSecurityPreferencesDto) |
| GET | `/user/security-alert-settings` | إعدادات التنبيهات (مُنسّقة للـ UI) |
| PUT | `/user/security-alert-settings` | تحديث إعدادات التنبيهات |
| GET | `/user/trusted-devices` | الأجهزة الموثوقة |
| DELETE | `/user/trusted-devices/:id` | إزالة جهاز موثوق |

| **Auth** (`/api/v1/auth`) | | |
| GET | `/auth/me` | المستخدم الحالي (يُستخدم من useAuth) |
| GET | `/auth/sessions` | الجلسات (TokenService) |
| DELETE | `/auth/sessions/:id` | إبطال جلسة |
| POST | `/auth/logout-all` | تسجيل خروج من كل الأجهزة |

| **Upload** (`/api/v1/upload`) | | |
| POST | `/upload/avatar` | رفع صورة الملف الشخصي → `{ message, url }` |

---

## 2. ملاحظات وتنبيهات

### 2.1 تعدد أنظمة Profile
- **User:** `GET/PUT /user/profile` — يمثّل المستخدم + الـ profile (مع avatar من الـ upload).
- **Profiles:** `GET/PATCH /profiles/me` و`/profiles/:username` — schema مختلف (displayName, bio, isPublic, …).
- **القرار المقترح:** استخدام **User** فقط لصفحة الإعدادات (الملف الشخصي، الأمان، الجلسات، …). الـ Profiles يمكن تركها للملف العام أو استعمالها لاحقاً دون خلط مع إعدادات الحساب.

### 2.2 الجلسات (Sessions)
- **Auth:** `GET /auth/sessions` من TokenService، و`DELETE /auth/sessions/:id`.
- **User:** `GET /user/sessions` من UserService، و`DELETE /user/sessions/:id` و`DELETE /user/sessions`.
- **Frontend الحالي:** `auth.ts` يستخدم `/auth/sessions` فقط.
- **مقترح:** إما الاعتماد على **Auth** فقط للجلسات في الإعدادات، أو توحيد الاستخدام مع **User** والاعتماد على واحد منهما (وإبلاغ الفريق لأي تغيير).

### 2.3 `security-preferences` vs `security-alert-settings`
- **security-preferences:** حقل DB خام (emailOnFailedLogin, emailOnNewDevice, …).
- **security-alert-settings:** نفس المعنى لكن مُنسّق للـ UI (مثلاً `loginAlerts`, `newDeviceAlerts`, …).
- **مقترح:** استخدام **security-alert-settings** فقط في الواجهة (GET عند التحميل، PUT عند الحفظ).

### 2.4 رفع الصورة (Avatar)
- **Upload:** `POST /upload/avatar` يعيد `{ message, url }` والـ `url` هو مسار نسبي مثل `/uploads/avatars/xxx.webp`.
- **Frontend:** `profiles.uploadAvatar` يتوقع `url` بشكل `z.string().url()` وقد يفشل مع المسار النسبي. مع وجود rewrite لـ `/uploads` يمكن استخدام المسار كما هو وعرض الصورة، لكن يفضّل تعديل الـ schema ليسمح بمسار نسبي أو توحيد شكل الاستجابة.

### 2.5 تغيير البريد
- **Endpoint:** `PATCH /user/change-email` مع `{ newEmail }`.
- **السلوك:** يغيّر البريد مباشرة، يضع `emailVerified: false`، ويرسل تنبيهات للبريد القديم والجديد. لا يوجد تمرير بريد قديم أو رمز OTP في الـ API الحالي.
- **مقترح:** واجهة بسيطة (حقل بريد جديد + تأكيد) ثم استدعاء الـ API. إذا رغبت لاحقاً في إضافة تحقق بالبريد القديم أو OTP، سيتطلب تغييراً في الـ Backend.

### 2.6 عدم وجود تغيير كلمة المرور
- الاعتماد على **QuickSign** (Magic Link) وربما OAuth؛ لا يوجد endpoint لتغيير كلمة المرور.
- **مقترح:** عدم إظهار قسم «كلمة المرور» في الإعدادات في الوضع الحالي.

---

## 3. مقترح هيكل صفحة الإعدادات

### 3.1 التبويبات (Tabs) المقترحة

1. **الملف الشخصي (Profile)**  
   - الاسم، رقم الهاتف، صورة الملف (مع رفع عبر `/upload/avatar`).  
   - القراءة/التحديث عبر `GET/PUT /user/profile`.

2. **الأمان (Security)** — مطابق لـ `?tab=security` في الإيميلات  
   - **2FA:** تفعيل/إلغاء عبر `/user/2fa/setup`, verify, disable.  
   - **تغيير البريد:** `/user/change-email`.  
   - **إعدادات التنبيهات:** GET/PUT `/user/security-alert-settings` (تبويب أو قسم فرعي).

3. **الجلسات والأجهزة (Sessions & devices)**  
   - قائمة الجلسات (من Auth أو User بعد التوحيد)، وإنهاء جلسة/الخروج من كل الأجهزة.  
   - عرض الأجهزة الموثوقة إن وُجدت (`/user/trusted-devices`) وربطها بواجهة بسيطة.

4. **سجلات الأمان (Security logs)** — اختياري في المرحلة الأولى  
   - عرض `security-logs` مع pagination، وحذف فردي/جماعي، وتصدير (csv/json/pdf) إن احتيج.

5. **حظر IP (IP blocklist)** — اختياري  
   - للمستخدمين المتقدمين؛ استدعاء GET/POST/DELETE `/user/ip-blocklist`.

### 3.2 Sidebar الإعدادات
- اختيار التبويب (الملف الشخصي، الأمان، الجلسات، …) مع تمييز التبويب النشط.
- التصميم يتماشى مع الـ layout الحالي (إخفاء الـ sidebar الرئيسي عند `/app/settings`).

### 3.3 مسارات مقترحة
- `/app/settings` → افتراضياً **الملف الشخصي** أو redirect إلى `/app/settings?tab=profile`.  
- `/app/settings?tab=security` → الأمان (2FA، البريد، التنبيهات).  
- `/app/settings?tab=sessions` → الجلسات والأجهزة.  
- `/app/settings?tab=logs` → سجلات الأمان (إن وُضعت في واجهة).

---

## 4. ما يلزم قبل التنفيذ

### 4.1 Frontend
1. **إنشاء API client للإعدادات/User:**  
   دوال لتسجيل استدعاءات `user/profile`, `user/2fa/*`, `user/change-email`, `user/security-alert-settings`, `user/sessions`, `user/trusted-devices`, و`upload/avatar` (أو إعادة استخدام الموجودة مع توحيد الـ base URL والـ types).
2. **التأكد من استخدام الجلسات:**  
   الاعتماد على Auth فقط (`/auth/sessions`) أو User فقط، وتحديث أي استخدام قديم.
3. **ربط تبويب Security بـ `?tab=security`** لدعم الروابط القادمة من الإيميلات.

### 4.2 Backend (اختياري / تحسينات)
1. **الجلسات:**  
   إما توثيق أن Auth هو المصدر الرسمي للجلسات، أو توحيد الـ response (مثلاً إرجاع `isCurrent` من TokenService إن لم يكن موجوداً) لتجنّب التعارض مع الواجهة.
2. **Avatar:**  
   تقرير إن كان الـ upload سيعيد دائماً `url` نسبياً، وتعديل الـ frontend schema إن لزم.
3. **تغيير البريد:**  
   إن رغبت لاحقاً في تحقق إضافي (OTP على البريد القديم/الجديد)، يمكن توسيع الـ API وقتها.

---

## 5. خطوة التنفيذ المقترحة

1. إنشاء **Settings layout** و**sidebar** خاصين تحت `/app/settings`.  
2. تنفيذ تبويب **الملف الشخصي** (عرض + تحديث + رفع صورة).  
3. تنفيذ تبويب **الأمان** (2FA، تغيير البريد، إعدادات التنبيهات).  
4. تنفيذ تبويب **الجلسات والأجهزة**.  
5. إضافة **سجلات الأمان** و**حظر IP** لاحقاً إن رغبت.
6. إضافة تبويب **التكاملات (Integrations)** — انظر القسم 6.

بعد الموافقة على هذا الهيكل والاعتماد على Auth vs User للجلسات، يمكن المضي في تنفيذ الصفحة خطوة بخطوة.

---

## 6. Integrations (التكاملات)

مراجعة الـ integrations في الـ Backend وما يصلح لتبويب **التكاملات** في صفحة الإعدادات.

### 6.1 تكاملات على مستوى المستخدم (User-level)

| التكامل | التخزين | الـ API | الوصف |
|---------|---------|---------|--------|
| **Google (تسجيل الدخول)** | `User.googleId` | Auth OAuth | تسجيل الدخول بـ Google. الربط = استخدام تسجيل الدخول. لا يوجد endpoint صريح «فك الربط» حتى الآن. |
| **LinkedIn (تسجيل الدخول)** | `User.linkedinId` | Auth OAuth | نفس الفكرة. الربط عبر تسجيل الدخول. |
| **Google Calendar** | `User.googleAccessToken`, `googleCalendarLinked`, … | `/api/v1/google/calendar` | ربط التقويم للمستخدم. مُدعوم بالكامل. |
| **Telegram** | `User.telegramChatId`, `telegramUsername`, `telegramEnabled`, … | `/api/v1/telegram` | ربط حساب Telegram للإشعارات. مُدعوم بالكامل. |

#### Google Calendar — Endpoints

| Method | المسار | الوصف |
|--------|--------|--------|
| GET | `/google/calendar/auth` | بدء OAuth (مع `returnUrl` اختياري) → `{ authUrl }` |
| GET | `/google/calendar/callback` | استقبال الكود من Google وإعادة التوجيه للـ Frontend |
| POST | `/google/calendar/exchange` | مبادلة الكود بـ tokens (يحتاج `code` في query) |
| GET | `/google/calendar/status` | حالة الربط → `{ success, linked }` |
| DELETE | `/google/calendar/unlink` | فك ربط Google Calendar |

#### Telegram — Endpoints

| Method | المسار | الوصف |
|--------|--------|--------|
| POST | `/telegram/generate-session` | إنشاء جلسة ربط → `{ sessionId, botLink, expiresAt }` |
| GET | `/telegram/status` | حالة الربط → `{ success, data: { … } }` |
| DELETE | `/telegram/disconnect` | فك ربط Telegram |
| POST | `/telegram/test` | إرسال رسالة اختبار (عند الربط) |

**ربط Telegram:** المستخدم يطلب `generate-session` → يفتح `botLink` في Telegram → يُرسل الـ bot الرمز → الـ webhook يربط `telegramChatId` بالمستخدم.

### 6.2 تكاملات على مستوى النموذج (Form-level)

| التكامل | التخزين | الـ API | الوصف |
|---------|---------|---------|--------|
| **Google Sheets** | `FormIntegration` (لكل نموذج) | `/api/v1/integrations/google-sheets` | ربط نموذج معين بـ Sheets. connect / status / export / disconnect **لكل formId**. |
| **Google Drive** | نفس `FormIntegration` | `/api/v1/integrations/google-drive` | رفع ملفات النماذج. الربط لكل نموذج. |

**الخلاصة:** إدارة ربط **Sheets/Drive** تتم من واجهة **النماذج** (صفحة الردود أو إعدادات النموذج)، وليس من الإعدادات. في الإعدادات يمكن عرض **ملخص** فقط (مثلاً: «إدارة ربط النماذج من صفحة النماذج») مع رابط إلى `/app/forms`.

### 6.3 تكاملات أخرى (ليست إعدادات مستخدم)

- **Email:** داخلية (إشعارات، QuickSign). لا تُعرض في الإعدادات.
- **WhatsApp:** على مستوى المتجر. لا تدخل في إعدادات الحساب.
- **Google Calendar للفعاليات:** الربط الأولي للمستخدم عبر `/google/calendar`؛ ربط كل **فعالية** بالتقويم من واجهة الفعاليات.

### 6.4 مقترح تبويب «التكاملات» في الإعدادات

1. **حسابات متصلة (تسجيل الدخول):** عرض Google / LinkedIn مربوط أو لا (من `User` أو `/auth/me`). الربط = تسجيل الدخول. فك الربط يتطلب endpoint جديد إن رغبت.
2. **Google Calendar:** status → ربط (auth → callback → exchange) → unlink. الـ API جاهز.
3. **Telegram:** status → ربط (generate-session → botLink) → disconnect. الـ API جاهز.
4. **(اختياري)** Sheets/Drive: نص + رابط إلى `/app/forms`.

### 6.5 مسار مقترح

- `/app/settings?tab=integrations`

### 6.6 ما يلزم في الـ Frontend لتبويب التكاملات

1. **API client** لـ `/google/calendar` (status, auth, exchange, unlink) و`/telegram` (status, generate-session, disconnect).
2. دعم **googleId / linkedinId** من User أو `/auth/me` لعرض «حسابات متصلة».
3. واجهة ربط **Telegram:** عرض `botLink` + تعليمات؛ ثم polling لـ `GET /telegram/status` أو إعادة تحميل التبويب.
4. (اختياري) صفحة/route لاستقبال redirect الـ Google Calendar ثم استدعاء `exchange` حسب آلية `returnUrl` الحالية.
