# 🚀 Forms Innovation Roadmap | خارطة طريق ابتكار النماذج

---

## 📋 Overview | نظرة عامة

<div dir="rtl">

### العربية
هذا المستند يحدد الميزات المبتكرة المقترحة لجعل نظام نماذج Rukny متميزًا عن المنافسين مثل Typeform وGoogle Forms وJotForm. تم تصميم هذه الميزات خصيصًا للسوق العراقي والعربي.

</div>

### English
This document outlines innovative features proposed to make Rukny's forms system stand out from competitors like Typeform, Google Forms, and JotForm. These features are specifically designed for the Iraqi and Arab market.

---

## 🎯 Priority Matrix | مصفوفة الأولويات

| Priority | Feature | Impact | Effort | Market Gap |
|----------|---------|--------|--------|------------|
| 🔥 P1 | Payment Collection | ⭐⭐⭐⭐⭐ | Medium | Huge |
| 🔥 P1 | WhatsApp Integration | ⭐⭐⭐⭐⭐ | Medium | Large |
| ⭐ P2 | AI Form Builder | ⭐⭐⭐⭐ | High | Unique |
| ⭐ P2 | Offline-First | ⭐⭐⭐⭐ | Medium | Critical |
| ⭐ P2 | Iraqi Field Types | ⭐⭐⭐⭐ | Low | Local |
| 📊 P3 | Form Pipelines | ⭐⭐⭐ | High | Enterprise |
| 📊 P3 | Collaborative Filling | ⭐⭐⭐ | High | Niche |

---

## 🔥 Priority 1 Features | ميزات الأولوية الأولى

### 1. Payment Collection | تحصيل المدفوعات

<div dir="rtl">

#### العربية
**المشكلة:** معظم منصات النماذج لا تدعم بوابات الدفع العراقية.

**الحل:** دمج بوابات الدفع المحلية مباشرة في النماذج.

**بوابات الدفع المدعومة:**
- 💳 ZainCash (زين كاش)
- 💳 FastPay (فاست باي)
- 💳 FIB (المصرف العراقي للتجارة)
- 💳 NassPay (ناس باي)
- 💳 Qi Card (كي كارد)

**حالات الاستخدام:**
- رسوم التسجيل للفعاليات
- نماذج الطلبات مع الدفع
- رسوم الاشتراك
- جمع التبرعات
- حجز المواعيد المدفوعة

**الميزات:**
- حساب السعر الديناميكي بناءً على الاختيارات
- إنشاء الفواتير تلقائيًا
- تأكيد الدفع الفوري
- استرداد المبالغ الجزئي/الكامل

</div>

#### English
**Problem:** Most form platforms don't support Iraqi payment gateways.

**Solution:** Integrate local payment gateways directly into forms.

**Supported Payment Gateways:**
- 💳 ZainCash
- 💳 FastPay  
- 💳 FIB (First Iraqi Bank)
- 💳 NassPay
- 💳 Qi Card

**Use Cases:**
- Event registration fees
- Order forms with payment
- Subscription fees
- Donation collection
- Paid appointment booking

**Features:**
- Dynamic price calculation based on selections
- Automatic invoice generation
- Instant payment confirmation
- Partial/full refund support

**Technical Implementation:**
```typescript
// New Field Types
enum FieldType {
  // ... existing
  PAYMENT        // Integrated payment field
  PRICE_CALC     // Dynamic price calculator
}

// Payment Field Configuration
interface PaymentFieldConfig {
  gateway: 'zaincash' | 'fastpay' | 'fib' | 'nasspay' | 'qicard';
  currency: 'IQD' | 'USD';
  amount: number | 'calculated';  // Fixed or based on other fields
  description: string;
  allowPartialPayment: boolean;
}

// Form Payment Settings
interface FormPaymentSettings {
  enabled: boolean;
  gateways: PaymentGateway[];
  invoiceTemplate: string;
  successRedirect: string;
  failureRedirect: string;
}
```

---

### 2. WhatsApp Integration | تكامل واتساب

<div dir="rtl">

#### العربية
**المشكلة:** أكثر من 90% من العراقيين يستخدمون واتساب يوميًا، لكن النماذج تتطلب فتح متصفح.

**الحل:** السماح بإرسال النماذج وتعبئتها عبر واتساب.

