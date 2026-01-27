# نظام To-do (قائمة المهام) 📋

## نظرة عامة

نظام إدارة المهام الشخصية المتكامل مع لوحة تحكم المستخدم، يتيح تنظيم المهام اليومية وربطها بالأحداث والمشاريع.

---

## 🎯 الأهداف

- توفير أداة بسيطة وفعالة لإدارة المهام
- تكامل سلس مع نظام الأحداث (Events)
- واجهة مستخدم أنيقة بأسلوب Apple
- دعم كامل للغة العربية (RTL)

---

## 📊 هيكل قاعدة البيانات

### 1. TodoList (قوائم المهام)

```prisma
model TodoList {
  id          String     @id @default(uuid())
  userId      String
  name        String
  nameAr      String?
  color       String     @default("#6366f1")
  icon        String?
  order       Int        @default(0)
  isDefault   Boolean    @default(false)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  todos       Todo[]
  
  @@index([userId])
  @@index([order])
  @@map("todo_lists")
}
```

### 2. Todo (المهام)

```prisma
model Todo {
  id          String       @id @default(uuid())
  listId      String
  userId      String
  title       String
  description String?
  priority    TodoPriority @default(NORMAL)
  status      TodoStatus   @default(PENDING)
  dueDate     DateTime?
  dueTime     String?      // وقت محدد "14:30"
  reminder    DateTime?
  order       Int          @default(0)
  completedAt DateTime?
  isStarred   Boolean      @default(false)
  
  // ربط بأنظمة أخرى (اختياري)
  eventId     String?
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  list        TodoList     @relation(fields: [listId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  event       Event?       @relation(fields: [eventId], references: [id])
  tags        TodoTag[]
  subtasks    Subtask[]
  
  @@index([listId])
  @@index([userId])
  @@index([status])
  @@index([dueDate])
  @@index([priority])
  @@map("todos")
}
```

### 3. Subtask (المهام الفرعية)

```prisma
model Subtask {
  id          String   @id @default(uuid())
  todoId      String
  title       String
  isCompleted Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  
  todo        Todo     @relation(fields: [todoId], references: [id], onDelete: Cascade)
  
  @@index([todoId])
  @@map("subtasks")
}
```

### 4. TodoTag (التصنيفات)

```prisma
model TodoTag {
  id        String   @id @default(uuid())
  userId    String
  name      String
  nameAr    String?
  color     String   @default("#94a3b8")
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  todos     Todo[]
  
  @@unique([userId, name])
  @@index([userId])
  @@map("todo_tags")
}
```

### 5. Enums (التعدادات)

```prisma
enum TodoPriority {
  LOW      // منخفض
  NORMAL   // عادي
  HIGH     // مرتفع
  URGENT   // عاجل
}

enum TodoStatus {
  PENDING     // قيد الانتظار
  IN_PROGRESS // جاري العمل
  COMPLETED   // مكتمل
  ARCHIVED    // مؤرشف
}
```

---

## 🔌 API Endpoints

### المهام (Todos)

| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| `GET` | `/api/todos` | جلب كل المهام | ✅ |
| `GET` | `/api/todos/:id` | جلب مهمة محددة | ✅ |
| `POST` | `/api/todos` | إنشاء مهمة جديدة | ✅ |
| `PATCH` | `/api/todos/:id` | تحديث مهمة | ✅ |
| `DELETE` | `/api/todos/:id` | حذف مهمة | ✅ |
| `PATCH` | `/api/todos/:id/toggle` | تبديل حالة الإكمال | ✅ |
| `PATCH` | `/api/todos/:id/star` | تبديل النجمة | ✅ |
| `PATCH` | `/api/todos/reorder` | إعادة ترتيب المهام | ✅ |
| `POST` | `/api/todos/:id/subtasks` | إضافة مهمة فرعية | ✅ |

### القوائم (Todo Lists)

| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| `GET` | `/api/todo-lists` | جلب كل القوائم | ✅ |
| `GET` | `/api/todo-lists/:id` | جلب قائمة مع مهامها | ✅ |
| `POST` | `/api/todo-lists` | إنشاء قائمة جديدة | ✅ |
| `PATCH` | `/api/todo-lists/:id` | تحديث قائمة | ✅ |
| `DELETE` | `/api/todo-lists/:id` | حذف قائمة | ✅ |

### التصنيفات (Tags)

| Method | Endpoint | الوصف | المصادقة |
|--------|----------|-------|----------|
| `GET` | `/api/todo-tags` | جلب كل التصنيفات | ✅ |
| `POST` | `/api/todo-tags` | إنشاء تصنيف | ✅ |
| `DELETE` | `/api/todo-tags/:id` | حذف تصنيف | ✅ |

