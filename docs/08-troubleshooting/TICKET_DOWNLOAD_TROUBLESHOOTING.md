# استكشاف وإصلاح أخطاء تحميل التذاكر

## المشكلة: فشل تحميل التذكرة

### الأسباب المحتملة:

#### 1. مشكلة في html2canvas
**الحل:**
- تأكد من تثبيت المكتبة:
```bash
npm install html2canvas
```

#### 2. مشكلة في CORS
**الأعراض:** صور خارجية أو خطوط لا تظهر في التذكرة المحملة

**الحل:**
```typescript
const canvas = await html2canvas(element, {
  useCORS: true,
  allowTaint: true,
});
```

#### 3. QR Code لا يظهر
**السبب:** SVG قد لا يتم التقاطه بشكل صحيح

**الحل البديل:**
استخدم Canvas بدلاً من SVG للـ QR Code:
```typescript
import { QRCodeCanvas } from 'qrcode.react';
```

#### 4. المتصفح يمنع التحميل التلقائي
**الحل:**
- تأكد من أن المستخدم ضغط على الزر (وليس تحميل تلقائي)
- استخدم `window.open()` كبديل

### التحسينات المطبقة:

1. **إضافة حالة تحميل:**
```typescript
const [downloading, setDownloading] = useState(false);
```

2. **معالجة أفضل للأخطاء:**
```typescript
try {
  // Download logic
} catch (error) {
  console.error('Download failed:', error);
  toast.error('فشل تحميل التذكرة');
  setDownloading(false);
}
```

3. **تنظيف الموارد:**
```typescript
setTimeout(() => {
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setDownloading(false);
}, 100);
```

4. **رسائل توضيحية للمستخدم:**
```typescript
toast.info('جاري تحميل التذكرة...');
toast.success('تم تحميل التذكرة بنجاح');
```

## الاختبار:

### اختبار التحميل:
1. افتح صفحة التسجيلات
2. اضغط على "عرض التذكرة"
3. اضغط على زر التحميل
4. تحقق من تحميل الصورة في مجلد Downloads

### متصفحات مدعومة:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ⚠️ قد تكون هناك قيود في بعض المتصفحات القديمة

## حلول بديلة:

### البديل 1: الطباعة إلى PDF
```typescript
const handleSaveAsPDF = () => {
  window.print(); // ثم اختر "Save as PDF"
};
```

### البديل 2: لقطة شاشة يدوية
أرشد المستخدم لأخذ لقطة شاشة:
- Windows: `Win + Shift + S`
- Mac: `Cmd + Shift + 4`
- Mobile: حسب الجهاز

### البديل 3: استخدام server-side rendering
إنشاء صورة التذكرة على السيرفر باستخدام:
- Puppeteer
- Playwright
- Sharp

## نصائح للمطورين:

1. **اختبر على أجهزة متعددة:**
   - Desktop (Windows, Mac, Linux)
   - Mobile (iOS, Android)
   - أحجام شاشات مختلفة

2. **راقب الأداء:**
   - html2canvas قد يكون بطيئاً على التذاكر المعقدة
   - استخدم scale مناسب (2-3 كافي)

3. **سجل الأخطاء:**
```typescript
console.error('Download failed:', error);
// يمكن إرسالها لـ error tracking service
```

## الكود النهائي المحسّن:

```typescript
const handleDownload = async () => {
  if (downloading) return;
  
  try {
    setDownloading(true);
    
    if (!ticketRef.current) {
      toast.error('لا يمكن العثور على التذكرة');
      return;
    }

    toast.info('جاري تحميل التذكرة...');
    
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(ticketRef.current, {
      scale: 3,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('فشل إنشاء الصورة');
          setDownloading(false);
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `ticket-${event.slug || 'event'}-${registration.id.slice(0, 8)}.png`;
        
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setDownloading(false);
        }, 100);
        
        toast.success('تم تحميل التذكرة بنجاح');
      },
      'image/png',
      1.0
    );
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('فشل تحميل التذكرة. يرجى المحاولة مرة أخرى');
    setDownloading(false);
  }
};
```

## الخلاصة:

تم تحسين دالة التحميل لتشمل:
- ✅ معالجة شاملة للأخطاء
- ✅ حالة تحميل مرئية
- ✅ رسائل توضيحية للمستخدم
- ✅ تنظيف الموارد بشكل صحيح
- ✅ منع الضغط المتعدد
- ✅ جودة عالية للصورة (scale: 3)