**الميزات:**
1. **إرسال النموذج عبر واتساب** - مشاركة رابط النموذج برسالة مخصصة
2. **إشعارات واتساب** - تنبيه صاحب النموذج عند كل إجابة جديدة
3. **بوت المحادثة** - تعبئة النموذج من خلال محادثة واتساب
4. **تأكيد الإرسال** - إرسال تأكيد للمستخدم بعد إكمال النموذج

**مثال على المحادثة:**
```
🤖 Rukny Bot: مرحبًا! أنت تملأ نموذج "تسجيل المؤتمر"
🤖 Rukny Bot: ما هو اسمك الكامل؟
👤 المستخدم: أحمد محمد
🤖 Rukny Bot: شكرًا أحمد! ما هو بريدك الإلكتروني؟
👤 المستخدم: ahmed@email.com
🤖 Rukny Bot: ممتاز! تم تسجيلك بنجاح ✅
```

</div>

#### English
**Problem:** Over 90% of Iraqis use WhatsApp daily, but forms require opening a browser.

**Solution:** Allow sending and filling forms via WhatsApp.

**Features:**
1. **Share Form via WhatsApp** - Share form link with custom message
2. **WhatsApp Notifications** - Alert form owner on new submissions
3. **Chatbot Filling** - Fill form through WhatsApp conversation
4. **Submission Confirmation** - Send confirmation to user after completion

**Technical Implementation:**
```typescript
// WhatsApp Integration Service
interface WhatsAppConfig {
  provider: 'twilio' | 'whatsapp-business-api' | 'wati';
  phoneNumberId: string;
  accessToken: string;
}

// Form WhatsApp Settings
interface FormWhatsAppSettings {
  enabled: boolean;
  shareMessage: string;  // Custom share text
  notifyOnSubmission: boolean;
  notifyPhoneNumbers: string[];
  enableChatbotFilling: boolean;
  confirmationMessage: string;
}

// Chatbot Flow
interface ChatbotFlow {
  welcomeMessage: string;
  fieldPrompts: Map<string, string>;  // fieldId -> prompt message
  completionMessage: string;
  errorMessage: string;
}
```

**Conversation Example:**
```
🤖 Rukny Bot: Hello! You're filling "Conference Registration" form
🤖 Rukny Bot: What is your full name?
👤 User: Ahmed Mohammed
🤖 Rukny Bot: Thanks Ahmed! What is your email?
👤 User: ahmed@email.com
🤖 Rukny Bot: Perfect! You've been registered successfully ✅
```

---

## ⭐ Priority 2 Features | ميزات الأولوية الثانية

### 3. AI-Powered Form Builder | منشئ النماذج بالذكاء الاصطناعي

<div dir="rtl">

#### العربية
**الميزة:** إنشاء نماذج كاملة من خلال وصف بسيط باللغة العربية أو الإنجليزية.

**أمثلة:**
| الوصف | النتيجة |
|-------|---------|
| "نموذج تسجيل لمؤتمر تقني" | نموذج بحقول: الاسم، البريد، الهاتف، الشركة، المسمى الوظيفي، الجلسات المختارة |
| "استبيان رضا العملاء" | نموذج بحقول: تقييم الخدمة، التعليقات، احتمالية التوصية، مجالات التحسين |
| "طلب توظيف" | نموذج بحقول: المعلومات الشخصية، التعليم، الخبرة، السيرة الذاتية، رسالة التقديم |

**القدرات:**
- 🧠 فهم السياق العربي والعراقي
- 🔄 ترجمة تلقائية ثنائية الاتجاه
- 💡 اقتراحات حقول ذكية
- ✨ تحسين صياغة الأسئلة
- 📋 قوالب مقترحة بناءً على النوع

</div>

#### English
**Feature:** Create complete forms from a simple description in Arabic or English.

**Examples:**
| Description | Result |
|-------------|--------|
| "Tech conference registration form" | Form with: Name, Email, Phone, Company, Job Title, Selected Sessions |
| "Customer satisfaction survey" | Form with: Service Rating, Comments, Likelihood to Recommend, Improvement Areas |
| "Job application form" | Form with: Personal Info, Education, Experience, Resume, Cover Letter |

