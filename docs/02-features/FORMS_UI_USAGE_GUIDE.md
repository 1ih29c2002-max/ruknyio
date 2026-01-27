# دليل استخدام واجهات النماذج المتقدمة

## 1️⃣ Multi-step Forms (النماذج متعددة الخطوات)

### إنشاء نموذج متعدد الخطوات

```tsx
// في صفحة إعداد النموذج: /app/dashboard/forms/[formId]/steps/page.tsx
'use client';

import { StepBuilder } from '@/components/forms/StepBuilder';
import { formsApi } from '@/lib/api/forms';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FormStepsPage() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // تحميل النموذج والحقول
    formsApi.getFormById(formId as string).then((data) => {
      setForm(data);
      setFields(data.fields || []);
    });
  }, [formId]);

  const handleSaveSteps = async (steps) => {
    try {
      await formsApi.updateFormSteps(formId as string, steps);
      
      // تحديث النموذج ليصبح multi-step
      await formsApi.updateForm(formId as string, {
        isMultiStep: true,
        showProgressBar: true,
      });
      
      alert('تم حفظ الخطوات بنجاح!');
    } catch (error) {
      console.error(error);
      alert('فشل حفظ الخطوات');
    }
  };

  if (!form || !fields.length) return <div>جاري التحميل...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">إعداد الخطوات المتعددة</h1>
      <StepBuilder
        formId={formId as string}
        fields={fields}
        onSave={handleSaveSteps}
      />
    </div>
  );
}
```

### عرض النموذج متعدد الخطوات (للمستخدمين)

```tsx
// في صفحة عرض النموذج: /app/forms/[slug]/page.tsx
'use client';

import { MultiStepFormViewer } from '@/components/forms/MultiStepFormViewer';
import { formsApi } from '@/lib/api/forms';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicFormPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);

  useEffect(() => {
    formsApi.getFormBySlug(slug as string).then(setForm);
  }, [slug]);

  const handleSubmit = async (data) => {
    try {
      await formsApi.submitFormPublic(slug as string, data);
      router.push(`/forms/${slug}/success`);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveDraft = async (data) => {
    // حفظ في localStorage أو قاعدة البيانات
    localStorage.setItem(`draft-${slug}`, JSON.stringify(data));
  };

  if (!form) return <div>جاري التحميل...</div>;

  // تحقق إذا كان النموذج متعدد الخطوات
  if (form.isMultiStep && form.steps?.length > 0) {
    return (
      <MultiStepFormViewer
        form={form}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        initialData={JSON.parse(localStorage.getItem(`draft-${slug}`) || '{}')}
      />
    );
  }

  // عرض النموذج العادي (single page)
  return <div>عرض النموذج العادي...</div>;
}
```

---

## 2️⃣ Webhook Integration (تكامل Webhook)

### إعدادات Webhook في لوحة التحكم

```tsx
// في صفحة إعدادات النموذج: /app/dashboard/forms/[formId]/settings/page.tsx
'use client';

import { WebhookSettings } from '@/components/forms/WebhookSettings';
import { WebhookLogsViewer } from '@/components/forms/WebhookLogsViewer';
import { formsApi } from '@/lib/api/forms';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FormSettingsPage() {
  const { formId } = useParams();

  const handleSaveWebhook = async (settings) => {
    await formsApi.updateWebhookSettings(formId as string, settings);
  };

  const handleTestWebhook = async (url, secret) => {
    return await formsApi.testWebhook(formId as string, url, secret);
  };

  const handleFetchLogs = async (formId, page, limit) => {
    return await formsApi.getWebhookLogs(formId, page, limit);
  };

  const handleRetryWebhook = async (logId) => {
    await formsApi.retryWebhook(logId);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">إعدادات Webhook</h1>
      
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          <TabsTrigger value="logs">السجلات</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <WebhookSettings
            formId={formId as string}
            onSave={handleSaveWebhook}
            onTest={handleTestWebhook}
          />
        </TabsContent>

        <TabsContent value="logs">
          <WebhookLogsViewer
            formId={formId as string}
            onFetchLogs={handleFetchLogs}
            onRetry={handleRetryWebhook}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### كيفية استقبال Webhook في خادمك الخارجي

```javascript
// مثال: Node.js/Express endpoint لاستقبال Webhook
const crypto = require('crypto');
const express = require('express');
const app = express();