### الفلترة والبحث

```
GET /api/todos?status=PENDING&priority=HIGH&listId=xxx&dueDate=today
GET /api/todos?search=اجتماع
GET /api/todos?tags=work,urgent
```

---

## 📝 DTOs (Data Transfer Objects)

### CreateTodoDto

```typescript
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  listId?: string;

  @IsEnum(TodoPriority)
  @IsOptional()
  priority?: TodoPriority = TodoPriority.NORMAL;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  dueTime?: string;

  @IsDateString()
  @IsOptional()
  reminder?: string;

  @IsUUID()
  @IsOptional()
  eventId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @IsOptional()
  subtasks?: { title: string }[];
}
```

### UpdateTodoDto

```typescript
export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;
}
```

### TodoQueryDto

```typescript
export class TodoQueryDto {
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @IsUUID()
  listId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  dueDate?: 'today' | 'week' | 'overdue' | string;

  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 50;
}
```

---

## 📁 هيكل الملفات (Backend)

```
apps/api/src/domain/todos/
├── todos.module.ts
├── todos.controller.ts
├── todos.service.ts
├── todo-lists.controller.ts
├── todo-lists.service.ts
├── todo-tags.controller.ts
├── todo-tags.service.ts
├── dto/
│   ├── index.ts
│   ├── create-todo.dto.ts
│   ├── update-todo.dto.ts
│   ├── todo-query.dto.ts
│   ├── create-todo-list.dto.ts
│   ├── update-todo-list.dto.ts
│   ├── create-subtask.dto.ts
│   └── create-todo-tag.dto.ts
├── entities/
│   ├── todo.entity.ts
│   └── todo-list.entity.ts
└── constants/
    └── todo.constants.ts
```

---

## 🎨 هيكل الملفات (Frontend)

```
apps/web/
├── app/
│   └── app/
│       └── todos/
│           ├── page.tsx
│           └── [listId]/
│               └── page.tsx
├── components/
│   └── todos/
│       ├── TodoList.tsx
│       ├── TodoItem.tsx
│       ├── TodoForm.tsx
│       ├── TodoFilters.tsx
│       ├── TodoSidebar.tsx
│       ├── SubtaskList.tsx
│       └── TodoPriorityBadge.tsx
├── hooks/
│   └── todos/
│       ├── useTodos.ts
│       ├── useTodoLists.ts
│       └── useTodoMutations.ts
└── lib/
    └── api/
        └── todos.ts
```

---

## 🖥️ واجهة المستخدم

### التصميم المقترح

```
┌─────────────────────────────────────────────────────────────┐
│  App  |  To-do  |  Archive        🔍  🔔  ⚙️              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │ 📋 القوائم   │  │                                     │ │
│  │              │  │  ☐ مراجعة التصميم          🔴 عاجل  │ │
│  │ 📌 اليوم (3) │  │     └─ ☐ مراجعة الألوان            │ │
│  │ 📁 عمل (8)   │  │     └─ ☑ تحديث الخطوط              │ │
│  │ 🏠 شخصي (2)  │  │                                     │ │
│  │ 🛒 تسوق (5)  │  │  ☑ إرسال الفاتورة          ✓ مكتمل │ │
│  │              │  │                                     │ │
│  │ ─────────── │  │  ☐ اجتماع الفريق           🟡 عادي  │ │
│  │ + قائمة جديدة│  │     📅 اليوم 2:00 م                 │ │
│  │              │  │                                     │ │
│  │ 🏷️ التصنيفات │  │  ☐ شراء المستلزمات         🟢 منخفض│ │
│  │  • عمل      │  │                                     │ │
│  │  • عاجل     │  │  ─────────────────────────────────  │ │
│  │  • متابعة   │  │  + إضافة مهمة جديدة                 │ │
│  └──────────────┘  └─────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ألوان الأولوية

| الأولوية | اللون | الكود |
|----------|-------|-------|
| عاجل | أحمر | `#ef4444` |
| مرتفع | برتقالي | `#f97316` |
| عادي | أصفر | `#eab308` |
| منخفض | أخضر | `#22c55e` |

### حالات المهام

| الحالة | الأيقونة | اللون |
|--------|----------|-------|
| قيد الانتظار | ☐ | رمادي |
| جاري العمل | ◐ | أزرق |
| مكتمل | ☑ | أخضر |
| مؤرشف | 📦 | رمادي باهت |

---

## ✨ الميزات

### المرحلة الأولى (MVP)
- [x] إنشاء/تعديل/حذف المهام
- [x] قوائم متعددة
- [x] الأولويات (4 مستويات)
- [x] تاريخ الاستحقاق
- [x] إكمال المهام
- [x] السحب والإفلات لإعادة الترتيب

