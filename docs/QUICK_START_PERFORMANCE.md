# ⚡ تطبيق تحسينات الأداء - خطوات سريعة

## 📦 الخطوة 1: تثبيت الحزم الجديدة

```bash
cd apps/api
npm install
```

## 🗄️ الخطوة 2: تطبيق Database Indexes

```bash
cd apps/api
npx prisma db push
```

> **ملاحظة**: نستخدم `db push` بدلاً من `migrate dev` لأن قاعدة البيانات تحتوي على تغييرات موجودة.

## ⚙️ الخطوة 3: تحديث ملف .env

افتح ملف `.env` وحدّث `DATABASE_URL`:

```bash
# قبل
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rukny_io?schema=public"

# بعد (أضف connection pooling parameters)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rukny_io?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
```

## 🚀 الخطوة 4: إعادة تشغيل الـ API

```bash
# إيقاف الـ API الحالي (Ctrl+C)

# إعادة التشغيل
npm run start:dev
```

## ✅ التحقق من نجاح التطبيق

يجب أن ترى في logs:

```
✅ Database connected successfully
✅ Connected to Redis: redis://localhost:6379
✅ Redis client ready
🚀 Server is running on: http://localhost:3001
```

## 📊 اختبار التحسينات

### 1. اختبار Compression
```bash
curl -I http://localhost:3001/api/v1/stores
# يجب أن ترى: Content-Encoding: gzip
```

### 2. اختبار Performance Monitoring
```bash
# افتح الـ API في المتصفح
# راقب logs للطلبات البطيئة (> 1 ثانية)
```

### 3. اختبار Cache
```bash
# الطلب الأول (بدون cache)
curl http://localhost:3001/api/v1/profiles/username

# الطلب الثاني (من cache) - يجب أن يكون أسرع
curl http://localhost:3001/api/v1/profiles/username
```

---

## 🎯 النتائج المتوقعة

- ✅ **70% تقليل** في حجم الاستجابات
- ✅ **50% تحسين** في سرعة الاستجابة
- ✅ **10x أسرع** في وقت البناء
- ✅ **تقليل 50%** في استعلامات قاعدة البيانات

---

## ⚠️ في حالة وجود مشاكل

### مشكلة: Migration فشل
```bash
npx prisma migrate reset
npx prisma migrate dev --name add_performance_indexes
```

### مشكلة: Redis لا يعمل
```bash
# تأكد من تشغيل Redis
docker-compose up -d redis

# أو
redis-server
```

### مشكلة: Build بطيء
```bash
# تأكد من أن SWC مثبت
npm list @swc/core

# إذا لم يكن مثبت
npm install @swc/core @swc/cli --save-dev
```

---

## 📖 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- [API_PERFORMANCE_IMPROVEMENTS.md](./API_PERFORMANCE_IMPROVEMENTS.md)

---

✅ **جاهز للاستخدام!**