**Capabilities:**
- 🧠 Understanding Arabic/Iraqi context
- 🔄 Automatic bi-directional translation
- 💡 Smart field suggestions
- ✨ Question wording optimization
- 📋 Template suggestions based on type

**Technical Implementation:**
```typescript
// AI Form Generation Service
interface AIFormGeneratorConfig {
  model: 'gpt-4' | 'claude-3' | 'gemini-pro';
  language: 'ar' | 'en' | 'auto';
  context: 'iraqi' | 'gulf' | 'general-arab';
}

// Generation Request
interface GenerateFormRequest {
  description: string;
  language: 'ar' | 'en';
  formType?: FormType;
  fieldsCount?: 'minimal' | 'standard' | 'comprehensive';
  includeConditionalLogic?: boolean;
}

// AI Capabilities
interface AICapabilities {
  generateForm: (description: string) => Promise<Form>;
  suggestFields: (existingFields: FormField[]) => Promise<FormField[]>;
  improveQuestion: (question: string) => Promise<string>;
  translateForm: (form: Form, targetLang: 'ar' | 'en') => Promise<Form>;
  analyzeResponses: (responses: FormSubmission[]) => Promise<AnalysisReport>;
}
```

---

### 4. Offline-First Submissions | الإرسال بدون إنترنت

<div dir="rtl">

#### العربية
**المشكلة:** الاتصال بالإنترنت غير مستقر في كثير من مناطق العراق.

**الحل:** تطبيق PWA يسمح بتعبئة النماذج بدون اتصال.

**كيف يعمل:**
1. 📥 تحميل النموذج مسبقًا عند توفر الإنترنت
2. ✏️ تعبئة النموذج بدون اتصال
3. 📤 إرسال تلقائي عند عودة الاتصال
4. 🔄 مزامنة في الخلفية

**الحالات المدعومة:**
- تعبئة النماذج في المناطق النائية
- المعارض والمؤتمرات مع واي فاي ضعيف
- جمع البيانات الميدانية
- الاستبيانات في الجامعات

</div>

#### English
**Problem:** Internet connectivity is unstable in many areas of Iraq.

**Solution:** PWA application allowing form filling without connection.

**How it Works:**
1. 📥 Pre-download form when online
2. ✏️ Fill form offline
3. 📤 Auto-submit when connection returns
4. 🔄 Background synchronization

**Supported Scenarios:**
- Form filling in remote areas
- Exhibitions/conferences with weak WiFi
- Field data collection
- University surveys

**Technical Implementation:**
```typescript
// Service Worker Registration
interface OfflineConfig {
  enableOffline: boolean;
  maxCachedForms: number;
  syncStrategy: 'immediate' | 'batch' | 'manual';
  conflictResolution: 'server-wins' | 'client-wins' | 'merge';
}

// IndexedDB Schema for Offline Storage
interface OfflineSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  files: OfflineFile[];
  createdAt: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

// Sync Manager
interface SyncManager {
  queueSubmission: (submission: OfflineSubmission) => Promise<void>;
  syncPending: () => Promise<SyncResult[]>;
  getQueueStatus: () => Promise<QueueStatus>;
  clearSynced: () => Promise<void>;
}
```

---

### 5. Iraqi-Specific Field Types | أنواع حقول عراقية

<div dir="rtl">

#### العربية
**الميزة:** حقول مخصصة للسوق العراقي تفهم التنسيقات المحلية.

| نوع الحقل | الوصف | التحقق |
|----------|-------|--------|
| `IRAQI_PHONE` | رقم هاتف عراقي | يدعم 077x, 078x, 079x |
| `NATIONAL_ID` | الرقم الوطني العراقي | التحقق من الصيغة |
| `IRAQI_LOCATION` | محافظة/قضاء/ناحية | قائمة منسدلة ذكية |
| `CIVIL_ID` | هوية الأحوال المدنية | التحقق من الرقم |
| `IRAQI_DATE` | تاريخ بالصيغة العراقية | يدعم التقويم الهجري |

</div>

#### English
**Feature:** Custom fields for the Iraqi market that understand local formats.

| Field Type | Description | Validation |
|------------|-------------|------------|
| `IRAQI_PHONE` | Iraqi phone number | Supports 077x, 078x, 079x |
| `NATIONAL_ID` | Iraqi National ID | Format validation |
| `IRAQI_LOCATION` | Governorate/District/Sub-district | Smart dropdown |
| `CIVIL_ID` | Civil Status ID | Number validation |
| `IRAQI_DATE` | Iraqi date format | Supports Hijri calendar |

