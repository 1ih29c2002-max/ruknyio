# المرحلة الثامنة: نظام النماذج والاستبيانات
# Phase 8: Forms & Surveys System

## نظرة عامة | Overview
نظام شامل لإنشاء وإدارة نماذج مخصصة، استبيانات، وجمع البيانات من المستخدمين والزوار.

**المدة المتوقعة:** 2-3 أسابيع  
**الأولوية:** متوسطة-عالية  
**الحالة:** 🟡 مقترح

---

## لماذا نحتاج نظام Forms؟ | Why Forms System?

### 🎯 القيمة المضافة

1. **للمنظمين (Event Organizers)**
   - استبيانات تسجيل مخصصة للفعاليات
   - جمع معلومات إضافية عن الحضور
   - استطلاعات رأي بعد الفعالية
   - نماذج ترشيح للمتحدثين

2. **لأصحاب المتاجر (Store Owners)**
   - نماذج طلب منتجات مخصصة
   - استبيانات رضا العملاء
   - نماذج طلب عروض أسعار
   - نماذج ضمان واسترجاع

3. **للمستخدمين العاديين (Regular Users)**
   - نماذج التواصل مع الزوار
   - استبيانات للجمهور
   - نماذج طلبات التعاون
   - استطلاعات رأي عامة

4. **للمنصة (Platform)**
   - جمع بيانات منظمة وقابلة للتحليل
   - زيادة تفاعل المستخدمين
   - ميزة تنافسية قوية
   - مصدر بيانات لـ Analytics

---

## الأهداف الرئيسية | Main Objectives

### 1. Form Builder (منشئ النماذج)
- ✅ واجهة بصرية لإنشاء النماذج (Drag & Drop)
- ✅ أنواع حقول متعددة (Text, Number, Email, Date, Select, etc.)
- ✅ Conditional Logic (إظهار حقول بناءً على إجابات)
- ✅ Validation Rules مخصصة
- ✅ Multi-step Forms (نماذج متعددة الخطوات)
- ✅ Templates جاهزة للاستخدام

### 2. Form Types (أنواع النماذج)
- ✅ **Contact Forms** - نماذج التواصل
- ✅ **Survey Forms** - استبيانات الرأي
- ✅ **Registration Forms** - نماذج التسجيل
- ✅ **Order Forms** - نماذج الطلبات
- ✅ **Feedback Forms** - نماذج التقييم
- ✅ **Quiz Forms** - اختبارات تفاعلية
- ✅ **Application Forms** - نماذج التقديم

### 3. Field Types (أنواع الحقول)
- ✅ Text Input (نص قصير)
- ✅ Textarea (نص طويل)
- ✅ Number Input (أرقام)
- ✅ Email Input (بريد إلكتروني)
- ✅ Phone Input (رقم هاتف)
- ✅ Date Picker (اختيار تاريخ)
- ✅ Time Picker (اختيار وقت)
- ✅ Dropdown Select (قائمة منسدلة)
- ✅ Radio Buttons (اختيار واحد)
- ✅ Checkboxes (اختيار متعدد)
- ✅ File Upload (رفع ملفات)
- ✅ Rating Scale (مقياس تقييم)
- ✅ Linear Scale (مقياس خطي 1-10)
- ✅ Yes/No Toggle (نعم/لا)
- ✅ Matrix Grid (جدول اختيارات)
- ✅ Signature Pad (توقيع رقمي)

### 4. Form Management (إدارة النماذج)
- ✅ إنشاء وتعديل النماذج
- ✅ نسخ النماذج (Duplicate)
- ✅ أرشفة النماذج
- ✅ مشاركة النماذج (Public/Private)
- ✅ تضمين النماذج (Embed)
- ✅ روابط مخصصة للنماذج

### 5. Response Management (إدارة الإجابات)
- ✅ عرض جميع الإجابات
- ✅ تصدير البيانات (CSV, Excel, PDF)
- ✅ تحليلات وإحصائيات
- ✅ رسوم بيانية تلقائية
- ✅ تصفية وبحث في الإجابات
- ✅ إشعارات الإجابات الجديدة

### 6. Advanced Features (ميزات متقدمة)
- ✅ Integration مع الفعاليات والمتاجر
- ✅ Auto-responses (ردود تلقائية)
- ✅ Email notifications
- ✅ Webhook integration
- ✅ Logic Jumps (انتقال ذكي بين الأسئلة)
- ✅ Payment integration (للنماذج المدفوعة)
- ✅ CAPTCHA protection
- ✅ Rate limiting
- ✅ Multi-language support