app.post('/webhook/rukny-forms', express.json(), (req, res) => {
  // 1. التحقق من التوقيع (HMAC)
  const signature = req.headers['x-webhook-signature'];
  const secret = 'YOUR_WEBHOOK_SECRET'; // نفس السر من الإعدادات
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. معالجة البيانات
  const { event, formId, data } = req.body;
  
  switch (event) {
    case 'form.submitted':
      console.log('New form submission:', data);
      // أرسل بريد إلكتروني، احفظ في قاعدة بيانات، إلخ
      break;
      
    case 'form.updated':
      console.log('Form updated:', data);
      break;
      
    case 'form.deleted':
      console.log('Form deleted:', formId);
      break;
  }

  // 3. رد بنجاح
  res.json({ success: true, received: true });
});

app.listen(3000);
```

---

## 3️⃣ Advanced Analytics Dashboard (لوحة التحليلات)

### إضافة لوحة التحليلات

```tsx
// في صفحة التحليلات: /app/dashboard/forms/[formId]/analytics/page.tsx
'use client';

import { AdvancedAnalyticsDashboard } from '@/components/forms/AdvancedAnalyticsDashboard';
import { formsApi } from '@/lib/api/forms';
import { useParams } from 'next/navigation';

export default function FormAnalyticsPage() {
  const { formId } = useParams();

  const handleFetchAnalytics = async (formId) => {
    return await formsApi.getAdvancedAnalytics(formId);
  };

  return (
    <div className="container mx-auto py-8">
      <AdvancedAnalyticsDashboard
        formId={formId as string}
        onFetchAnalytics={handleFetchAnalytics}
      />
    </div>
  );
}
```

### تحليل حقل معين

```tsx
// لعرض تحليلات حقل محدد
import { FieldAnalyticsChart } from '@/components/forms/FieldAnalyticsChart';
import { formsApi } from '@/lib/api/forms';

function FieldAnalyticsPage({ formId, fieldId }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    formsApi.getFieldAnalytics(formId, fieldId).then(setAnalytics);
  }, [formId, fieldId]);

  if (!analytics) return <div>جاري التحميل...</div>;

  return (
    <FieldAnalyticsChart
      fieldLabel={analytics.fieldLabel}
      fieldType={analytics.fieldType}
      data={analytics.valueDistribution}
    />
  );
}
```

---

## 4️⃣ Conditional Logic (المنطق الشرطي)

### استخدام المنطق الشرطي في النموذج

```tsx
// في أي نموذج (single أو multi-step)
import { useConditionalLogic } from '@/hooks/useConditionalLogic';

function MyFormComponent({ form, formData, setFormData }) {
  const { visibleFields, requiredFieldIds } = useConditionalLogic(
    form.fields,
    formData
  );

  return (
    <div>
      {visibleFields.map((field) => (
        <div key={field.id}>
          <label>
            {field.label}
            {requiredFieldIds.includes(field.id) && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <input
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => setFormData({
              ...formData,
              [field.id]: e.target.value
            })}
          />
        </div>
      ))}
    </div>
  );
}
```

### إنشاء قواعد شرطية (في لوحة التحكم)

```tsx
import { ConditionalLogicBuilder } from '@/components/forms/ConditionalLogicBuilder';

function ConditionalLogicPage({ formId, fields }) {
  const handleSave = async (conditionalLogic) => {
    // حفظ في حقل conditionalLogic للنموذج
    await formsApi.updateForm(formId, {
      conditionalLogic: conditionalLogic
    });
  };

  return (
    <ConditionalLogicBuilder
      fields={fields}
      onSave={handleSave}
    />
  );
}
```

---

## 5️⃣ أمثلة كاملة للتكامل

### مثال: نموذج تسجيل حدث متعدد الخطوات

```tsx
'use client';