**Technical Implementation:**
```typescript
// New Field Types for Iraqi Market
enum IraqiFieldType {
  IRAQI_PHONE = 'IRAQI_PHONE',
  NATIONAL_ID = 'NATIONAL_ID',
  IRAQI_LOCATION = 'IRAQI_LOCATION',
  CIVIL_ID = 'CIVIL_ID',
  IRAQI_DATE = 'IRAQI_DATE',
}

// Iraqi Phone Validation
const IRAQI_PHONE_REGEX = /^(\+964|0)?(77|78|79)\d{8}$/;

// Iraqi Governorates Data
const IRAQI_GOVERNORATES = [
  { code: 'BGD', name_ar: 'بغداد', name_en: 'Baghdad', districts: [...] },
  { code: 'BSR', name_ar: 'البصرة', name_en: 'Basra', districts: [...] },
  { code: 'NBL', name_ar: 'نينوى', name_en: 'Nineveh', districts: [...] },
  // ... all 18 governorates with districts
];

// Location Picker Configuration
interface IraqiLocationConfig {
  level: 'governorate' | 'district' | 'sub-district';
  showMap: boolean;
  allowCoordinates: boolean;
}
```

---

## 📊 Priority 3 Features | ميزات الأولوية الثالثة

### 6. Form Pipelines/Workflows | خطوط سير النماذج

<div dir="rtl">

#### العربية
**الميزة:** أتمتة سير العمل بعد إرسال النموذج.

**مثال على خط السير:**
```
إرسال النموذج → موافقة المدير → إرسال بريد → إضافة لـ Google Sheets → إنشاء تذكرة فعالية
```

**الإجراءات المتاحة:**
- 📧 إرسال بريد إلكتروني
- 📱 إرسال إشعار واتساب
- ✅ طلب موافقة
- 📊 إضافة لـ Google Sheets/Notion
- 🎫 إنشاء تذكرة في نظام الفعاليات
- 👤 إنشاء حساب مستخدم
- 📄 إنشاء PDF
- 🔗 استدعاء Webhook

</div>

#### English
**Feature:** Automate workflows after form submission.

**Pipeline Example:**
```
Form Submit → Manager Approval → Send Email → Add to Sheets → Create Event Ticket
```

**Available Actions:**
- 📧 Send email
- 📱 Send WhatsApp notification
- ✅ Request approval
- 📊 Add to Google Sheets/Notion
- 🎫 Create ticket in Events system
- 👤 Create user account
- 📄 Generate PDF
- 🔗 Call Webhook

**Technical Implementation:**
```typescript
// Pipeline Definition
interface FormPipeline {
  id: string;
  formId: string;
  name: string;
  trigger: PipelineTrigger;
  steps: PipelineStep[];
  isActive: boolean;
}

// Pipeline Triggers
type PipelineTrigger = 
  | { type: 'on_submission' }
  | { type: 'on_update' }
  | { type: 'scheduled'; cron: string }
  | { type: 'conditional'; condition: ConditionalRule };

// Pipeline Step
interface PipelineStep {
  id: string;
  order: number;
  action: PipelineAction;
  condition?: ConditionalRule;
  onSuccess?: string;  // next step id
  onFailure?: string;  // next step id or 'stop'
}

// Pipeline Actions
type PipelineAction =
  | { type: 'send_email'; template: string; to: string }
  | { type: 'send_whatsapp'; message: string; to: string }
  | { type: 'request_approval'; approvers: string[]; timeout: number }
  | { type: 'add_to_sheets'; spreadsheetId: string; sheetName: string }
  | { type: 'create_event_ticket'; eventId: string }
  | { type: 'create_user'; roleId: string }
  | { type: 'generate_pdf'; template: string }
  | { type: 'webhook'; url: string; method: 'POST' | 'PUT' };
```

---

### 7. Collaborative Form Filling | تعبئة النموذج التعاونية

<div dir="rtl">

#### العربية
**الميزة:** السماح لعدة أشخاص بتعبئة نفس الإرسال معًا.

