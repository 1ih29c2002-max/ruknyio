# دليل إعداد التكامل مع Google Sheets

## نظرة عامة

يتيح لك هذا التكامل حفظ بيانات النماذج مباشرة في Google Sheets بدون الحاجة لخادم خلفي.

## الخطوات

### 1. إنشاء Google Sheet جديد

1. اذهب إلى [Google Sheets](https://sheets.google.com)
2. أنشئ جدول بيانات جديد
3. أضف العناوين في الصف الأول:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Timestamp | Full Name | Email | Phone | Subject | Message | Company |

### 2. إنشاء Google Apps Script

1. من القائمة، اختر **Extensions** > **Apps Script**
2. احذف الكود الموجود والصق الكود التالي:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // إضافة صف جديد
    var row = [
      data.timestamp || new Date().toISOString(),
      data.fullName || '',
      data.email || '',
      data.phone || '',
      data.subject || '',
      data.message || '',
      data.company || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        row: sheet.getLastRow() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheets API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. احفظ المشروع باسم مناسب (مثل: "Form Submissions")

### 3. نشر التطبيق كـ Web App

1. اضغط على **Deploy** > **New deployment**
2. اختر **Web app** كنوع التطبيق
3. قم بالإعدادات التالية:
   - **Description**: Form Submissions Handler
   - **Execute as**: Me
   - **Who has access**: Anyone
4. اضغط **Deploy**
5. **انسخ رابط Web App** (سيبدو مثل: `https://script.google.com/macros/s/xxx.../exec`)

### 4. استخدام الرابط في التطبيق

#### الطريقة 1: Environment Variables (موصى بها)

أضف الرابط في ملف `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/xxx.../exec
```

ثم استخدمه في الكود:

```tsx
import MultiStepContactForm from "@/components/ui/multi-step-contact-form"

export default function ContactPage() {
  return (
    <MultiStepContactForm
      googleSheetsUrl={process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL}
      sheetName="Form Submissions"
      onSuccess={(data) => console.log("تم الإرسال:", data)}
    />
  )
}
```

#### الطريقة 2: مباشرة في الكود

```tsx
<MultiStepContactForm
  googleSheetsUrl="https://script.google.com/macros/s/xxx.../exec"
  sheetName="Form Submissions"
/>
```

## الخصائص المتاحة

| الخاصية | النوع | الوصف |
|---------|------|-------|
| `googleSheetsUrl` | `string` | رابط Google Apps Script Web App |
| `sheetName` | `string` | اسم الورقة (افتراضي: "Form Submissions") |
| `onSuccess` | `function` | دالة تُنفذ عند نجاح الإرسال |
| `onError` | `function` | دالة تُنفذ عند فشل الإرسال |
| `title` | `string` | عنوان النموذج |
| `description` | `string` | وصف النموذج |
| `className` | `string` | CSS classes إضافية |

## استكشاف الأخطاء

### المشكلة: "فشل في الإرسال"

**الأسباب المحتملة:**
1. رابط Web App غير صحيح
2. لم يتم النشر بشكل صحيح
3. صلاحيات الوصول غير صحيحة

**الحل:**
1. تأكد من نسخ الرابط بشكل صحيح
2. أعد نشر التطبيق
3. تأكد أن "Who has access" = "Anyone"

### المشكلة: البيانات لا تظهر في الجدول

**الأسباب المحتملة:**
1. خطأ في كود Apps Script
2. أسماء الحقول غير متطابقة

**الحل:**
1. تحقق من سجل التنفيذ في Apps Script
2. تأكد من تطابق أسماء الحقول

## الأمان

⚠️ **ملاحظة مهمة:**
- رابط Web App عام ويمكن لأي شخص الوصول إليه
- لا تستخدم هذا التكامل للبيانات الحساسة
- فكر في إضافة validation إضافي في Apps Script

## مثال متقدم: إرسال إشعار بريد إلكتروني

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.timestamp || new Date().toISOString(),
      data.fullName || '',
      data.email || '',
      data.phone || '',
      data.subject || '',
      data.message || '',
      data.company || ''
    ];
    
    sheet.appendRow(row);
    
    // إرسال إشعار بريد إلكتروني
    MailApp.sendEmail({
      to: 'your-email@example.com',
      subject: 'رسالة جديدة: ' + data.subject,
      body: 'تم استلام رسالة جديدة من ' + data.fullName + '\n\n' +
            'البريد: ' + data.email + '\n' +
            'الرسالة: ' + data.message
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```
