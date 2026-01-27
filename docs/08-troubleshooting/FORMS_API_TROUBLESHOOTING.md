# 🔧 دليل حل مشاكل Forms System

## المشكلة: API Request Failed

### الأسباب المحتملة:

#### 1️⃣ **Backend غير مشغل**
```powershell
# تحقق من أن Backend يعمل
cd d:\xampp\htdocs\Rukny.io\apps\api
npm run start:dev

# يجب أن ترى:
# Nest application successfully started
```

#### 2️⃣ **Database Migration لم يتم تطبيقها**
```powershell
# في terminal جديد
cd d:\xampp\htdocs\Rukny.io\apps\api

# تطبيق Migration
npx prisma migrate dev

# توليد Prisma Client
npx prisma generate
```

#### 3️⃣ **Endpoint غير موجود**

تحقق من الـ routes في Backend:
```
GET    http://localhost:3001/api/forms                # Get all forms
POST   http://localhost:3001/api/forms                # Create form
GET    http://localhost:3001/api/forms/:id            # Get form by ID
PUT    http://localhost:3001/api/forms/:id            # Update form
DELETE http://localhost:3001/api/forms/:id            # Delete form
GET    http://localhost:3001/api/forms/public/:slug   # Get public form
POST   http://localhost:3001/api/forms/public/:slug/submit  # Submit form
```

#### 4️⃣ **CORS Issues**

تحقق من CORS في Backend:
```typescript
// في apps/api/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

---

## 🧪 اختبار الـ API

### Test 1: تحقق من Backend Health
```bash
curl http://localhost:3001/api/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T..."
}
```

### Test 2: اختبر Forms Endpoint
```bash
# بدون authentication
curl http://localhost:3001/api/forms

# مع authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/forms
```

### Test 3: اختبر Public Form
```bash
curl http://localhost:3001/api/forms/public/test-form
```

---

## 🔍 فحص الأخطاء في Console

### في Browser Console (F12):
```javascript
// تحقق من الـ error الكامل
// افتح Network tab وشاهد Failed requests
```

### في Backend Terminal:
```
# ابحث عن error logs
[Nest] ERROR [ExceptionsHandler] ...
```

---

## ✅ الحلول

### Solution 1: أعد تشغيل Backend
```powershell
# أوقف Backend (Ctrl+C)
cd d:\xampp\htdocs\Rukny.io\apps\api
npm run start:dev
```

### Solution 2: أعد بناء Frontend
```powershell
# أوقف Frontend (Ctrl+C)
cd d:\xampp\htdocs\Rukny.io\apps\web
npm run dev
```

### Solution 3: امسح Cache
```powershell
# في Frontend
cd d:\xampp\htdocs\Rukny.io\apps\web
rm -rf .next
npm run dev
```

### Solution 4: تحقق من Environment Variables
```bash
# في apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# في apps/api/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
```

---

## 🐛 أخطاء شائعة وحلولها

### Error: "Request failed with status 404"
**السبب:** Endpoint غير موجود
**الحل:** تحقق من الـ route في Backend Controller

### Error: "Request failed with status 401"
**السبب:** غير مصرح (No token or invalid token)
**الحل:** 
```typescript
// تأكد من أن Token موجود
const token = localStorage.getItem('token');
console.log('Token:', token);
```

### Error: "Request failed with status 500"
**السبب:** خطأ في Backend
**الحل:** افحص Backend terminal logs

### Error: "Network request failed"
**السبب:** Backend غير مشغل
**الحل:** شغّل Backend

### Error: "CORS policy"
**السبب:** CORS غير مفعّل
**الحل:** أضف CORS في `main.ts`

---

## 📝 Debugging Checklist

- [ ] ✅ Backend يعمل (`npm run start:dev`)
- [ ] ✅ Frontend يعمل (`npm run dev`)
- [ ] ✅ Database متصلة
- [ ] ✅ Migration مطبقة (`npx prisma migrate dev`)
- [ ] ✅ Prisma Client محدّث (`npx prisma generate`)
- [ ] ✅ Environment variables صحيحة
- [ ] ✅ CORS مفعّل
- [ ] ✅ Token موجود (للـ authenticated endpoints)
- [ ] ✅ Network tab في Browser يظهر الـ request

---

## 🆘 إذا استمرت المشكلة

1. **أرسل لي:**
   - الـ error message الكامل
   - الـ endpoint الذي يفشل
   - Screenshot من Network tab
   - Backend terminal logs

2. **معلومات مفيدة:**
   ```javascript
   // في Browser Console
   console.log('API Base:', process.env.NEXT_PUBLIC_API_URL);
   console.log('Token:', localStorage.getItem('token'));
   ```

3. **تحقق من:**
   - هل الـ form موجود في Database؟
   - هل الـ user مسجل دخول؟
   - هل الـ permissions صحيحة؟

---

**آخر تحديث:** 11 نوفمبر 2025