**حالات الاستخدام:**
- طلبات الأسرة (الأب يبدأ، الابن يكمل)
- استبيانات الفريق (كل عضو يجيب على قسمه)
- طلبات الشركات (قسم الموارد البشرية + المالية)

**الميزات:**
- تعيين أقسام لأشخاص مختلفين
- تتبع من أجاب على كل سؤال
- إشعارات عند اكتمال كل قسم
- قفل الأقسام المكتملة

</div>

#### English
**Feature:** Allow multiple people to fill one submission together.

**Use Cases:**
- Family applications (father starts, son completes)
- Team surveys (each member answers their section)
- Company applications (HR + Finance departments)

**Features:**
- Assign sections to different people
- Track who answered each question
- Notifications when sections complete
- Lock completed sections

---

### 8. Smart Response Analysis | تحليل الردود الذكي

<div dir="rtl">

#### العربية
**الميزة:** تحليل الردود باستخدام الذكاء الاصطناعي.

**القدرات:**
- 😊😐😢 تحليل المشاعر للردود النصية
- 🏷️ وسم تلقائي للإرسالات
- 📝 ملخص AI لجميع الردود
- 🚨 كشف الردود المشبوهة/السبام
- 📊 رؤى وتوصيات تلقائية

</div>

#### English
**Feature:** Analyze responses using AI.

**Capabilities:**
- 😊😐😢 Sentiment analysis for text responses
- 🏷️ Auto-tagging submissions
- 📝 AI summary of all responses
- 🚨 Spam/suspicious response detection
- 📊 Automatic insights and recommendations

---

### 9. Advanced Field Types | أنواع حقول متقدمة

<div dir="rtl">

#### العربية

| نوع الحقل | الوصف |
|----------|-------|
| `LOCATION_PICKER` | اختيار موقع من الخريطة |
| `FILE_CAMERA` | التقاط من الكاميرا مباشرة |
| `APPOINTMENT` | حجز موعد مع التقويم |
| `DIGITAL_SIGNATURE` | توقيع رقمي قانوني |
| `QR_SCANNER` | مسح رمز QR كمدخل |
| `VOICE_INPUT` | إدخال صوتي (عربي) |
| `CALCULATION` | حساب تلقائي من حقول أخرى |
| `REPEATER` | تكرار مجموعة حقول |
| `LOOKUP` | جلب بيانات من API خارجي |

</div>

#### English

| Field Type | Description |
|------------|-------------|
| `LOCATION_PICKER` | Pick location from map |
| `FILE_CAMERA` | Direct camera capture |
| `APPOINTMENT` | Calendar booking with availability |
| `DIGITAL_SIGNATURE` | Legally valid digital signature |
| `QR_SCANNER` | Scan QR code as input |
| `VOICE_INPUT` | Voice-to-text (Arabic) |
| `CALCULATION` | Auto-calculate from other fields |
| `REPEATER` | Repeat group of fields |
| `LOOKUP` | Fetch data from external API |

**Technical Implementation:**
```typescript
// Extended Field Types
enum ExtendedFieldType {
  // Existing
  TEXT, TEXTAREA, NUMBER, EMAIL, PHONE, DATE, TIME, DATETIME,
  SELECT, RADIO, CHECKBOX, FILE, RATING, SCALE, TOGGLE, MATRIX, SIGNATURE,
  
  // New Advanced Types
  LOCATION_PICKER = 'LOCATION_PICKER',
  FILE_CAMERA = 'FILE_CAMERA',
  APPOINTMENT = 'APPOINTMENT',
  QR_SCANNER = 'QR_SCANNER',
  VOICE_INPUT = 'VOICE_INPUT',
  CALCULATION = 'CALCULATION',
  REPEATER = 'REPEATER',
  LOOKUP = 'LOOKUP',
  
  // Iraqi-Specific
  IRAQI_PHONE = 'IRAQI_PHONE',
  NATIONAL_ID = 'NATIONAL_ID',
  IRAQI_LOCATION = 'IRAQI_LOCATION',
  
  // Payment
  PAYMENT = 'PAYMENT',
  PRICE_CALC = 'PRICE_CALC',
}
```

---

### 10. Form Analytics Pro | تحليلات النماذج المتقدمة

<div dir="rtl">

#### العربية
**الميزة:** تحليلات متقدمة لفهم سلوك المستخدمين.