---

## البنية التقنية | Technical Architecture

### Database Schema

```prisma
// apps/api/prisma/schema.prisma

enum FormType {
  CONTACT
  SURVEY
  REGISTRATION
  ORDER
  FEEDBACK
  QUIZ
  APPLICATION
  OTHER
}

enum FormStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  CLOSED
}

enum FieldType {
  TEXT
  TEXTAREA
  NUMBER
  EMAIL
  PHONE
  DATE
  TIME
  DATETIME
  SELECT
  RADIO
  CHECKBOX
  FILE
  RATING
  SCALE
  TOGGLE
  MATRIX
  SIGNATURE
}

model Form {
  id            String       @id @default(cuid())
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Form Info
  title         String       @db.VarChar(200)
  description   String?      @db.Text
  slug          String       @unique @db.VarChar(200)
  type          FormType     @default(OTHER)
  status        FormStatus   @default(DRAFT)
  
  // Settings
  allowMultipleSubmissions Boolean @default(false)
  requiresAuthentication   Boolean @default(false)
  showProgressBar         Boolean @default(true)
  showQuestionNumbers     Boolean @default(true)
  shuffleQuestions        Boolean @default(false)
  
  // Submission Settings
  maxSubmissions          Int?
  submissionLimit         Int?        // Per user
  opensAt                DateTime?
  closesAt               DateTime?
  
  // Notifications
  notifyOnSubmission     Boolean @default(true)
  notificationEmail      String?
  autoResponseEnabled    Boolean @default(false)
  autoResponseMessage    String? @db.Text
  
  // Integration
  linkedEventId   String?
  linkedStoreId   String?
  linkedEvent     Event?  @relation(fields: [linkedEventId], references: [id], onDelete: SetNull)
  linkedStore     Store?  @relation(fields: [linkedStoreId], references: [id], onDelete: SetNull)
  
  // Appearance
  theme           Json?           // Custom colors, fonts, etc.
  coverImage      String?
  
  // Relations
  fields          FormField[]
  submissions     FormSubmission[]
  
  // Analytics
  viewCount       Int      @default(0)
  submissionCount Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([type])
  @@index([slug])
}

model FormField {
  id          String      @id @default(cuid())
  formId      String
  form        Form        @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  // Field Info
  label       String      @db.VarChar(500)
  description String?     @db.Text
  type        FieldType
  order       Int
  
  // Configuration
  required    Boolean     @default(false)
  placeholder String?
  defaultValue String?
  
  // Options (for select, radio, checkbox)
  options     Json?       // Array of options
  
  // Validation
  validationRules Json?   // Min, max, pattern, etc.
  
  // Conditional Logic
  conditionalLogic Json?  // Show/hide based on other fields
  
  // File Upload Settings (if type = FILE)
  allowedFileTypes String[]  @default([])
  maxFileSize      Int?      // In bytes
  maxFiles         Int?      @default(1)
  
  // Scale Settings (if type = SCALE or RATING)
  minValue         Int?
  maxValue         Int?
  minLabel         String?
  maxLabel         String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([formId])
  @@index([order])
}

model FormSubmission {
  id              String   @id @default(cuid())
  formId          String
  form            Form     @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  userId          String?
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // Submission Data
  data            Json     // All form field answers
  
  // Metadata
  ipAddress       String?
  userAgent       String?
  
  // Status
  isCompleted     Boolean  @default(true)
  completedAt     DateTime @default(now())
  
  // Time tracking
  timeToComplete  Int?     // Seconds
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([formId])
  @@index([userId])
  @@index([completedAt])
}

model FormAnalytics {
  id              String   @id @default(cuid())
  formId          String
  
  // Daily stats
  date            DateTime @db.Date
  views           Int      @default(0)
  submissions     Int      @default(0)
  completionRate  Float?   // Percentage
  avgTimeToComplete Int?   // Seconds
  
  createdAt       DateTime @default(now())
  
  @@unique([formId, date])
  @@index([formId])
}
```

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 8.1: Backend - Forms Module

#### 1. Form DTOs

