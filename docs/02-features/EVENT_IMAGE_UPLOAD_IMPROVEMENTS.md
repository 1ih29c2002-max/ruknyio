# تحسينات نظام رفع صور الفعاليات

## نظرة عامة
تم تحسين نظام رفع الصور للفعاليات بإضافة endpoint جديد مخصص مع معالجة متقدمة للصور.

## التحسينات المنفذة

### 1. Backend API (NestJS)

#### Endpoint الجديد: `/api/v1/upload/event-image`
```typescript
POST /api/v1/upload/event-image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**المواصفات:**
- ✅ حد أقصى لحجم الملف: **10MB** (بدلاً من 5MB للصور الشخصية)
- ✅ معدل الطلبات: 5 طلبات في الدقيقة (Throttling)
- ✅ أنواع الملفات المسموحة: JPEG, PNG, WebP, GIF
- ✅ التحقق من نوع الملف باستخدام Magic Bytes (file-type package)

#### معالجة الصور باستخدام Sharp

**التحسينات:**
1. **تغيير الحجم التلقائي:**
   - العرض: 1200px (تناسب مثالي للعرض على الويب)
   - الارتفاع: تناسبي تلقائياً
   - `fit: 'inside'` - يحافظ على نسبة العرض إلى الارتفاع
   - `withoutEnlargement: true` - لا يكبر الصور الصغيرة

2. **التحويل إلى WebP:**
   - جودة: 85% (توازن مثالي بين الجودة والحجم)
   - effort: 6 (ضغط متقدم)
   - توفير ~30-40% من حجم الملف مقارنة بـ JPEG

3. **أسماء ملفات آمنة:**
   - استخدام UUID v4 لأسماء فريدة وآمنة
   - امتداد `.webp` موحد لجميع الصور
   - مثال: `6bd3bba3-7a17-45f4-9506-f4da9dce501c.webp`

4. **المسار:**
   ```
   /uploads/events/{uuid}.webp
   ```

#### الأمان

- ✅ التحقق من نوع الملف الفعلي (Magic Bytes) وليس فقط الامتداد
- ✅ حد أقصى لحجم الملف على مستوى Multer
- ✅ JWT Authentication مطلوب
- ✅ Rate limiting لمنع إساءة الاستخدام
- ✅ أسماء ملفات عشوائية (UUID) لمنع التخمين

### 2. Frontend (Next.js)

#### تحسينات EventForm Component

**التغييرات الرئيسية:**

1. **رفع حد حجم الملف:**
   ```typescript
   const maxSize = 10 * 1024 * 1024; // 10MB
   ```

2. **تحديد أنواع الملفات المسموحة:**
   ```html
   <input accept="image/jpeg,image/png,image/webp,image/gif" />
   ```

3. **رسائل خطأ أفضل:**
   - رسائل واضحة بالعربية
   - عرض حجم الملف المسموح
   - معالجة أفضل للأخطاء من API

4. **تجربة مستخدم محسّنة:**
   - رسالة أثناء الرفع: "جاري رفع الصورة... يتم معالجة الصورة وتحويلها إلى WebP"
   - معاينة فورية للصورة بعد الرفع
   - إمكانية حذف الصورة وإعادة الرفع
   - مسح input الملف بعد الرفع للسماح برفع نفس الملف مرة أخرى

5. **معالجة URL الصور:**
   ```typescript
   // تحويل المسار النسبي إلى مطلق
   if (imageUrl && !imageUrl.startsWith('http')) {
     const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
     imageUrl = `${baseUrl}${imageUrl}`;
   }
   ```

#### تحديث next.config.ts

**إضافة دعم للمسارات المختلفة:**
```typescript
images: {
  remotePatterns: [
    // localhost
    { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/uploads/**' },
    { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/api/uploads/**' },
    
    // LAN IP
    { protocol: 'http', hostname: '192.168.0.161', port: '3001', pathname: '/uploads/**' },
    { protocol: 'http', hostname: '192.168.0.161', port: '3001', pathname: '/api/uploads/**' },
    
    // 127.0.0.1
    { protocol: 'http', hostname: '127.0.0.1', port: '3001', pathname: '/uploads/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '3001', pathname: '/api/uploads/**' },
  ],
}
```

## الفوائد

### 1. الأداء
- ✅ صور أصغر بنسبة 30-40% (WebP)
- ✅ تحميل أسرع للصفحات
- ✅ استهلاك أقل للباندويدث
- ✅ أبعاد موحدة ومحسّنة (1200px)

### 2. الأمان
- ✅ التحقق الصارم من نوع الملف
- ✅ حماية من رفع ملفات ضارة
- ✅ أسماء ملفات عشوائية آمنة
- ✅ Rate limiting

### 3. تجربة المستخدم
- ✅ واجهة سهلة ومفهومة
- ✅ رسائل خطأ واضحة بالعربية
- ✅ معاينة فورية
- ✅ تغذية راجعة أثناء الرفع

### 4. الصيانة
- ✅ كود نظيف ومنظم
- ✅ معالجة أخطاء شاملة
- ✅ سهولة التوسع مستقبلاً

## الاستخدام

### من واجهة الفعاليات

1. **إنشاء فعالية جديدة:**
   - انتقل إلى: Dashboard → الفعاليات → إنشاء فعالية
   - اضغط على منطقة رفع الصورة
   - اختر صورة (حتى 10MB)
   - سيتم رفع ومعالجة الصورة تلقائياً

2. **تعديل فعالية:**
   - نفس الخطوات
   - الصورة الحالية تظهر كمعاينة
   - يمكن حذف الصورة واختيار جديدة

### API مباشرة

```bash
curl -X POST http://localhost:3001/api/v1/upload/event-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**الاستجابة:**
```json
{
  "message": "Event image uploaded successfully",
  "url": "/uploads/events/6bd3bba3-7a17-45f4-9506-f4da9dce501c.webp",
  "path": "/uploads/events/6bd3bba3-7a17-45f4-9506-f4da9dce501c.webp"
}
```

## الملفات المعدلة

### Backend
1. `/apps/api/src/modules/upload/upload.controller.ts`
   - ✅ إضافة endpoint: `POST /upload/event-image`
   - ✅ Rate limiting: 5 طلبات/دقيقة
   - ✅ حد الحجم: 10MB

2. `/apps/api/src/modules/upload/upload.service.ts`
   - ✅ تحسين `uploadEventImage()`
   - ✅ إزالة التحقق من الأبعاد (غير ضروري مع التحجيم التلقائي)
   - ✅ تحسين جودة WebP: effort: 6

### Frontend
1. `/apps/web/src/features/events/components/dashboard/EventForm.tsx`
   - ✅ تحديث handleImageUpload()
   - ✅ رفع الحد الأقصى لـ 10MB
   - ✅ تحسين رسائل الخطأ
   - ✅ تحديد أنواع الملفات المسموحة
   - ✅ مسح input بعد الرفع

2. `/apps/web/next.config.ts`
   - ✅ إضافة دعم `/api/uploads/**`
   - ✅ دعم جميع عناوين IP المحلية

## الاختبار

### اختبارات يدوية مطلوبة:

1. ✅ رفع صورة JPEG كبيرة (8MB)
2. ✅ رفع صورة PNG
3. ✅ رفع صورة WebP
4. ✅ رفع صورة GIF
5. ✅ محاولة رفع ملف أكبر من 10MB (يجب أن يفشل)
6. ✅ محاولة رفع ملف غير صورة (يجب أن يفشل)
7. ✅ التحقق من تحويل الصورة إلى WebP
8. ✅ التحقق من تصغير الصورة إلى 1200px
9. ✅ معاينة الصورة بعد الرفع
10. ✅ حذف الصورة وإعادة الرفع

## التوصيات المستقبلية

### قصيرة المدى:
- [ ] إضافة شريط تقدم لرفع الملفات
- [ ] عرض حجم الصورة قبل وبعد المعالجة
- [ ] إضافة محرر صور بسيط (crop, rotate)

### متوسطة المدى:
- [ ] دعم رفع صور متعددة (gallery)
- [ ] إضافة watermark للصور
- [ ] CDN integration للصور

### طويلة المدى:
- [ ] تخزين سحابي (AWS S3, Cloudinary)
- [ ] تحسين تلقائي بناءً على سرعة الشبكة
- [ ] تحليل محتوى الصور (AI)

## المراجع

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [WebP Image Format](https://developers.google.com/speed/webp)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

---

**آخر تحديث:** 6 نوفمبر 2025
**الحالة:** ✅ مكتمل وجاهز للاستخدام
