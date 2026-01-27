# نظام التذاكر وQR Code للفعاليات

## نظرة عامة
تم تطوير نظام تذكرة إلكترونية متكامل يعرض تفاصيل التسجيل مع QR Code للتحقق السريع عند الدخول.

## المكونات الرئيسية

### 1. EventTicket Component
**الموقع:** `apps/web/src/features/events/components/tickets/EventTicket.tsx`

#### المميزات:
- تصميم بسيط وأنيق يركز على المعلومات المهمة
- QR Code يحتوي على معلومات التحقق الكاملة
- عرض تفاصيل الفعالية (التاريخ، الموقع، عدد الحضور)
- حالة التسجيل مع ألوان مميزة
- تصميم متجاوب يعمل على جميع الأجهزة

#### البيانات المخزنة في QR Code:
```typescript
{
  registrationId: string,
  eventId: string,
  userId: string,
  status: string,
  attendeeCount: number,
  timestamp: string
}
```

### 2. TicketModal Component
**الموقع:** `apps/web/src/features/events/components/tickets/TicketModal.tsx`

#### الوظائف:
- **طباعة التذكرة:** طباعة مباشرة من المتصفح
- **تحميل التذكرة:** تحويل إلى صورة PNG باستخدام html2canvas
- **نسخ الرابط:** نسخ رابط التذكرة للمشاركة
- **مشاركة:**
  - إرسال بالبريد الإلكتروني
  - مشاركة عبر واتساب

### 3. صفحة عرض التذكرة المنفصلة
**الموقع:** `apps/web/src/app/tickets/[id]/page.tsx`

#### المميزات:
- رابط عام يمكن مشاركته: `/tickets/{registrationId}`
- عرض كامل للتذكرة مع QR Code
- إمكانية الطباعة المباشرة
- تعليمات استخدام التذكرة
- تصميم مُحسّن للطباعة

## التكامل

### في صفحة التسجيلات
**الموقع:** `apps/web/src/app/dashboard/my-registrations/page.tsx`

```typescript
// عرض زر التذكرة للتسجيلات المؤكدة
{registration.status === 'CONFIRMED' && (
  <Button
    onClick={() => setSelectedTicket({ registration, event })}
    variant="outline"
    size="sm"
    className="border-[#D8E267] text-[#D8E267] hover:bg-[#D8E267]/10"
  >
    <QrCode className="w-4 h-4 ml-2" />
    عرض التذكرة
  </Button>
)}
```

## API Endpoints المستخدمة

### الحصول على التسجيل بالـ ID
```typescript
GET /api/events/registrations/{registrationId}
```
يُستخدم لعرض التذكرة في الصفحة المنفصلة.

## المكتبات المستخدمة

### qrcode.react
```bash
npm install qrcode.react
```
- توليد QR codes عالية الجودة
- دعم مستويات تصحيح الأخطاء المختلفة
- إمكانية إضافة شعار في الوسط

### html2canvas
```bash
npm install html2canvas
```
- تحويل HTML إلى صورة
- جودة عالية للطباعة (scale: 2)
- دعم العناصر المعقدة

## تدفق العمل

### 1. عرض التذكرة
```
المستخدم → صفحة التسجيلات → زر "عرض التذكرة" → TicketModal
```

### 2. مشاركة التذكرة
```
TicketModal → نسخ الرابط → /tickets/{id} → عرض عام للتذكرة
```

### 3. التحقق من التذكرة
```
QR Scanner → قراءة البيانات → التحقق من registrationId + eventId
```

## التحسينات المستقبلية

### 1. نظام التحقق من QR Code
- إنشاء صفحة للمنظمين لمسح QR codes
- التحقق الفوري من صحة التذكرة
- تسجيل الحضور تلقائياً
- منع استخدام التذكرة أكثر من مرة

### 2. إشعارات التذكرة
- إرسال التذكرة تلقائياً بعد التسجيل
- تذكير قبل الفعالية بـ 24 ساعة
- إشعار عند تغيير حالة التسجيل

### 3. تحسينات التصميم
- إضافة باركود إضافي (Barcode 128)
- دعم طباعة متعددة التذاكر
- قوالب تذاكر قابلة للتخصيص

### 4. التكامل مع Wallet
- دعم Apple Wallet
- دعم Google Pay
- إضافة التذكرة للمحفظة الرقمية

## الأمان

### حماية البيانات
- التحقق من ملكية التذكرة قبل العرض
- تشفير بيانات QR Code
- منع الوصول غير المصرح به

### مكافحة التزوير
- توقيع رقمي في QR Code
- رمز timestamp فريد
- التحقق من صلاحية التذكرة

## استخدام المكونات

### استيراد المكونات
```typescript
import { EventTicket, TicketModal } from '@/features/events/components/tickets';
```

### مثال الاستخدام
```typescript
// عرض التذكرة
<EventTicket 
  registration={registration}
  event={event}
  showQRCode={true}
/>

// Modal للتذكرة
<TicketModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  registration={registration}
  event={event}
/>
```

## الاختبار

### سيناريوهات الاختبار
1. ✅ عرض التذكرة للتسجيل المؤكد
2. ✅ طباعة التذكرة
3. ✅ تحميل التذكرة كصورة
4. ✅ نسخ رابط التذكرة
5. ✅ مشاركة التذكرة عبر البريد الإلكتروني
6. ✅ مشاركة التذكرة عبر واتساب
7. ✅ عرض التذكرة من الرابط المشارك
8. ✅ التحقق من QR Code

## الأداء

### التحسينات المطبقة
- Lazy loading لـ html2canvas
- تحسين حجم QR Code (180px)
- تقليل البيانات المخزنة في QR
- استخدام SVG للـ QR Code

## الدعم والتوافق

### المتصفحات المدعومة
- ✅ Chrome/Edge (أحدث نسختين)
- ✅ Firefox (أحدث نسختين)
- ✅ Safari (أحدث نسختين)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### الأجهزة
- ✅ Desktop (1920x1080 وأعلى)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

## الملاحظات الفنية

### RTL Support
جميع المكونات تدعم اتجاه RTL (من اليمين لليسار) للغة العربية.

### Dark Mode
دعم كامل للوضع الليلي مع تباين مناسب.

### Print Styles
تصميم خاص للطباعة يخفي العناصر غير الضرورية.

## المراجع
- [QRCode.react Documentation](https://github.com/zpao/qrcode.react)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