**apps/api/src/forms/dto/create-form.dto.ts:**
```typescript
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsInt, 
  IsDate,
  IsArray,
  ValidateNested,
  MaxLength,
  Matches 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum FormType {
  CONTACT = 'CONTACT',
  SURVEY = 'SURVEY',
  REGISTRATION = 'REGISTRATION',
  ORDER = 'ORDER',
  FEEDBACK = 'FEEDBACK',
  QUIZ = 'QUIZ',
  APPLICATION = 'APPLICATION',
  OTHER = 'OTHER',
}

export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  DATE = 'DATE',
  TIME = 'TIME',
  SELECT = 'SELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  FILE = 'FILE',
  RATING = 'RATING',
  SCALE = 'SCALE',
  TOGGLE = 'TOGGLE',
  SIGNATURE = 'SIGNATURE',
}

export class CreateFormFieldDto {
  @ApiProperty({ example: 'What is your name?' })
  @IsString()
  @MaxLength(500)
  label: string;

  @ApiPropertyOptional({ example: 'Please enter your full name' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ example: 'Enter your answer...' })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiPropertyOptional({ example: ['Option 1', 'Option 2'] })
  @IsArray()
  @IsOptional()
  options?: any;

  @ApiPropertyOptional()
  @IsOptional()
  validationRules?: any;

  @ApiPropertyOptional()
  @IsOptional()
  conditionalLogic?: any;
}

export class CreateFormDto {
  @ApiProperty({ example: 'Customer Feedback Form' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'customer-feedback-form' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({ example: 'Help us improve our service' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: FormType })
  @IsEnum(FormType)
  type: FormType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowMultipleSubmissions?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  requiresAuthentication?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  maxSubmissions?: number;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  opensAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  closesAt?: Date;

  @ApiPropertyOptional({ example: 'event-id-here' })
  @IsString()
  @IsOptional()
  linkedEventId?: string;

  @ApiPropertyOptional({ example: 'store-id-here' })
  @IsString()
  @IsOptional()
  linkedStoreId?: string;

  @ApiPropertyOptional({ type: [CreateFormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  @IsOptional()
  fields?: CreateFormFieldDto[];
}
```

#### 2. Forms Service