import { useState, useEffect } from 'react';
import { MultiStepFormViewer } from '@/components/forms/MultiStepFormViewer';
import { formsApi } from '@/lib/api/forms';

export default function EventRegistrationForm({ eventId }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    // تحميل نموذج التسجيل المرتبط بالحدث
    formsApi.getForms({ linkedEventId: eventId }).then((result) => {
      if (result.forms.length > 0) {
        setForm(result.forms[0]);
      }
    });
  }, [eventId]);

  const handleSubmit = async (data) => {
    // إرسال البيانات
    await formsApi.submitForm(form.id, data);
    
    // إشعار webhook سيُرسل تلقائياً
    // التحليلات ستُحدث تلقائياً
  };

  if (!form) return <div>جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{form.title}</h1>
      <MultiStepFormViewer
        form={form}
        onSubmit={handleSubmit}
        onSaveDraft={async (data) => {
          localStorage.setItem(`draft-${form.id}`, JSON.stringify(data));
        }}
      />
    </div>
  );
}
```

---

## 🔧 إعداد Backend Endpoints (مطلوب)

يجب إضافة هذه الـ endpoints في Backend:

```typescript
// في apps/api/src/forms/forms.controller.ts

// Multi-step endpoints
@Post(':id/steps')
async updateFormSteps(@Param('id') id: string, @Body() dto: any) {
  return this.formsService.updateFormSteps(id, dto.steps);
}

@Get(':id/steps')
async getFormSteps(@Param('id') id: string) {
  return this.formsService.getFormSteps(id);
}

// Webhook endpoints
@Put(':id/webhook')
async updateWebhookSettings(@Param('id') id: string, @Body() dto: any) {
  return this.formsService.updateWebhookSettings(id, dto);
}

@Post(':id/webhook/test')
async testWebhook(@Param('id') id: string, @Body() dto: any) {
  return this.webhookService.testWebhook(dto.url, dto.secret);
}

@Get(':id/webhook/logs')
async getWebhookLogs(@Param('id') id: string, @Query() query: any) {
  return this.formsService.getWebhookLogs(id, query.page, query.limit);
}

// Advanced Analytics endpoints
@Get(':id/analytics/advanced')
async getAdvancedAnalytics(@Param('id') id: string) {
  return this.analyticsService.getFormAnalytics(id);
}
```

---

## 📦 مكونات UI مطلوبة إضافية

تأكد من وجود هذه المكونات من shadcn/ui:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add textarea
```

---

## ✅ Checklist للتطبيق

- [ ] إضافة صفحة `/dashboard/forms/[formId]/steps` لإعداد الخطوات
- [ ] إضافة صفحة `/dashboard/forms/[formId]/webhook` لإعدادات Webhook
- [ ] إضافة صفحة `/dashboard/forms/[formId]/analytics` للتحليلات
- [ ] تحديث صفحة عرض النموذج لدعم Multi-step
- [ ] إضافة Backend endpoints المطلوبة
- [ ] اختبار Webhook مع خادم خارجي
- [ ] التحقق من عمل التحليلات بعد الردود

---

## 🎯 نصائح للأداء

1. **Lazy Loading**: استخدم `dynamic` من Next.js لتحميل المكونات الكبيرة:
```tsx
import dynamic from 'next/dynamic';

const AdvancedAnalyticsDashboard = dynamic(
  () => import('@/components/forms/AdvancedAnalyticsDashboard'),
  { ssr: false, loading: () => <div>جاري التحميل...</div> }
);
```

2. **Caching**: استخدم React Query أو SWR للـ caching:
```tsx
import { useQuery } from '@tanstack/react-query';

const { data: analytics } = useQuery({
  queryKey: ['analytics', formId],
  queryFn: () => formsApi.getAdvancedAnalytics(formId),
  staleTime: 5 * 60 * 1000, // 5 دقائق
});
```

3. **Pagination**: احرص على استخدام pagination في السجلات والتحليلات