**التقارير:**
- 📊 **تحليل القمع**: أين يتوقف المستخدمون؟
- ⏱️ **تحليل الوقت**: كم يستغرق كل حقل؟
- 🔥 **خريطة حرارية**: أي الحقول تُعدَّل أكثر؟
- 🔬 **اختبار A/B**: مقارنة نسخ مختلفة من النموذج
- 🤖 **توقع الإكمال**: هل سيُكمل المستخدم النموذج؟

</div>

#### English
**Feature:** Advanced analytics to understand user behavior.

**Reports:**
- 📊 **Funnel Analysis**: Where do users drop off?
- ⏱️ **Time Analytics**: How long per field?
- 🔥 **Heatmaps**: Which fields get changed most?
- 🔬 **A/B Testing**: Compare different form versions
- 🤖 **Completion Prediction**: Will user finish the form?

---

## 🗓️ Implementation Timeline | الجدول الزمني للتنفيذ

### Phase 1: Q1 2026 (الربع الأول)
| Week | Feature | Status |
|------|---------|--------|
| 1-2 | Iraqi Field Types | 🔲 Not Started |
| 3-4 | Offline-First PWA | 🔲 Not Started |
| 5-6 | WhatsApp Share & Notifications | 🔲 Not Started |

### Phase 2: Q2 2026 (الربع الثاني)
| Week | Feature | Status |
|------|---------|--------|
| 1-3 | Payment Collection (ZainCash) | 🔲 Not Started |
| 4-6 | Payment Collection (FastPay, FIB) | 🔲 Not Started |
| 7-8 | WhatsApp Chatbot | 🔲 Not Started |

### Phase 3: Q3 2026 (الربع الثالث)
| Week | Feature | Status |
|------|---------|--------|
| 1-4 | AI Form Builder | 🔲 Not Started |
| 5-8 | Form Pipelines | 🔲 Not Started |

### Phase 4: Q4 2026 (الربع الرابع)
| Week | Feature | Status |
|------|---------|--------|
| 1-4 | Analytics Pro | 🔲 Not Started |
| 5-6 | Collaborative Filling | 🔲 Not Started |
| 7-8 | Advanced Field Types | 🔲 Not Started |

---

## 🏆 Competitive Advantage | الميزة التنافسية

<div dir="rtl">

### لماذا ستتفوق نماذج Rukny؟

| الميزة | Google Forms | Typeform | JotForm | Rukny |
|--------|--------------|----------|---------|-------|
| دعم العربية الكامل | ⚠️ جزئي | ⚠️ جزئي | ⚠️ جزئي | ✅ كامل |
| بوابات الدفع العراقية | ❌ | ❌ | ❌ | ✅ |
| تكامل واتساب | ❌ | ❌ | ⚠️ محدود | ✅ |
| العمل بدون إنترنت | ❌ | ❌ | ❌ | ✅ |
| حقول عراقية مخصصة | ❌ | ❌ | ❌ | ✅ |
| إنشاء بالذكاء الاصطناعي | ❌ | ⚠️ محدود | ❌ | ✅ |
| تكامل مع الفعاليات | ❌ | ❌ | ❌ | ✅ |
| تكامل مع المتاجر | ❌ | ❌ | ❌ | ✅ |

</div>

### Why Rukny Forms Will Win?

| Feature | Google Forms | Typeform | JotForm | Rukny |
|---------|--------------|----------|---------|-------|
| Full Arabic Support | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial | ✅ Full |
| Iraqi Payment Gateways | ❌ | ❌ | ❌ | ✅ |
| WhatsApp Integration | ❌ | ❌ | ⚠️ Limited | ✅ |
| Offline-First | ❌ | ❌ | ❌ | ✅ |
| Iraqi-Specific Fields | ❌ | ❌ | ❌ | ✅ |
| AI Form Generation | ❌ | ⚠️ Limited | ❌ | ✅ |
| Events Integration | ❌ | ❌ | ❌ | ✅ |
| Stores Integration | ❌ | ❌ | ❌ | ✅ |

---

## 📚 References | المراجع

- [ZainCash API Documentation](https://docs.zaincash.iq/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [PWA Offline-First Guide](https://web.dev/offline-cookbook/)
- [Iraqi Governorates Data](https://data.gov.iq/)

---

*Last Updated: January 2026*
*Document Version: 1.0*