**apps/api/src/forms/forms.service.ts:**
```typescript
import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  ForbiddenException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, UpdateFormDto, SubmitFormDto } from './dto';
import { FormStatus } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFormDto: CreateFormDto) {
    // Check slug uniqueness
    const existingForm = await this.prisma.form.findUnique({
      where: { slug: createFormDto.slug },
    });

    if (existingForm) {
      throw new ConflictException('Form slug already taken');
    }

    // Validate linked entities if provided
    if (createFormDto.linkedEventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: createFormDto.linkedEventId },
      });
      if (!event) {
        throw new NotFoundException('Linked event not found');
      }
    }

    if (createFormDto.linkedStoreId) {
      const store = await this.prisma.store.findUnique({
        where: { id: createFormDto.linkedStoreId },
      });
      if (!store) {
        throw new NotFoundException('Linked store not found');
      }
    }

    // Extract fields from DTO
    const { fields, ...formData } = createFormDto;

    // Create form with fields
    return this.prisma.form.create({
      data: {
        ...formData,
        userId,
        status: FormStatus.DRAFT,
        fields: fields ? {
          create: fields,
        } : undefined,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(filters?: {
    userId?: string;
    type?: string;
    status?: FormStatus;
    linkedEventId?: string;
    linkedStoreId?: string;
    page?: number;
    limit?: number;
  }) {
    const { 
      userId, 
      type, 
      status, 
      linkedEventId, 
      linkedStoreId, 
      page = 1, 
      limit = 20 
    } = filters || {};
    
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (linkedEventId) where.linkedEventId = linkedEventId;
    if (linkedStoreId) where.linkedStoreId = linkedStoreId;

    const [forms, total] = await Promise.all([
      this.prisma.form.findMany({
        where,
        include: {
          _count: {
            select: {
              fields: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.form.count({ where }),
    ]);

    return {
      forms,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const form = await this.prisma.form.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        linkedEvent: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        linkedStore: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Increment view count
    await this.prisma.form.update({
      where: { id: form.id },
      data: { viewCount: { increment: 1 } },
    });

    return form;
  }

  async update(userId: string, formId: string, updateFormDto: UpdateFormDto) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this form');
    }

    // Check slug uniqueness if updating
    if (updateFormDto.slug && updateFormDto.slug !== form.slug) {
      const existingForm = await this.prisma.form.findUnique({
        where: { slug: updateFormDto.slug },
      });

      if (existingForm) {
        throw new ConflictException('Form slug already taken');
      }
    }

    return this.prisma.form.update({
      where: { id: formId },
      data: updateFormDto,
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateStatus(userId: string, formId: string, status: FormStatus) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this form');
    }

    return this.prisma.form.update({
      where: { id: formId },
      data: { status },
    });
  }

  async delete(userId: string, formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this form');
    }

    return this.prisma.form.delete({
      where: { id: formId },
    });
  }

  async submitForm(formId: string, submitFormDto: SubmitFormDto, userId?: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: true,
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Validate form status
    if (form.status !== FormStatus.PUBLISHED) {
      throw new BadRequestException('Form is not accepting submissions');
    }

    // Check if form is open
    const now = new Date();
    if (form.opensAt && now < form.opensAt) {
      throw new BadRequestException('Form is not open yet');
    }
    if (form.closesAt && now > form.closesAt) {
      throw new BadRequestException('Form is closed');
    }

    // Check authentication requirement
    if (form.requiresAuthentication && !userId) {
      throw new BadRequestException('Authentication required to submit this form');
    }

    // Check submission limit
    if (form.maxSubmissions) {
      const submissionCount = await this.prisma.formSubmission.count({
        where: { formId },
      });
      if (submissionCount >= form.maxSubmissions) {
        throw new BadRequestException('Form has reached maximum submissions');
      }
    }

    // Check multiple submissions
    if (!form.allowMultipleSubmissions && userId) {
      const existingSubmission = await this.prisma.formSubmission.findFirst({
        where: { formId, userId },
      });
      if (existingSubmission) {
        throw new BadRequestException('You have already submitted this form');
      }
    }

    // Validate required fields
    const requiredFields = form.fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!submitFormDto.data[field.id]) {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }
    }

    // Create submission
    const submission = await this.prisma.formSubmission.create({
      data: {
        formId,
        userId,
        data: submitFormDto.data,
        ipAddress: submitFormDto.ipAddress,
        userAgent: submitFormDto.userAgent,
        timeToComplete: submitFormDto.timeToComplete,
      },
    });

    // Update form submission count
    await this.prisma.form.update({
      where: { id: formId },
      data: { submissionCount: { increment: 1 } },
    });

    // Send notifications if enabled
    if (form.notifyOnSubmission && form.notificationEmail) {
      // TODO: Send email notification
    }

    // Send auto-response if enabled
    if (form.autoResponseEnabled && form.autoResponseMessage && userId) {
      // TODO: Send auto-response email
    }

    return submission;
  }

  async getFormSubmissions(userId: string, formId: string, page = 1, limit = 50) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException('Not authorized to view submissions');
    }

    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where: { formId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.formSubmission.count({ where: { formId } }),
    ]);

    return {
      submissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getFormAnalytics(userId: string, formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: true,
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.userId !== userId) {
      throw new ForbiddenException('Not authorized to view analytics');
    }

    const submissions = await this.prisma.formSubmission.findMany({
      where: { formId },
    });

    // Calculate analytics
    const totalSubmissions = submissions.length;
    const completionRate = form.viewCount > 0 
      ? (totalSubmissions / form.viewCount) * 100 
      : 0;

    const avgTimeToComplete = submissions
      .filter(s => s.timeToComplete)
      .reduce((acc, s) => acc + (s.timeToComplete || 0), 0) / 
      (submissions.filter(s => s.timeToComplete).length || 1);

    // Field-level analytics
    const fieldAnalytics = form.fields.map(field => {
      const responses = submissions.map(s => s.data[field.id]).filter(Boolean);
      
      return {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        totalResponses: responses.length,
        // Add more specific analytics based on field type
      };
    });

    return {
      summary: {
        totalViews: form.viewCount,
        totalSubmissions,
        completionRate: Math.round(completionRate * 100) / 100,
        avgTimeToComplete: Math.round(avgTimeToComplete),
      },
      fieldAnalytics,
    };
  }
}
```

---

### المرحلة 8.2: Frontend - Form Builder

#### React Form Builder Component

**apps/web/src/components/forms/FormBuilder.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Settings } from 'lucide-react';

const FIELD_TYPES = [
  { type: 'TEXT', label: 'Short Text', icon: '📝' },
  { type: 'TEXTAREA', label: 'Long Text', icon: '📄' },
  { type: 'EMAIL', label: 'Email', icon: '✉️' },
  { type: 'NUMBER', label: 'Number', icon: '🔢' },
  { type: 'DATE', label: 'Date', icon: '📅' },
  { type: 'SELECT', label: 'Dropdown', icon: '📋' },
  { type: 'RADIO', label: 'Multiple Choice', icon: '🔘' },
  { type: 'CHECKBOX', label: 'Checkboxes', icon: '☑️' },
  { type: 'RATING', label: 'Rating', icon: '⭐' },
  { type: 'FILE', label: 'File Upload', icon: '📎' },
];