### المرحلة الثانية
- [ ] المهام الفرعية (Subtasks)
- [ ] التصنيفات (Tags)
- [ ] البحث والفلترة
- [ ] تكرار المهام (يومي/أسبوعي/شهري)

### المرحلة الثالثة
- [ ] التذكيرات والإشعارات
- [ ] ربط المهام بالأحداث
- [ ] مشاركة القوائم
- [ ] التقارير والإحصائيات

### المرحلة الرابعة
- [ ] تكامل مع Google Calendar
- [ ] تصدير المهام (PDF/Excel)
- [ ] قوالب المهام الجاهزة
- [ ] Kanban Board View

---

## 🔔 نظام التذكيرات

### أنواع التذكيرات

```typescript
enum ReminderType {
  AT_TIME,        // في الوقت المحدد
  MINUTES_BEFORE, // قبل بـ X دقيقة
  HOURS_BEFORE,   // قبل بـ X ساعة
  DAY_BEFORE,     // قبل بيوم
}
```

### جدولة التذكيرات

```typescript
// استخدام Bull Queue للتذكيرات
@Processor('reminders')
export class ReminderProcessor {
  @Process('send-reminder')
  async handleReminder(job: Job<ReminderData>) {
    // إرسال الإشعار
    await this.notificationsService.send({
      userId: job.data.userId,
      title: 'تذكير بمهمة',
      body: job.data.todoTitle,
      type: 'TODO_REMINDER',
    });
  }
}
```

---

## 🔗 التكامل مع الأحداث

### ربط مهمة بحدث

```typescript
// عند إنشاء مهمة مرتبطة بحدث
const todo = await this.todosService.create({
  title: 'تجهيز العرض التقديمي',
  eventId: 'event-uuid',
  dueDate: event.startDate,
});
```

### العرض في صفحة الحدث

```typescript
// جلب المهام المرتبطة بحدث
const eventTodos = await this.todosService.findByEventId(eventId);
```

---

## 📱 دعم الجوال (مستقبلي)

- تصميم متجاوب (Responsive)
- إيماءات السحب (Swipe to complete/delete)
- إشعارات Push
- وضع Offline

---

## 🧪 الاختبارات

### Unit Tests

```typescript
describe('TodosService', () => {
  it('should create a todo', async () => {
    const todo = await service.create(userId, createTodoDto);
    expect(todo.title).toBe(createTodoDto.title);
  });

  it('should toggle todo completion', async () => {
    const todo = await service.toggle(todoId);
    expect(todo.status).toBe(TodoStatus.COMPLETED);
  });
});
```

### E2E Tests

```typescript
describe('Todos API', () => {
  it('GET /api/todos should return user todos', () => {
    return request(app.getHttpServer())
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

---

## 📈 الإحصائيات والتقارير

### البيانات المتاحة

- عدد المهام المكتملة (يومي/أسبوعي/شهري)
- معدل الإنجاز
- المهام المتأخرة
- التوزيع حسب الأولوية
- أكثر القوائم نشاطاً

### API الإحصائيات

```
GET /api/todos/stats
GET /api/todos/stats/weekly
GET /api/todos/stats/monthly
```

---

## 🚀 خطوات التنفيذ

| # | المهمة | الحالة | الوقت المقدر |
|---|--------|--------|--------------|
| 1 | تحديث Prisma Schema | ⏳ قيد الانتظار | 15 دقيقة |
| 2 | تشغيل Migration | ⏳ قيد الانتظار | 5 دقائق |
| 3 | إنشاء DTOs | ⏳ قيد الانتظار | 20 دقيقة |
| 4 | إنشاء Todos Service | ⏳ قيد الانتظار | 45 دقيقة |
| 5 | إنشاء Todos Controller | ⏳ قيد الانتظار | 30 دقيقة |
| 6 | إنشاء Todo Lists Service/Controller | ⏳ قيد الانتظار | 30 دقيقة |
| 7 | إنشاء Module وربط بـ AppModule | ⏳ قيد الانتظار | 10 دقائق |
| 8 | اختبار APIs | ⏳ قيد الانتظار | 20 دقيقة |

**الوقت الإجمالي المقدر: ~3 ساعات**

---

## 📚 المراجع

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Apple Reminders Design](https://support.apple.com/guide/reminders)
- [Todoist API](https://developer.todoist.com/guides)

---

## ✅ جاهزية التنفيذ

للبدء في التنفيذ، قم بتشغيل:

```bash
# 1. تحديث Schema
npx prisma db push

# 2. توليد Client
npx prisma generate

# 3. تشغيل الـ API
npm run dev:api
```

---

**آخر تحديث:** ديسمبر 2025