export function FormBuilder() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  const addField = (type) => {
    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} Field`,
      required: false,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const deleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Field Types Panel */}
      <div className="col-span-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Field Types</h3>
          <div className="space-y-2">
            {FIELD_TYPES.map((fieldType) => (
              <Button
                key={fieldType.type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addField(fieldType.type)}
              >
                <span className="mr-2">{fieldType.icon}</span>
                {fieldType.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Form Canvas */}
      <div className="col-span-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Form Preview</h3>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4 min-h-[400px]"
                >
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <label className="font-medium text-sm">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <div className="mt-2">
                                {/* Render preview based on field type */}
                                <FieldPreview field={field} />
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedField(field)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteField(field.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {fields.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Add fields from the left panel to start building your form</p>
            </div>
          )}
        </Card>
      </div>

      {/* Field Settings Panel */}
      <div className="col-span-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Field Settings</h3>
          {selectedField ? (
            <FieldSettings 
              field={selectedField} 
              onUpdate={(updated) => {
                setFields(fields.map(f => 
                  f.id === updated.id ? updated : f
                ));
              }}
            />
          ) : (
            <p className="text-sm text-gray-500">
              Select a field to edit its settings
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
```

---

## التكامل مع الأقسام الأخرى | Integration

### 1. Forms للفعاليات (Events Integration)

```typescript
// في صفحة تفاصيل الفعالية
<EventPage>
  {/* عرض النماذج المرتبطة بالفعالية */}
  {event.forms && event.forms.length > 0 && (
    <section>
      <h2>Registration & Surveys</h2>
      {event.forms.map(form => (
        <FormCard 
          key={form.id}
          form={form}
          eventId={event.id}
        />
      ))}
    </section>
  )}
</EventPage>
```

### 2. Forms للمتاجر (Store Integration)

```typescript
// في صفحة المتجر
<StorePage>
  {/* نموذج طلب مخصص */}
  <CustomOrderForm storeId={store.id} />
  
  {/* نموذج تقييم المنتج */}
  <ProductReviewForm productId={product.id} />
</StorePage>
```

---

## الميزات المتقدمة | Advanced Features

### 1. Conditional Logic (المنطق الشرطي)
```typescript
// مثال: إظهار حقل بناءً على إجابة سابقة
{
  fieldId: 'dietary-restrictions',
  showIf: {
    field: 'has-allergies',
    operator: 'equals',
    value: 'yes'
  }
}
```

### 2. Payment Integration (تكامل الدفع)
```typescript
// للنماذج المدفوعة (مثل: تسجيل فعالية بمقابل)
<FormSubmission>
  {form.requiresPayment && (
    <PaymentStep 
      amount={form.price}
      onPaymentComplete={submitForm}
    />
  )}
</FormSubmission>
```

### 3. Analytics Dashboard (لوحة التحليلات)
```typescript
// عرض إحصائيات النموذج
<FormAnalytics formId={formId}>
  - عدد المشاهدات
  - عدد الإجابات
  - معدل الإكمال
  - متوسط الوقت للإكمال
  - رسوم بيانية للإجابات
</FormAnalytics>
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق
- [ ] Backend: Form CRUD APIs
- [ ] Backend: Form Submission APIs
- [ ] Backend: Form Analytics APIs
- [ ] Frontend: Form Builder (Drag & Drop)
- [ ] Frontend: Form Viewer (Public)
- [ ] Frontend: Form Submissions Dashboard
- [ ] Frontend: Form Analytics Dashboard
- [ ] Email Notifications System
- [ ] Auto-responses
- [ ] Export to CSV/Excel
- [ ] Integration مع Events
- [ ] Integration مع Stores
- [ ] Mobile Responsive
- [ ] Multi-language Support
- [ ] Documentation
- [ ] Tests (Unit + Integration)

---

## الخطوات التالية | Next Steps

1. **مراجعة الاقتراح** والموافقة على الخطة
2. **إضافة الـ Schema** لقاعدة البيانات
3. **تطوير Backend APIs** أولاً
4. **بناء Form Builder UI** 
5. **التكامل مع الأقسام الموجودة**
6. **الاختبار الشامل**
7. **الإطلاق التدريجي (Soft Launch)**

---

**تاريخ الاقتراح:** 8 نوفمبر 2025  
**الحالة:** 🟡 مقترح - في انتظار الموافقة  
**الأولوية:** متوسطة-عالية  
**التأثير المتوقع:** 🚀 عالي جداً
