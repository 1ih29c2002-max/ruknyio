# المرحلة الرابعة: إدارة الفعاليات والأحداث
# Phase 4: Events Management

## نظرة عامة | Overview
هذه المرحلة تركز على بناء نظام إدارة الفعاليات والأحداث، التسجيل، والإشعارات.

**المدة المتوقعة:** 2-3 أسابيع  
**الأولوية:** متوسطة  
**الحالة:** 🔵 في الانتظار (بعد المرحلة 3)

---

## الأهداف الرئيسية | Main Objectives

### 1. إدارة الفعاليات
- ✅ إنشاء فعاليات جديدة
- ✅ تحديد التاريخ والمكان
- ✅ تحديد عدد الحضور المسموح
- ✅ تسعير الفعاليات (مجانية/مدفوعة)
- ✅ حالات الفعالية (مجدولة/جارية/منتهية/ملغاة)

### 2. التسجيل والحضور
- ✅ نظام تسجيل الحضور
- ✅ إدارة قائمة الحضور
- ✅ تأكيد الحضور
- ✅ إلغاء التسجيل

### 3. واجهات الفعاليات
- ✅ صفحة عرض الفعاليات
- ✅ تقويم الفعاليات
- ✅ صفحة تفاصيل الفعالية
- ✅ نظام البحث والفلترة

### 4. الإشعارات
- ✅ إشعارات التسجيل
- ✅ تذكيرات الفعاليات
- ✅ إشعارات التحديثات
- ✅ إشعارات الإلغاء

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 4.1: Backend - Events Module

#### 1. Event DTOs

**apps/api/src/events/dto/create-event.dto.ts:**
```typescript
import { IsString, IsOptional, IsDate, IsNumber, IsInt, IsBoolean, Min, Max, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2025' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'tech-conference-2025' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(200)
  slug: string;

  @ApiPropertyOptional({ example: 'Annual technology conference featuring latest trends' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: '2025-12-15T09:00:00Z' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2025-12-15T17:00:00Z' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({ example: 'Tech Hub Downtown' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  venue?: string;

  @ApiPropertyOptional({ example: '123 Tech Street, San Francisco, CA' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxAttendees?: number;

  @ApiPropertyOptional({ example: 49.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ example: 'CONFERENCE', enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @ApiPropertyOptional({ example: 'https://meet.google.com/xxx-yyyy-zzz' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meetingUrl?: string;

  @ApiPropertyOptional({ example: 'Laptop required, basic programming knowledge' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  requirements?: string;

  @ApiPropertyOptional({ example: ['javascript', 'react', 'programming'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'ar' })
  @IsString()
  @IsOptional()
  @MaxLength(5)
  language?: string;
}
```

#### 2. Events Service

**apps/api/src/events/events.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createEventDto: CreateEventDto) {
    // Validate dates
    if (createEventDto.endDate <= createEventDto.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check slug uniqueness
    const existingEvent = await this.prisma.event.findUnique({
      where: { slug: createEventDto.slug },
    });

    if (existingEvent) {
      throw new ConflictException('Event slug already taken');
    }

    return this.prisma.event.create({
      data: {
        ...createEventDto,
        userId,
        status: EventStatus.SCHEDULED,
      },
    });
  }

  async findAll(filters?: {
    status?: EventStatus;
    type?: EventType;
    categoryId?: string;
    upcoming?: boolean;
    featured?: boolean;
    isOnline?: boolean;
    language?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { 
      status, 
      type, 
      categoryId, 
      upcoming, 
      featured, 
      isOnline, 
      language, 
      tags, 
      search, 
      page = 1, 
      limit = 20 
    } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (upcoming) {
      where.startDate = { gte: new Date() };
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (isOnline !== undefined) {
      where.isOnline = isOnline;
    }

    if (language) {
      where.language = language;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              icon: true,
              color: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByUser(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, eventId: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this event');
    }

    // Validate dates if provided
    const startDate = updateEventDto.startDate || event.startDate;
    const endDate = updateEventDto.endDate || event.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: updateEventDto,
    });
  }

  async updateStatus(userId: string, eventId: string, status: EventStatus) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this event');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { status },
    });
  }

  async delete(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this event');
    }

    return this.prisma.event.delete({
      where: { id: eventId },
    });
  }

  async getUpcoming(limit = 10) {
    return this.prisma.event.findMany({
      where: {
        startDate: { gte: new Date() },
        status: EventStatus.SCHEDULED,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }
}
```

#### 3. Event Categories Service

**apps/api/src/events/categories.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'التقنية' })
  @IsString()
  @MaxLength(100)
  nameAr: string;

  @ApiPropertyOptional({ example: 'Technology related events' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'فعاليات متعلقة بالتقنية' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descriptionAr?: string;

  @ApiPropertyOptional({ example: 'fas fa-laptop' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i)
  color?: string;
}

@Injectable()
export class EventCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category name already exists
    const existingCategory = await this.prisma.eventCategory.findFirst({
      where: {
        OR: [
          { name: createCategoryDto.name },
          { nameAr: createCategoryDto.nameAr },
        ],
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    return this.prisma.eventCategory.create({
      data: createCategoryDto,
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.eventCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            events: {
              where: {
                status: 'SCHEDULED',
                startDate: { gte: new Date() },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: Partial<CreateCategoryDto>) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.eventCategory.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async toggleStatus(id: string) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.eventCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
  }

  async delete(id: string) {
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.events > 0) {
      throw new ConflictException('Cannot delete category with existing events');
    }

    return this.prisma.eventCategory.delete({
      where: { id },
    });
  }

  async getEventTypeTranslations() {
    return {
      CONFERENCE: { en: 'Conference', ar: 'مؤتمر' },
      WORKSHOP: { en: 'Workshop', ar: 'ورشة عمل' },
      SEMINAR: { en: 'Seminar', ar: 'ندوة' },
      TRAINING: { en: 'Training', ar: 'دورة تدريبية' },
      MEETUP: { en: 'Meetup', ar: 'لقاء' },
      WEBINAR: { en: 'Webinar', ar: 'ندوة عبر الإنترنت' },
      EXHIBITION: { en: 'Exhibition', ar: 'معرض' },
      NETWORKING: { en: 'Networking', ar: 'تواصل مهني' },
      COMPETITION: { en: 'Competition', ar: 'مسابقة' },
      SOCIAL: { en: 'Social Event', ar: 'فعالية اجتماعية' },
      CULTURAL: { en: 'Cultural Event', ar: 'فعالية ثقافية' },
      SPORTS: { en: 'Sports', ar: 'رياضية' },
      EDUCATIONAL: { en: 'Educational', ar: 'تعليمية' },
      BUSINESS: { en: 'Business', ar: 'أعمال' },
      TECHNOLOGY: { en: 'Technology', ar: 'تقنية' },
      HEALTH: { en: 'Health', ar: 'صحية' },
      ART: { en: 'Art', ar: 'فنية' },
      MUSIC: { en: 'Music', ar: 'موسيقية' },
      OTHER: { en: 'Other', ar: 'أخرى' },
    };
  }
}
```

#### 4. Event Reviews Service

**apps/api/src/events/reviews.service.ts:**
```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great event! Learned a lot.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

@Injectable()
export class EventReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, eventId: string, createReviewDto: CreateReviewDto) {
    // التحقق من وجود الفعالية
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // التحقق من أن الفعالية انتهت
    if (event.endDate > new Date()) {
      throw new BadRequestException('Cannot review ongoing events');
    }

    // التحقق من أن المستخدم حضر الفعالية
    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (!registration || registration.status !== 'ATTENDED') {
      throw new ForbiddenException('Only attendees can review events');
    }

    // التحقق من عدم وجود تقييم سابق
    const existingReview = await this.prisma.eventReview.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this event');
    }

    // إنشاء التقييم
    const review = await this.prisma.eventReview.create({
      data: {
        eventId,
        userId,
        ...createReviewDto,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // تحديث متوسط التقييم للفعالية
    await this.updateEventRatingStats(eventId);

    return review;
  }

  async getEventReviews(eventId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.eventReview.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.eventReview.count({ where: { eventId } }),
    ]);

    return {
      reviews: reviews.map(review => ({
        ...review,
        user: review.isAnonymous ? { id: 'anonymous', name: 'مجهول' } : review.user,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateEventRatingStats(eventId: string) {
    const stats = await this.prisma.eventReview.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        averageRating: stats._avg.rating,
        totalRatings: stats._count,
      },
    });
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: Partial<CreateReviewDto>) {
    const review = await this.prisma.eventReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this review');
    }

    const updatedReview = await this.prisma.eventReview.update({
      where: { id: reviewId },
      data: updateReviewDto,
    });

    // إعادة حساب متوسط التقييم
    await this.updateEventRatingStats(review.eventId);

    return updatedReview;
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.eventReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this review');
    }

    await this.prisma.eventReview.delete({
      where: { id: reviewId },
    });

    // إعادة حساب متوسط التقييم
    await this.updateEventRatingStats(review.eventId);
  }
}
```

#### 5. Event Waitlist Service

**apps/api/src/events/waitlist.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventWaitlistService {
  constructor(private prisma: PrismaService) {}

  async joinWaitlist(userId: string, eventId: string) {
    // التحقق من وجود الفعالية
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: { where: { status: 'REGISTERED' } },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // التحقق من أن الفعالية ممتلئة
    if (!event.maxAttendees || event._count.registrations < event.maxAttendees) {
      throw new BadRequestException('Event is not full, you can register directly');
    }

    // التحقق من عدم التسجيل المسبق
    const existingRegistration = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingRegistration) {
      throw new ConflictException('Already registered for this event');
    }

    // التحقق من عدم وجود في قائمة الانتظار
    const existingWaitlist = await this.prisma.eventWaitlist.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingWaitlist) {
      throw new ConflictException('Already in waitlist for this event');
    }

    // الحصول على الموضع التالي في القائمة
    const lastPosition = await this.prisma.eventWaitlist.findFirst({
      where: { eventId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = (lastPosition?.position || 0) + 1;

    return this.prisma.eventWaitlist.create({
      data: {
        eventId,
        userId,
        position,
      },
      include: {
        event: {
          select: { title: true },
        },
      },
    });
  }

  async leaveWaitlist(userId: string, eventId: string) {
    const waitlistEntry = await this.prisma.eventWaitlist.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!waitlistEntry) {
      throw new NotFoundException('Not found in waitlist');
    }

    // حذف من قائمة الانتظار
    await this.prisma.eventWaitlist.delete({
      where: { id: waitlistEntry.id },
    });

    // إعادة ترتيب المواضع
    await this.reorderWaitlist(eventId, waitlistEntry.position);
  }

  async processWaitlistWhenSpotAvailable(eventId: string) {
    // العثور على أول شخص في قائمة الانتظار
    const nextInLine = await this.prisma.eventWaitlist.findFirst({
      where: { eventId, isNotified: false },
      orderBy: { position: 'asc' },
      include: {
        user: true,
        event: true,
      },
    });

    if (!nextInLine) {
      return null;
    }

    // تسجيله تلقائياً
    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId: nextInLine.userId,
        status: 'REGISTERED',
      },
    });

    // إزالته من قائمة الانتظار
    await this.prisma.eventWaitlist.delete({
      where: { id: nextInLine.id },
    });

    // إعادة ترتيب القائمة
    await this.reorderWaitlist(eventId, nextInLine.position);

    // إرسال إشعار (يمكن إضافة خدمة الإشعارات هنا)
    // await this.notificationService.sendWaitlistNotification(nextInLine);

    return { registration, notifiedUser: nextInLine.user };
  }

  async getEventWaitlist(eventId: string) {
    return this.prisma.eventWaitlist.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async getUserWaitlistPosition(userId: string, eventId: string) {
    const waitlistEntry = await this.prisma.eventWaitlist.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!waitlistEntry) {
      return null;
    }

    const countAhead = await this.prisma.eventWaitlist.count({
      where: {
        eventId,
        position: { lt: waitlistEntry.position },
      },
    });

    return {
      position: waitlistEntry.position,
      peopleAhead: countAhead,
      estimatedWaitTime: this.calculateEstimatedWaitTime(countAhead),
    };
  }

  private async reorderWaitlist(eventId: string, deletedPosition: number) {
    // تحديث مواضع كل من هم بعد الموضع المحذوف
    await this.prisma.eventWaitlist.updateMany({
      where: {
        eventId,
        position: { gt: deletedPosition },
      },
      data: {
        position: { decrement: 1 },
      },
    });
  }

  private calculateEstimatedWaitTime(peopleAhead: number): string {
    // تقدير بسيط: شخص واحد كل يومين (يمكن تحسينه بناءً على البيانات التاريخية)
    const estimatedDays = peopleAhead * 2;
    
    if (estimatedDays === 0) return 'قريباً جداً';
    if (estimatedDays === 1) return 'خلال يوم واحد';
    if (estimatedDays <= 7) return `خلال ${estimatedDays} أيام`;
    if (estimatedDays <= 30) return `خلال ${Math.ceil(estimatedDays / 7)} أسابيع`;
    
    return `خلال ${Math.ceil(estimatedDays / 30)} أشهر`;
  }
}
```

#### 6. Calendar Integration Service

**apps/api/src/events/calendar-integration.service.ts:**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';

@Injectable()
export class CalendarIntegrationService {
  constructor(private prisma: PrismaService) {}

  async addToGoogleCalendar(userId: string, eventId: string, accessToken: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { user: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const calendarEvent = {
        summary: event.title,
        description: this.formatEventDescription(event),
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: event.timezone || 'Asia/Riyadh',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: event.timezone || 'Asia/Riyadh',
        },
        location: event.isOnline ? event.meetingUrl : `${event.venue}, ${event.location}`,
        attendees: [{ email: 'user@example.com' }], // يمكن تحديد المدعوين
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // يوم واحد قبل
            { method: 'popup', minutes: 10 }, // 10 دقائق قبل
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      });

      // حفظ معرف الحدث في قاعدة البيانات
      await this.prisma.calendarIntegration.create({
        data: {
          userId,
          eventId,
          provider: 'GOOGLE',
          externalId: response.data.id!,
          syncStatus: 'SYNCED',
          lastSynced: new Date(),
        },
      });

      return response.data;
    } catch (error) {
      await this.prisma.calendarIntegration.create({
        data: {
          userId,
          eventId,
          provider: 'GOOGLE',
          syncStatus: 'FAILED',
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  async addToOutlookCalendar(userId: string, eventId: string, accessToken: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      const graphClient = Client.init({
        authProvider: {
          getAccessToken: async () => accessToken,
        },
      });

      const outlookEvent = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: this.formatEventDescription(event, 'html'),
        },
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: event.timezone || 'Asia/Riyadh',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: event.timezone || 'Asia/Riyadh',
        },
        location: {
          displayName: event.isOnline ? 'Online Event' : event.venue,
          address: event.isOnline 
            ? { street: event.meetingUrl }
            : { street: event.location },
        },
        isReminderOn: true,
        reminderMinutesBeforeStart: 15,
      };

      const response = await graphClient.api('/me/events').post(outlookEvent);

      await this.prisma.calendarIntegration.create({
        data: {
          userId,
          eventId,
          provider: 'OUTLOOK',
          externalId: response.id,
          syncStatus: 'SYNCED',
          lastSynced: new Date(),
        },
      });

      return response;
    } catch (error) {
      await this.prisma.calendarIntegration.create({
        data: {
          userId,
          eventId,
          provider: 'OUTLOOK',
          syncStatus: 'FAILED',
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  async generateICSFile(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rukny.io//Event Management//EN
BEGIN:VEVENT
UID:${event.id}@rukny.io
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${this.formatEventDescription(event).replace(/\n/g, '\\n')}
LOCATION:${event.isOnline ? event.meetingUrl : `${event.venue}, ${event.location}`}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }

  private formatEventDescription(event: any, format: 'text' | 'html' = 'text'): string {
    const isHtml = format === 'html';
    const br = isHtml ? '<br>' : '\n';
    const bold = (text: string) => isHtml ? `<strong>${text}</strong>` : text;

    let description = `${bold('الوصف:')} ${event.description || 'لا يوجد وصف'}${br}${br}`;
    
    if (event.requirements) {
      description += `${bold('المتطلبات:')} ${event.requirements}${br}${br}`;
    }
    
    if (event.isOnline && event.meetingUrl) {
      description += `${bold('رابط الاجتماع:')} ${event.meetingUrl}${br}`;
      if (event.meetingPassword) {
        description += `${bold('كلمة المرور:')} ${event.meetingPassword}${br}`;
      }
      description += br;
    }
    
    description += `${bold('المنظم:')} ${event.user?.name || 'غير محدد'}${br}`;
    description += `${bold('نوع الفعالية:')} ${event.type}${br}`;
    
    if (event.tags && event.tags.length > 0) {
      description += `${bold('العلامات:')} ${event.tags.join(', ')}`;
    }

    return description;
  }

  async removeFromCalendar(userId: string, eventId: string, provider: 'GOOGLE' | 'OUTLOOK') {
    const integration = await this.prisma.calendarIntegration.findUnique({
      where: {
        eventId_userId_provider: { eventId, userId, provider },
      },
    });

    if (!integration || !integration.externalId) {
      return;
    }

    try {
      // منطق حذف الحدث من التقويم الخارجي
      // يتطلب access token صالح

      await this.prisma.calendarIntegration.update({
        where: { id: integration.id },
        data: { syncStatus: 'CANCELLED' },
      });
    } catch (error) {
      await this.prisma.calendarIntegration.update({
        where: { id: integration.id },
        data: { 
          syncStatus: 'FAILED',
          errorMessage: error.message,
        },
      });
    }
  }
}
```

#### 7. Event Tickets Service

**apps/api/src/events/tickets.service.ts:**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class EventTicketsService {
  constructor(private prisma: PrismaService) {}

  async generateTicket(registrationId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // توليد كود التذكرة الفريد
    const ticketCode = this.generateTicketCode();
    
    // إنشاء بيانات QR Code
    const qrData = JSON.stringify({
      ticketId: `TKT-${Date.now()}`,
      eventId: registration.eventId,
      userId: registration.userId,
      registrationId: registration.id,
      ticketCode,
      timestamp: Date.now(),
    });

    // توليد صورة QR Code
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });

    // حفظ التذكرة في قاعدة البيانات
    const ticket = await this.prisma.eventTicket.create({
      data: {
        registrationId,
        ticketCode,
        qrCode: qrData,
        qrCodeImage,
      },
    });

    return {
      ...ticket,
      registration: {
        event: registration.event,
        user: {
          name: registration.user.name,
          email: registration.user.email,
        },
      },
    };
  }

  async validateTicket(ticketCode: string, eventId: string) {
    const ticket = await this.prisma.eventTicket.findUnique({
      where: { ticketCode },
      include: {
        registration: {
          include: {
            event: true,
            user: true,
          },
        },
      },
    });

    if (!ticket) {
      return { valid: false, message: 'تذكرة غير صالحة' };
    }

    if (ticket.registration.eventId !== eventId) {
      return { valid: false, message: 'التذكرة لا تخص هذه الفعالية' };
    }

    if (ticket.isUsed) {
      return { 
        valid: false, 
        message: `تم استخدام التذكرة مسبقاً في ${ticket.usedAt?.toLocaleString('ar-SA')}` 
      };
    }

    const event = ticket.registration.event;
    const now = new Date();

    // التحقق من توقيت الفعالية
    if (now < new Date(event.startDate.getTime() - 30 * 60 * 1000)) { // 30 دقيقة قبل البداية
      return { 
        valid: false, 
        message: 'لم يحن موعد تسجيل الدخول بعد' 
      };
    }

    if (now > new Date(event.endDate.getTime() + 60 * 60 * 1000)) { // ساعة بعد النهاية
      return { 
        valid: false, 
        message: 'انتهت فترة تسجيل الدخول للفعالية' 
      };
    }

    return {
      valid: true,
      ticket,
      attendee: {
        name: ticket.registration.user.name,
        email: ticket.registration.user.email,
        registrationDate: ticket.registration.createdAt,
      },
      event: {
        title: event.title,
        startDate: event.startDate,
        venue: event.venue,
      },
    };
  }

  async checkInAttendee(ticketCode: string, eventId: string, checkInMethod = 'QR_SCAN') {
    const validation = await this.validateTicket(ticketCode, eventId);

    if (!validation.valid) {
      return validation;
    }

    const ticket = validation.ticket!;
    const now = new Date();

    // تحديث التذكرة كمستخدمة
    await this.prisma.eventTicket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        usedAt: now,
        scanCount: { increment: 1 },
        lastScannedAt: now,
      },
    });

    // تحديث حالة التسجيل
    await this.prisma.eventRegistration.update({
      where: { id: ticket.registrationId },
      data: {
        status: 'ATTENDED',
        attendedAt: now,
        checkInMethod,
      },
    });

    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      attendee: validation.attendee,
      checkInTime: now,
    };
  }

  async getEventTickets(eventId: string) {
    return this.prisma.eventTicket.findMany({
      where: {
        registration: { eventId },
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketStats(eventId: string) {
    const stats = await this.prisma.eventTicket.groupBy({
      by: ['isUsed'],
      where: {
        registration: { eventId },
      },
      _count: { id: true },
    });

    const totalTickets = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const usedTickets = stats.find(stat => stat.isUsed)?._count.id || 0;
    const unusedTickets = totalTickets - usedTickets;

    return {
      totalTickets,
      usedTickets,
      unusedTickets,
      checkInRate: totalTickets > 0 ? (usedTickets / totalTickets) * 100 : 0,
    };
  }

  private generateTicketCode(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(6).toString('hex').toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  async resendTicket(registrationId: string) {
    const ticket = await this.prisma.eventTicket.findUnique({
      where: { registrationId },
      include: {
        registration: {
          include: {
            event: true,
            user: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // إرسال التذكرة عبر البريد الإلكتروني
    // await this.emailService.sendTicket(ticket);

    return { success: true, message: 'تم إرسال التذكرة بنجاح' };
  }
}
```

---

## 🛠️ Routes & APIs Documentation | توثيق المسارات والـ APIs

### **Backend Routes Structure**

#### 1. Events Controller Routes

**apps/api/src/events/events.controller.ts:**
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // GET /api/events - عرض جميع الفعاليات مع الفلاتر
  @Get()
  @ApiOperation({ summary: 'Get all events with filters' })
  async getAllEvents(@Query() filters: any) {
    return this.eventsService.findAll(filters);
  }

  // GET /api/events/upcoming - الفعاليات القادمة
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  async getUpcomingEvents(@Query('limit') limit?: number) {
    return this.eventsService.getUpcoming(limit);
  }

  // GET /api/events/featured - الفعاليات المميزة
  @Get('featured')
  @ApiOperation({ summary: 'Get featured events' })
  async getFeaturedEvents() {
    return this.eventsService.findAll({ featured: true });
  }

  // GET /api/events/categories - فئات الفعاليات
  @Get('categories')
  @ApiOperation({ summary: 'Get event categories' })
  async getCategories() {
    return this.categoriesService.findAll();
  }

  // GET /api/events/types - أنواع الفعاليات مع الترجمة
  @Get('types')
  @ApiOperation({ summary: 'Get event types with translations' })
  async getEventTypes() {
    return this.categoriesService.getEventTypeTranslations();
  }

  // GET /api/events/:slug - تفاصيل فعالية بالـ slug
  @Get(':slug')
  @ApiOperation({ summary: 'Get event details by slug' })
  async getEventBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  // POST /api/events - إنشاء فعالية جديدة
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new event' })
  async createEvent(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(req.user.id, createEventDto);
  }

  // PUT /api/events/:id - تحديث فعالية
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req
  ) {
    return this.eventsService.update(req.user.id, id, updateEventDto);
  }

  // DELETE /api/events/:id - حذف فعالية
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  async deleteEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.delete(req.user.id, id);
  }

  // GET /api/events/user/my-events - فعاليات المستخدم
  @Get('user/my-events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user events' })
  async getMyEvents(@Request() req) {
    return this.eventsService.findByUser(req.user.id);
  }
}
```

#### 2. Event Registrations Routes

**apps/api/src/events/registrations.controller.ts:**
```typescript
@ApiTags('Event Registrations')
@Controller('events/:eventId/registrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistrationsController {
  constructor(private registrationsService: EventRegistrationsService) {}

  // POST /api/events/:eventId/registrations - التسجيل في فعالية
  @Post()
  @ApiOperation({ summary: 'Register for event' })
  async registerForEvent(@Param('eventId') eventId: string, @Request() req) {
    return this.registrationsService.register(req.user.id, eventId);
  }

  // DELETE /api/events/:eventId/registrations/:registrationId - إلغاء التسجيل
  @Delete(':registrationId')
  @ApiOperation({ summary: 'Cancel registration' })
  async cancelRegistration(
    @Param('registrationId') registrationId: string,
    @Request() req
  ) {
    return this.registrationsService.cancel(req.user.id, registrationId);
  }

  // GET /api/events/:eventId/registrations - قائمة المسجلين (للمنظم فقط)
  @Get()
  @ApiOperation({ summary: 'Get event attendees (organizer only)' })
  async getEventAttendees(@Param('eventId') eventId: string) {
    return this.registrationsService.getEventAttendees(eventId);
  }

  // PUT /api/events/:eventId/registrations/:registrationId/attended - تسجيل الحضور
  @Put(':registrationId/attended')
  @ApiOperation({ summary: 'Mark as attended' })
  async markAsAttended(
    @Param('registrationId') registrationId: string,
    @Request() req
  ) {
    return this.registrationsService.markAsAttended(req.user.id, registrationId);
  }
}
```

#### 3. Event Reviews Routes

**apps/api/src/events/reviews.controller.ts:**
```typescript
@ApiTags('Event Reviews')
@Controller('events/:eventId/reviews')
export class ReviewsController {
  constructor(private reviewsService: EventReviewsService) {}

  // GET /api/events/:eventId/reviews - عرض تقييمات الفعالية
  @Get()
  @ApiOperation({ summary: 'Get event reviews' })
  async getEventReviews(
    @Param('eventId') eventId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.reviewsService.getEventReviews(eventId, page, limit);
  }

  // POST /api/events/:eventId/reviews - إضافة تقييم
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add review' })
  async addReview(
    @Param('eventId') eventId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req
  ) {
    return this.reviewsService.createReview(req.user.id, eventId, createReviewDto);
  }

  // PUT /api/events/:eventId/reviews/:reviewId - تحديث تقييم
  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: Partial<CreateReviewDto>,
    @Request() req
  ) {
    return this.reviewsService.updateReview(req.user.id, reviewId, updateReviewDto);
  }

  // DELETE /api/events/:eventId/reviews/:reviewId - حذف تقييم
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review' })
  async deleteReview(@Param('reviewId') reviewId: string, @Request() req) {
    return this.reviewsService.deleteReview(req.user.id, reviewId);
  }
}
```

#### 4. Event Waitlist Routes

**apps/api/src/events/waitlist.controller.ts:**
```typescript
@ApiTags('Event Waitlist')
@Controller('events/:eventId/waitlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WaitlistController {
  constructor(private waitlistService: EventWaitlistService) {}

  // POST /api/events/:eventId/waitlist - الانضمام لقائمة الانتظار
  @Post()
  @ApiOperation({ summary: 'Join waitlist' })
  async joinWaitlist(@Param('eventId') eventId: string, @Request() req) {
    return this.waitlistService.joinWaitlist(req.user.id, eventId);
  }

  // DELETE /api/events/:eventId/waitlist - مغادرة قائمة الانتظار
  @Delete()
  @ApiOperation({ summary: 'Leave waitlist' })
  async leaveWaitlist(@Param('eventId') eventId: string, @Request() req) {
    return this.waitlistService.leaveWaitlist(req.user.id, eventId);
  }

  // GET /api/events/:eventId/waitlist/status - حالة المستخدم في قائمة الانتظار
  @Get('status')
  @ApiOperation({ summary: 'Get user waitlist position' })
  async getWaitlistStatus(@Param('eventId') eventId: string, @Request() req) {
    return this.waitlistService.getUserWaitlistPosition(req.user.id, eventId);
  }

  // GET /api/events/:eventId/waitlist - قائمة المنتظرين (للمنظم فقط)
  @Get()
  @ApiOperation({ summary: 'Get event waitlist (organizer only)' })
  async getEventWaitlist(@Param('eventId') eventId: string) {
    return this.waitlistService.getEventWaitlist(eventId);
  }
}
```

#### 5. Event Tickets Routes

**apps/api/src/events/tickets.controller.ts:**
```typescript
@ApiTags('Event Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: EventTicketsService) {}

  // GET /api/tickets/:registrationId - الحصول على التذكرة
  @Get(':registrationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket' })
  async getTicket(@Param('registrationId') registrationId: string) {
    return this.ticketsService.generateTicket(registrationId);
  }

  // POST /api/tickets/:ticketId/resend - إعادة إرسال التذكرة
  @Post(':ticketId/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend ticket' })
  async resendTicket(@Param('ticketId') ticketId: string) {
    return this.ticketsService.resendTicket(ticketId);
  }

  // POST /api/events/:eventId/checkin - تسجيل الدخول بالتذكرة
  @Post('events/:eventId/checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in with ticket' })
  async checkIn(
    @Param('eventId') eventId: string,
    @Body() checkInDto: { ticketCode: string; method: string }
  ) {
    return this.ticketsService.checkInAttendee(
      checkInDto.ticketCode,
      eventId,
      checkInDto.method
    );
  }

  // GET /api/events/:eventId/tickets - تذاكر الفعالية (للمنظم فقط)
  @Get('events/:eventId/tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event tickets (organizer only)' })
  async getEventTickets(@Param('eventId') eventId: string) {
    return this.ticketsService.getEventTickets(eventId);
  }

  // GET /api/events/:eventId/tickets/stats - إحصائيات التذاكر
  @Get('events/:eventId/tickets/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket statistics' })
  async getTicketStats(@Param('eventId') eventId: string) {
    return this.ticketsService.getTicketStats(eventId);
  }
}
```

#### 6. Calendar Integration Routes

**apps/api/src/events/calendar.controller.ts:**
```typescript
@ApiTags('Calendar Integration')
@Controller('events/:eventId/calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private calendarService: CalendarIntegrationService) {}

  // POST /api/events/:eventId/calendar/google - إضافة للـ Google Calendar
  @Post('google')
  @ApiOperation({ summary: 'Add to Google Calendar' })
  async addToGoogleCalendar(
    @Param('eventId') eventId: string,
    @Body() body: { accessToken: string },
    @Request() req
  ) {
    return this.calendarService.addToGoogleCalendar(
      req.user.id,
      eventId,
      body.accessToken
    );
  }

  // POST /api/events/:eventId/calendar/outlook - إضافة للـ Outlook
  @Post('outlook')
  @ApiOperation({ summary: 'Add to Outlook Calendar' })
  async addToOutlookCalendar(
    @Param('eventId') eventId: string,
    @Body() body: { accessToken: string },
    @Request() req
  ) {
    return this.calendarService.addToOutlookCalendar(
      req.user.id,
      eventId,
      body.accessToken
    );
  }

  // GET /api/events/:eventId/calendar/ics - تحميل ملف ICS
  @Get('ics')
  @ApiOperation({ summary: 'Download ICS file' })
  async downloadICS(@Param('eventId') eventId: string, @Res() res) {
    const icsContent = await this.calendarService.generateICSFile(eventId);
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="event.ics"');
    res.send(icsContent);
  }

  // DELETE /api/events/:eventId/calendar/:provider - إزالة من التقويم
  @Delete(':provider')
  @ApiOperation({ summary: 'Remove from calendar' })
  async removeFromCalendar(
    @Param('eventId') eventId: string,
    @Param('provider') provider: 'GOOGLE' | 'OUTLOOK',
    @Request() req
  ) {
    return this.calendarService.removeFromCalendar(req.user.id, eventId, provider);
  }
}
```

---

### **Frontend API Calls Structure**

#### Frontend API Service

**apps/web/src/lib/api/events.ts:**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Events API calls
export const eventsApi = {
  // الحصول على الفعاليات مع الفلاتر
  getEvents: async (filters?: {
    type?: EventType;
    categoryId?: string;
    upcoming?: boolean;
    featured?: boolean;
    isOnline?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    const response = await fetch(`${API_BASE}/events?${params}`);
    return response.json();
  },

  // الحصول على فعالية بالـ slug
  getEventBySlug: async (slug: string) => {
    const response = await fetch(`${API_BASE}/events/${slug}`);
    return response.json();
  },

  // إنشاء فعالية جديدة
  createEvent: async (eventData: CreateEventDto) => {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(eventData),
    });
    return response.json();
  },

  // التسجيل في فعالية
  registerForEvent: async (eventId: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/registrations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
    return response.json();
  },

  // إلغاء التسجيل
  cancelRegistration: async (eventId: string, registrationId: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/registrations/${registrationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
    return response.json();
  },

  // الانضمام لقائمة الانتظار
  joinWaitlist: async (eventId: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/waitlist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
    return response.json();
  },

  // إضافة تقييم
  addReview: async (eventId: string, reviewData: CreateReviewDto) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(reviewData),
    });
    return response.json();
  },

  // الحصول على التذكرة
  getTicket: async (registrationId: string) => {
    const response = await fetch(`${API_BASE}/tickets/${registrationId}`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });
    return response.json();
  },

  // تسجيل الدخول بالتذكرة
  checkInWithTicket: async (eventId: string, ticketCode: string, method: string) => {
    const response = await fetch(`${API_BASE}/tickets/events/${eventId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ ticketCode, method }),
    });
    return response.json();
  },

  // إضافة للتقويم
  addToGoogleCalendar: async (eventId: string, accessToken: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/calendar/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ accessToken }),
    });
    return response.json();
  },

  // تحميل ملف ICS
  downloadICSFile: async (eventId: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/calendar/ics`);
    return response.blob();
  },
};

// Categories API calls
export const categoriesApi = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE}/events/categories`);
    return response.json();
  },

  getEventTypes: async () => {
    const response = await fetch(`${API_BASE}/events/types`);
    return response.json();
  },
};
```

---

### **Frontend Routes Structure**

#### Next.js App Router Structure

```
apps/web/src/app/
├── events/                          # الفعاليات العامة
│   ├── page.tsx                     # GET /events - صفحة جميع الفعاليات
│   ├── [slug]/
│   │   └── page.tsx                 # GET /events/[slug] - تفاصيل الفعالية
│   └── categories/
│       └── [categoryId]/
│           └── page.tsx             # GET /events/categories/[categoryId] - فعاليات الفئة
│
├── dashboard/                       # لوحة التحكم
│   └── events/
│       ├── page.tsx                 # GET /dashboard/events - فعاليات المستخدم
│       ├── create/
│       │   └── page.tsx             # GET /dashboard/events/create - إنشاء فعالية
│       ├── [id]/
│       │   ├── page.tsx             # GET /dashboard/events/[id] - تحرير الفعالية
│       │   ├── edit/
│       │   │   └── page.tsx         # GET /dashboard/events/[id]/edit - تحرير
│       │   ├── stats/
│       │   │   └── page.tsx         # GET /dashboard/events/[id]/stats - الإحصائيات
│       │   ├── attendees/
│       │   │   └── page.tsx         # GET /dashboard/events/[id]/attendees - الحضور
│       │   └── reviews/
│       │       └── page.tsx         # GET /dashboard/events/[id]/reviews - التقييمات
│       └── tickets/
│           └── [ticketId]/
│               └── page.tsx         # GET /dashboard/events/tickets/[ticketId] - التذكرة
│
├── my/                              # صفحات المستخدم الشخصية
│   ├── events/
│   │   ├── page.tsx                 # GET /my/events - فعالياتي المسجلة
│   │   ├── waitlist/
│   │   │   └── page.tsx             # GET /my/events/waitlist - قوائم الانتظار
│   │   └── reviews/
│   │       └── page.tsx             # GET /my/events/reviews - تقييماتي
│   └── tickets/
│       ├── page.tsx                 # GET /my/tickets - تذاكري
│       └── [ticketId]/
│           └── page.tsx             # GET /my/tickets/[ticketId] - تفاصيل التذكرة
│
└── api/                             # API Routes (if using Next.js API routes)
    └── events/
        ├── route.ts                 # GET, POST /api/events
        ├── [id]/
        │   └── route.ts             # GET, PUT, DELETE /api/events/[id]
        └── upload/
            └── route.ts             # POST /api/events/upload - رفع الصور
```

#### Frontend Route Handlers

**apps/web/src/lib/routes.ts:**
```typescript
// مسارات Frontend
export const ROUTES = {
  // الصفحات العامة
  EVENTS: '/events',
  EVENT_DETAILS: (slug: string) => `/events/${slug}`,
  EVENT_CATEGORY: (categoryId: string) => `/events/categories/${categoryId}`,
  
  // لوحة التحكم
  DASHBOARD_EVENTS: '/dashboard/events',
  CREATE_EVENT: '/dashboard/events/create',
  EDIT_EVENT: (id: string) => `/dashboard/events/${id}/edit`,
  EVENT_STATS: (id: string) => `/dashboard/events/${id}/stats`,
  EVENT_ATTENDEES: (id: string) => `/dashboard/events/${id}/attendees`,
  EVENT_REVIEWS: (id: string) => `/dashboard/events/${id}/reviews`,
  
  // الصفحات الشخصية
  MY_EVENTS: '/my/events',
  MY_WAITLIST: '/my/events/waitlist',
  MY_REVIEWS: '/my/events/reviews',
  MY_TICKETS: '/my/tickets',
  TICKET_DETAILS: (ticketId: string) => `/my/tickets/${ticketId}`,
  
  // المصادقة
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
} as const;

// مساعد للتنقل
export const navigate = {
  toEvent: (slug: string) => ROUTES.EVENT_DETAILS(slug),
  toEventStats: (id: string) => ROUTES.EVENT_STATS(id),
  toTicket: (ticketId: string) => ROUTES.TICKET_DETAILS(ticketId),
  // ... المزيد من المساعدين
};
```

---

### **API Response Formats**

#### Standard Response Format

```typescript
// استجابة ناجحة
{
  success: true,
  data: { /* البيانات المطلوبة */ },
  message?: string,
  pagination?: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}

// استجابة خطأ
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  statusCode: number
}
```

#### Events API Responses

```typescript
// GET /api/events
{
  success: true,
  data: {
    events: [
      {
        id: "uuid",
        title: "مؤتمر التقنية 2025",
        slug: "tech-conference-2025",
        description: "مؤتمر سنوي للتقنية...",
        startDate: "2025-12-15T09:00:00Z",
        endDate: "2025-12-15T17:00:00Z",
        venue: "مركز الرياض للمؤتمرات",
        location: "الرياض، المملكة العربية السعودية",
        maxAttendees: 500,
        price: 150.00,
        type: "CONFERENCE",
        isOnline: false,
        isFeatured: true,
        averageRating: 4.5,
        totalRatings: 23,
        user: {
          id: "uuid",
          name: "أحمد محمد"
        },
        category: {
          id: "uuid",
          name: "Technology",
          nameAr: "التقنية",
          icon: "fas fa-laptop-code",
          color: "#3B82F6"
        },
        _count: {
          registrations: 234
        }
      }
    ]
  },
  pagination: {
    total: 150,
    page: 1,
    limit: 20,
    pages: 8
  }
}

// POST /api/events/:eventId/registrations
{
  success: true,
  data: {
    id: "uuid",
    eventId: "uuid",
    userId: "uuid",
    status: "REGISTERED",
    createdAt: "2025-11-01T10:00:00Z",
    event: {
      title: "مؤتمر التقنية 2025",
      startDate: "2025-12-15T09:00:00Z",
      venue: "مركز الرياض للمؤتمرات"
    }
  },
  message: "تم التسجيل بنجاح"
}

// GET /api/events/:eventId/reviews
{
  success: true,
  data: {
    reviews: [
      {
        id: "uuid",
        rating: 5,
        comment: "فعالية ممتازة، استفدت كثيراً",
        isAnonymous: false,
        createdAt: "2025-11-01T14:30:00Z",
        user: {
          id: "uuid",
          name: "سارة أحمد"
        }
      }
    ]
  },
  pagination: {
    total: 45,
    page: 1,
    limit: 20,
    pages: 3
  }
}
```

---

### **Authentication & Authorization**

#### Protected Routes

```typescript
// المسارات التي تحتاج مصادقة
const PROTECTED_ROUTES = [
  'POST /api/events',
  'PUT /api/events/:id',
  'DELETE /api/events/:id',
  'POST /api/events/:eventId/registrations',
  'POST /api/events/:eventId/reviews',
  'POST /api/events/:eventId/waitlist',
  'GET /api/tickets/:registrationId',
  // ... المزيد
];

// المسارات العامة (لا تحتاج مصادقة)
const PUBLIC_ROUTES = [
  'GET /api/events',
  'GET /api/events/:slug',
  'GET /api/events/categories',
  'GET /api/events/types',
  'GET /api/events/:eventId/reviews',
  // ... المزيد
];
```

#### JWT Token Structure

```typescript
// JWT Payload
{
  sub: "user-uuid",
  email: "user@example.com",
  name: "اسم المستخدم",
  role: "USER" | "ADMIN" | "ORGANIZER",
  iat: 1730462400,
  exp: 1730548800
}

// Headers في الطلبات
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

---

### **Practical Usage Examples | أمثلة عملية للاستخدام**

#### Frontend Implementation Examples

**1. عرض الفعاليات مع الفلاتر:**
```typescript
// في صفحة الفعاليات
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    type: undefined,
    categoryId: undefined,
    search: '',
    isOnline: undefined,
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventsApi.getEvents(filters);
        setEvents(response.data.events);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvents();
  }, [filters]);

  return (
    <div>
      {/* مكون الفلترة */}
      <EventTypeFilter 
        onFilterChange={setFilters} 
        currentFilters={filters}
      />
      
      {/* شبكة الفعاليات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
```

**2. التسجيل في فعالية:**
```typescript
// في صفحة تفاصيل الفعالية
const EventDetailsPage = ({ event }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const response = await eventsApi.registerForEvent(event.id);
      if (response.success) {
        setRegistrationStatus('registered');
        toast.success(response.message);
        
        // إنشاء التذكرة تلقائياً
        const ticket = await eventsApi.getTicket(response.data.id);
        // عرض التذكرة للمستخدم
      }
    } catch (error) {
      if (error.code === 'EVENT_FULL') {
        // عرض خيار قائمة الانتظار
        setRegistrationStatus('waitlist_available');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      await eventsApi.joinWaitlist(event.id);
      setRegistrationStatus('waitlisted');
      toast.success('تم إضافتك لقائمة الانتظار');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      {/* معلومات الفعالية */}
      <EventInfo event={event} />
      
      {/* أزرار التسجيل */}
      {registrationStatus === 'registered' && (
        <Button disabled>✓ مسجل</Button>
      )}
      
      {registrationStatus === 'waitlisted' && (
        <WaitlistStatus eventId={event.id} />
      )}
      
      {!registrationStatus && (
        <Button onClick={handleRegister} disabled={isRegistering}>
          {isRegistering ? 'جاري التسجيل...' : 'سجل الآن'}
        </Button>
      )}
      
      {registrationStatus === 'waitlist_available' && (
        <div className="space-y-2">
          <p>الفعالية ممتلئة</p>
          <Button onClick={handleJoinWaitlist}>
            انضم لقائمة الانتظار
          </Button>
        </div>
      )}
    </div>
  );
};
```

**3. مسح QR Code للتذاكر:**
```typescript
// مكون مسح التذاكر للمنظمين
const QRScannerComponent = ({ eventId, onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  
  const handleScan = async (qrData) => {
    try {
      // فك تشفير بيانات QR Code
      const ticketData = JSON.parse(qrData);
      
      // التحقق من التذكرة وتسجيل الدخول
      const response = await eventsApi.checkInWithTicket(
        eventId, 
        ticketData.ticketCode, 
        'QR_SCAN'
      );
      
      if (response.success) {
        onScanSuccess({
          attendee: response.attendee,
          checkInTime: response.checkInTime
        });
        
        // إشعار صوتي للنجاح
        playSuccessSound();
      } else {
        // إشعار صوتي للفشل
        playErrorSound();
        alert(response.message);
      }
    } catch (error) {
      console.error('QR Scan error:', error);
      alert('خطأ في قراءة الرمز');
    }
  };

  return (
    <div>
      {scanning ? (
        <QRCodeScanner onScan={handleScan} />
      ) : (
        <Button onClick={() => setScanning(true)}>
          بدء المسح
        </Button>
      )}
    </div>
  );
};
```

#### Backend Implementation Examples

**4. Middleware للتحقق من الصلاحيات:**
```typescript
// التحقق من ملكية الفعالية
@Injectable()
export class EventOwnershipGuard implements CanActivate {
  constructor(private eventsService: EventsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const eventId = request.params.eventId || request.params.id;

    const event = await this.eventsService.findById(eventId);
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this event');
    }

    return true;
  }
}

// استخدام الـ Guard
@Controller('events/:eventId/attendees')
@UseGuards(JwtAuthGuard, EventOwnershipGuard)
export class EventAttendeesController {
  // فقط مالك الفعالية يمكنه رؤية قائمة الحضور
}
```

**5. معالج الأحداث لقائمة الانتظار:**
```typescript
// معالج تلقائي عند إلغاء التسجيل
@Injectable()
export class RegistrationEventHandler {
  constructor(
    private waitlistService: EventWaitlistService,
    private notificationService: NotificationService
  ) {}

  @EventPattern('registration.cancelled')
  async handleRegistrationCancelled(data: { eventId: string, userId: string }) {
    // معالجة قائمة الانتظار عند إلغاء التسجيل
    const result = await this.waitlistService.processWaitlistWhenSpotAvailable(data.eventId);
    
    if (result && result.notifiedUser) {
      // إرسال إشعار للمستخدم التالي في القائمة
      await this.notificationService.sendEmail({
        to: result.notifiedUser.email,
        subject: 'مقعد متاح في الفعالية!',
        template: 'waitlist-notification',
        data: {
          userName: result.notifiedUser.name,
          eventTitle: result.registration.event.title,
          eventDate: result.registration.event.startDate,
        }
      });

      // إرسال إشعار push
      await this.notificationService.sendPushNotification({
        userId: result.notifiedUser.id,
        title: 'مقعد متاح!',
        body: `تم تسجيلك تلقائياً في ${result.registration.event.title}`,
        data: { eventId: data.eventId }
      });
    }
  }
}
```

**6. جدولة المهام للتذكيرات:**
```typescript
// مهام مجدولة للتذكيرات
@Injectable()
export class EventScheduleService {
  constructor(
    private eventsService: EventsService,
    private emailService: EmailService
  ) {}

  // تذكير يومي قبل الفعالية
  @Cron('0 9 * * *') // كل يوم الساعة 9 صباحاً
  async sendDailyReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingEvents = await this.eventsService.getEventsStartingOn(tomorrow);

    for (const event of upcomingEvents) {
      const attendees = await this.registrationsService.getEventAttendees(event.id);
      
      for (const attendee of attendees) {
        await this.emailService.sendEventReminder({
          to: attendee.user.email,
          eventTitle: event.title,
          eventDate: event.startDate,
          venue: event.venue,
          isOnline: event.isOnline,
          meetingUrl: event.meetingUrl,
          ticketCode: attendee.ticket?.ticketCode
        });
      }
    }
  }

  // تذكير قبل ساعة من بداية الفعالية
  @Cron('0 * * * *') // كل ساعة
  async sendHourlyReminders() {
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const startingSoonEvents = await this.eventsService.getEventsStartingAt(oneHourFromNow);

    for (const event of startingSoonEvents) {
      // إرسال تذكيرات لحضور الفعالية
      await this.sendLastMinuteReminders(event);
    }
  }
}
```

---

### **Error Handling & Status Codes**

#### Common Error Responses

```typescript
// 400 Bad Request - بيانات غير صحيحة
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "بيانات غير صحيحة",
    details: {
      "title": ["العنوان مطلوب"],
      "startDate": ["التاريخ يجب أن يكون في المستقبل"]
    }
  },
  statusCode: 400
}

// 401 Unauthorized - غير مصرح
{
  success: false,
  error: {
    code: "UNAUTHORIZED",
    message: "يجب تسجيل الدخول أولاً"
  },
  statusCode: 401
}

// 403 Forbidden - ممنوع
{
  success: false,
  error: {
    code: "FORBIDDEN",
    message: "لا تملك صلاحية لتنفيذ هذا الإجراء"
  },
  statusCode: 403
}

// 404 Not Found - غير موجود
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "الفعالية غير موجودة"
  },
  statusCode: 404
}

// 409 Conflict - تضارب
{
  success: false,
  error: {
    code: "ALREADY_REGISTERED",
    message: "أنت مسجل بالفعل في هذه الفعالية"
  },
  statusCode: 409
}

// 422 Unprocessable Entity - فعالية ممتلئة
{
  success: false,
  error: {
    code: "EVENT_FULL",
    message: "الفعالية ممتلئة",
    details: {
      maxAttendees: 100,
      currentAttendees: 100,
      waitlistAvailable: true
    }
  },
  statusCode: 422
}
```

#### Rate Limiting

```typescript
// حدود معدل الطلبات
const RATE_LIMITS = {
  // تسجيل في الفعاليات
  'POST /api/events/:eventId/registrations': '5 requests per minute',
  
  // إنشاء فعاليات
  'POST /api/events': '10 requests per hour',
  
  // إضافة تقييمات
  'POST /api/events/:eventId/reviews': '3 requests per hour',
  
  // مسح التذاكر
  'POST /api/tickets/events/:eventId/checkin': '100 requests per minute',
};
```

---

### المرحلة 4.2: Backend - Event Registrations

#### 1. تحديث Prisma Schema

إضافة جدول التسجيلات:

```prisma
model EventRegistration {
  id              String   @id @default(uuid())
  eventId         String
  userId          String
  status          RegistrationStatus @default(REGISTERED)
  registrationData Json?   // بيانات إضافية (استبيانات، تفضيلات، إلخ)
  attendedAt      DateTime? // وقت الحضور الفعلي
  checkInMethod   String?  // طريقة تسجيل الدخول (QR, manual, etc.)
  notes           String?  // ملاحظات خاصة
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // العلاقات
  event           Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ticket          EventTicket? // التذكرة المرتبطة
  
  @@unique([eventId, userId])
  @@map("event_registrations")
}

enum RegistrationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
}

model EventCategory {
  id          String @id @default(uuid())
  name        String @unique
  nameAr      String @unique // الاسم بالعربية
  description String?
  descriptionAr String? // الوصف بالعربية
  icon        String? // أيقونة الفئة
  color       String? // لون الفئة
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  events      Event[]
  
  @@map("event_categories")
}

enum EventType {
  CONFERENCE     // مؤتمر
  WORKSHOP      // ورشة عمل
  SEMINAR       // ندوة
  TRAINING      // دورة تدريبية
  MEETUP        // لقاء
  WEBINAR       // ندوة عبر الإنترنت
  EXHIBITION    // معرض
  NETWORKING    // تواصل مهني
  COMPETITION   // مسابقة
  SOCIAL        // فعالية اجتماعية
  CULTURAL      // فعالية ثقافية
  SPORTS        // رياضية
  EDUCATIONAL   // تعليمية
  BUSINESS      // أعمال
  TECHNOLOGY    // تقنية
  HEALTH        // صحية
  ART           // فنية
  MUSIC         // موسيقية
  OTHER         // أخرى
}

// نظام التقييمات والمراجعات
model EventReview {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  rating    Int      @db.SmallInt // 1-5 stars
  comment   String?  @db.Text
  isAnonymous Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // العلاقات
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId])
  @@map("event_reviews")
}

// قائمة الانتظار للفعاليات الممتلئة
model EventWaitlist {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  position  Int      // ترتيب في القائمة
  isNotified Boolean @default(false) // هل تم إشعاره عند توفر مقعد
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // العلاقات
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId])
  @@map("event_waitlist")
}

// نظام التذاكر والباركود
model EventTicket {
  id             String   @id @default(uuid())
  registrationId String   @unique
  ticketCode     String   @unique // كود التذكرة
  qrCode         String   @unique // QR code data
  qrCodeImage    String?  // رابط صورة QR code
  isUsed         Boolean  @default(false)
  usedAt         DateTime?
  scanCount      Int      @default(0) // عدد مرات المسح
  lastScannedAt  DateTime?
  createdAt      DateTime @default(now())
  
  // العلاقات
  registration   EventRegistration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  
  @@map("event_tickets")
}

// دمج التقويم الخارجي
model CalendarIntegration {
  id           String   @id @default(uuid())
  userId       String
  eventId      String
  provider     CalendarProvider
  externalId   String   // Google/Outlook event ID
  syncStatus   SyncStatus @default(PENDING)
  lastSynced   DateTime?
  errorMessage String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // العلاقات
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event        Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId, provider])
  @@map("calendar_integrations")
}

enum CalendarProvider {
  GOOGLE
  OUTLOOK
  APPLE
}

enum SyncStatus {
  PENDING
  SYNCED
  FAILED
  CANCELLED
}

// تحديث Event model
model Event {
  id              String      @id @default(uuid())
  title           String
  slug            String      @unique
  description     String?
  startDate       DateTime
  endDate         DateTime
  venue           String?
  location        String?
  maxAttendees    Int?
  price           Float?
  status          EventStatus @default(SCHEDULED)
  isFeatured      Boolean     @default(false)
  type            EventType   @default(OTHER)
  categoryId      String?
  
  // ميزات الفعاليات الافتراضية
  isOnline        Boolean     @default(false)
  meetingUrl      String?     // رابط الاجتماع (Zoom, Google Meet, etc.)
  meetingPassword String?     // كلمة مرور الاجتماع
  streamingUrl    String?     // رابط البث المباشر
  
  // معلومات إضافية
  requirements    String?     // متطلبات الحضور
  agenda          Json?       // جدول الأعمال (JSON format)
  materials       String[]    // روابط المواد التدريبية
  tags            String[]    // علامات للبحث
  language        String      @default("ar") // لغة الفعالية
  timezone        String      @default("Asia/Riyadh") // المنطقة الزمنية
  
  // إعدادات متقدمة
  allowWaitlist   Boolean     @default(true)  // السماح بقائمة الانتظار
  autoApprove     Boolean     @default(true)  // الموافقة التلقائية على التسجيل
  sendReminders   Boolean     @default(true)  // إرسال التذكيرات
  enableRating    Boolean     @default(true)  // تمكين التقييم
  minRatingDays   Int         @default(1)     // أقل عدد أيام بعد انتهاء الفعالية للتقييم
  
  // إحصائيات
  viewCount       Int         @default(0)     // عدد المشاهدات
  averageRating   Float?      // متوسط التقييم
  totalRatings    Int         @default(0)     // إجمالي عدد التقييمات
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // العلاقات
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        EventCategory? @relation(fields: [categoryId], references: [id])
  registrations   EventRegistration[]
  reviews         EventReview[]
  waitlist        EventWaitlist[]
  calendarIntegrations CalendarIntegration[]
  
  @@map("events")
}

// تحديث User model
model User {
  // ... الحقول الموجودة
  events             Event[]
  eventRegistrations EventRegistration[]
  eventReviews       EventReview[]
  eventWaitlist      EventWaitlist[]
  calendarIntegrations CalendarIntegration[]
}
```

#### 2. Registration Service

**apps/api/src/events/registrations.service.ts:**
```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class EventRegistrationsService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, eventId: string) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'REGISTERED' },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event is in the past
    if (event.startDate < new Date()) {
      throw new BadRequestException('Cannot register for past events');
    }

    // Check if event is full
    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      throw new BadRequestException('Event is full');
    }

    // Check if user already registered
    const existingRegistration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'CANCELLED') {
        // Reactivate cancelled registration
        return this.prisma.eventRegistration.update({
          where: { id: existingRegistration.id },
          data: { status: 'REGISTERED' },
        });
      }
      throw new ConflictException('Already registered for this event');
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: 'REGISTERED',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            venue: true,
          },
        },
      },
    });
  }

  async cancel(userId: string, registrationId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Not authorized to cancel this registration');
    }

    // Check if event already started
    if (registration.event.startDate < new Date()) {
      throw new BadRequestException('Cannot cancel registration for ongoing or past events');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' },
    });
  }

  async getEventAttendees(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: {
        eventId,
        status: { in: ['REGISTERED', 'ATTENDED'] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getUserRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            venue: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsAttended(eventOwnerId: string, registrationId: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.event.userId !== eventOwnerId) {
      throw new ForbiddenException('Not authorized to update this registration');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: 'ATTENDED' },
    });
  }
}
```

---

### المرحلة 4.3: Frontend - Events Pages

#### 1. صفحة عرض الفعاليات

**apps/web/src/app/events/page.tsx:**
```typescript
import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { getEvents } from '@/lib/api/events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/events/EventCard';
import EventTypeFilter from '@/components/events/EventTypeFilter';
import { getEvents, getEventCategories } from '@/lib/api/events';
import { EventType } from '@/types/events';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState<EventType | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnlineFilter, setIsOnlineFilter] = useState<boolean | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [selectedType, selectedCategory, searchQuery, isOnlineFilter]);

  const loadData = async () => {
    try {
      const [eventsData, categoriesData] = await Promise.all([
        getEvents({ upcoming: true }),
        getEventCategories(),
      ]);
      
      setEvents(eventsData.events);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { events } = await getEvents({
        upcoming: true,
        type: selectedType,
        categoryId: selectedCategory,
        search: searchQuery || undefined,
        isOnline: isOnlineFilter,
      });
      setEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">الفعاليات القادمة</h1>
          <p className="text-gray-600">اكتشف وانضم إلى فعاليات مثيرة</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">إنشاء فعالية</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="ابحث عن الفعاليات..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Type and Category Filters */}
        <EventTypeFilter
          selectedType={selectedType}
          selectedCategory={selectedCategory}
          categories={categories}
          onTypeChange={setSelectedType}
          onCategoryChange={setSelectedCategory}
        />

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isOnlineFilter === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsOnlineFilter(isOnlineFilter === true ? undefined : true)}
          >
            فعاليات أونلاين
          </Button>
          <Button
            variant={isOnlineFilter === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsOnlineFilter(isOnlineFilter === false ? undefined : false)}
          >
            فعاليات حضورية
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">لا توجد فعاليات متاحة</p>
          <p className="text-sm">جرب تغيير فلاتر البحث أو تصفح الفئات المختلفة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">تصفح حسب الفئة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor: selectedCategory === category.id 
                    ? `${category.color}20` 
                    : 'transparent',
                  borderColor: selectedCategory === category.id 
                    ? category.color 
                    : undefined,
                }}
              >
                {category.icon && (
                  <i 
                    className={category.icon} 
                    style={{ color: category.color, fontSize: '1.5rem' }}
                  />
                )}
                <span className="text-xs font-medium text-center">
                  {category.nameAr || category.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({category._count.events})
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 2. مكون تصنيف الفعاليات

**apps/web/src/components/events/EventTypeFilter.tsx:**
```tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventType } from '@/types/events';

interface EventTypeFilterProps {
  selectedType?: EventType;
  selectedCategory?: string;
  categories: any[];
  onTypeChange: (type: EventType | undefined) => void;
  onCategoryChange: (categoryId: string | undefined) => void;
}

const eventTypeTranslations = {
  CONFERENCE: 'مؤتمر',
  WORKSHOP: 'ورشة عمل',
  SEMINAR: 'ندوة',
  TRAINING: 'دورة تدريبية',
  MEETUP: 'لقاء',
  WEBINAR: 'ندوة عبر الإنترنت',
  EXHIBITION: 'معرض',
  NETWORKING: 'تواصل مهني',
  COMPETITION: 'مسابقة',
  SOCIAL: 'فعالية اجتماعية',
  CULTURAL: 'فعالية ثقافية',
  SPORTS: 'رياضية',
  EDUCATIONAL: 'تعليمية',
  BUSINESS: 'أعمال',
  TECHNOLOGY: 'تقنية',
  HEALTH: 'صحية',
  ART: 'فنية',
  MUSIC: 'موسيقية',
  OTHER: 'أخرى',
};

export default function EventTypeFilter({
  selectedType,
  selectedCategory,
  categories,
  onTypeChange,
  onCategoryChange,
}: EventTypeFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* تصنيف نوع الفعالية */}
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">نوع الفعالية</label>
        <Select
          value={selectedType || ''}
          onValueChange={(value) => onTypeChange(value as EventType || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الفعالية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع الأنواع</SelectItem>
            {Object.entries(eventTypeTranslations).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* تصنيف الفئة */}
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">فئة الفعالية</label>
        <Select
          value={selectedCategory || ''}
          onValueChange={(value) => onCategoryChange(value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">جميع الفئات</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  {category.icon && (
                    <i 
                      className={category.icon} 
                      style={{ color: category.color }}
                    />
                  )}
                  {category.nameAr || category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* إعادة تعيين الفلاتر */}
      {(selectedType || selectedCategory) && (
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              onTypeChange(undefined);
              onCategoryChange(undefined);
            }}
          >
            مسح الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### 3. مكون بطاقة الفعالية المحدثة

**apps/web/src/components/events/EventCard.tsx:**
```tsx
import Link from 'next/link';
import { Calendar, MapPin, Users, Globe, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    type: string;
    startDate: string;
    venue?: string;
    isOnline: boolean;
    isFeatured: boolean;
    price?: number;
    language: string;
    tags: string[];
    user: {
      name: string;
    };
    category?: {
      nameAr: string;
      icon?: string;
      color?: string;
    };
    _count: {
      registrations: number;
    };
    maxAttendees?: number;
  };
}

const eventTypeTranslations = {
  CONFERENCE: 'مؤتمر',
  WORKSHOP: 'ورشة عمل',
  SEMINAR: 'ندوة',
  TRAINING: 'دورة تدريبية',
  MEETUP: 'لقاء',
  WEBINAR: 'ندوة عبر الإنترنت',
  EXHIBITION: 'معرض',
  NETWORKING: 'تواصل مهني',
  COMPETITION: 'مسابقة',
  SOCIAL: 'فعالية اجتماعية',
  CULTURAL: 'فعالية ثقافية',
  SPORTS: 'رياضية',
  EDUCATIONAL: 'تعليمية',
  BUSINESS: 'أعمال',
  TECHNOLOGY: 'تقنية',
  HEALTH: 'صحية',
  ART: 'فنية',
  MUSIC: 'موسيقية',
  OTHER: 'أخرى',
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl line-clamp-2">
              {event.title}
            </CardTitle>
            <div className="flex flex-col gap-2">
              {event.isFeatured && (
                <Badge variant="secondary">مميز</Badge>
              )}
              {event.isOnline && (
                <Badge variant="outline" className="text-blue-600">
                  <Video className="w-3 h-3 mr-1" />
                  أونلاين
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">بواسطة {event.user.name}</p>
            {event.language !== 'ar' && (
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {event.language === 'en' ? 'English' : event.language}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* نوع وفئة الفعالية */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                backgroundColor: event.category?.color ? `${event.category.color}20` : undefined,
                borderColor: event.category?.color 
              }}
            >
              {event.category?.icon && (
                <i className={`${event.category.icon} mr-1`} />
              )}
              {eventTypeTranslations[event.type as keyof typeof eventTypeTranslations] || event.type}
            </Badge>
            
            {event.category && (
              <Badge variant="outline" className="text-xs">
                {event.category.nameAr}
              </Badge>
            )}
          </div>

          {/* تاريخ الفعالية */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(event.startDate).toLocaleDateString('ar-SA', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          {/* مكان الفعالية */}
          {event.venue && !event.isOnline && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {event.venue}
            </div>
          )}

          {/* العلامات */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{event.tags.length - 3} المزيد
                </span>
              )}
            </div>
          )}

          {/* معلومات الحضور والسعر */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {event._count.registrations}
              {event.maxAttendees && ` / ${event.maxAttendees}`} مشارك
            </div>

            {event.price !== undefined && event.price !== null ? (
              <Badge variant="outline">
                {event.price === 0 ? 'مجاني' : `${event.price.toFixed(2)} ريال`}
              </Badge>
            ) : (
              <Badge variant="outline">مجاني</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

#### 4. صفحة تفاصيل الفعالية
```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { registerForEvent } from '@/lib/api/events';

export default function EventDetailPage({ event }: { event: any }) {
  const { data: session } = useSession();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    setIsRegistering(true);
    try {
      await registerForEvent(event.id);
      setIsRegistered(true);
      alert('Successfully registered!');
    } catch (error: any) {
      alert(error.message || 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  const isFull = event.maxAttendees && event._count.registrations >= event.maxAttendees;
  const isPast = new Date(event.startDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                <p className="text-gray-600">Organized by {event.user.name}</p>
              </div>
              {event.isFeatured && (
                <Badge variant="secondary" className="ml-4">Featured</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-semibold">Start Date</p>
                  <p className="text-gray-600">
                    {new Date(event.startDate).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-semibold">End Date</p>
                  <p className="text-gray-600">
                    {new Date(event.endDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-semibold">Venue</p>
                    <p className="text-gray-600">{event.venue}</p>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-semibold">Attendees</p>
                  <p className="text-gray-600">
                    {event._count.registrations}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </p>
                </div>
              </div>

              {event.price !== null && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-semibold">Price</p>
                    <p className="text-gray-600">
                      {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">About This Event</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Registration Button */}
            <div className="pt-4">
              {isRegistered ? (
                <Button disabled className="w-full">
                  ✓ Registered
                </Button>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={isRegistering || isFull || isPast}
                  className="w-full"
                >
                  {isRegistering
                    ? 'Registering...'
                    : isFull
                    ? 'Event Full'
                    : isPast
                    ? 'Event Ended'
                    : 'Register Now'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### المرحلة 4.4: البيانات الأولية وإعدادات النظام

#### 1. بيانات أولية لفئات الفعاليات

**apps/api/prisma/seeds/event-categories.ts:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const eventCategoriesData = [
  {
    name: 'Technology',
    nameAr: 'التقنية والبرمجة',
    description: 'Technology and programming related events',
    descriptionAr: 'فعاليات متعلقة بالتقنية والبرمجة',
    icon: 'fas fa-laptop-code',
    color: '#3B82F6',
  },
  {
    name: 'Business',
    nameAr: 'الأعمال وريادة الأعمال',
    description: 'Business and entrepreneurship events',
    descriptionAr: 'فعاليات الأعمال وريادة الأعمال',
    icon: 'fas fa-briefcase',
    color: '#059669',
  },
  {
    name: 'Health',
    nameAr: 'الصحة واللياقة',
    description: 'Health and fitness related events',
    descriptionAr: 'فعاليات متعلقة بالصحة واللياقة البدنية',
    icon: 'fas fa-heartbeat',
    color: '#DC2626',
  },
  {
    name: 'Education',
    nameAr: 'التعليم والتطوير',
    description: 'Educational and development events',
    descriptionAr: 'فعاليات تعليمية وتطويرية',
    icon: 'fas fa-graduation-cap',
    color: '#7C3AED',
  },
  {
    name: 'Art & Culture',
    nameAr: 'الفن والثقافة',
    description: 'Arts, culture and creative events',
    descriptionAr: 'فعاليات فنية وثقافية وإبداعية',
    icon: 'fas fa-palette',
    color: '#DB2777',
  },
  {
    name: 'Sports',
    nameAr: 'الرياضة والأنشطة البدنية',
    description: 'Sports and physical activities',
    descriptionAr: 'الرياضة والأنشطة البدنية',
    icon: 'fas fa-running',
    color: '#EA580C',
  },
  {
    name: 'Social',
    nameAr: 'الفعاليات الاجتماعية',
    description: 'Social gatherings and networking',
    descriptionAr: 'التجمعات الاجتماعية والتواصل',
    icon: 'fas fa-users',
    color: '#0891B2',
  },
  {
    name: 'Food & Drink',
    nameAr: 'الطعام والشراب',
    description: 'Culinary events and food experiences',
    descriptionAr: 'فعاليات الطبخ وتجارب الطعام',
    icon: 'fas fa-utensils',
    color: '#65A30D',
  },
  {
    name: 'Music',
    nameAr: 'الموسيقى والترفيه',
    description: 'Music and entertainment events',
    descriptionAr: 'فعاليات موسيقية وترفيهية',
    icon: 'fas fa-music',
    color: '#C026D3',
  },
  {
    name: 'Travel',
    nameAr: 'السفر والسياحة',
    description: 'Travel and tourism related events',
    descriptionAr: 'فعاليات متعلقة بالسفر والسياحة',
    icon: 'fas fa-plane',
    color: '#0D9488',
  },
];

export async function seedEventCategories() {
  console.log('🌱 Seeding event categories...');
  
  for (const categoryData of eventCategoriesData) {
    await prisma.eventCategory.upsert({
      where: { name: categoryData.name },
      update: categoryData,
      create: categoryData,
    });
  }
  
  console.log('✅ Event categories seeded successfully');
}
```

#### 2. تحديث ملف البذور الرئيسي

**apps/api/prisma/seed.ts:**
```typescript
import { PrismaClient } from '@prisma/client';
import { seedEventCategories } from './seeds/event-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...');
  
  try {
    await seedEventCategories();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 3. إضافة أمر البذور في package.json

**apps/api/package.json:**
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force && npm run db:seed",
    "db:fresh": "prisma db push && npm run db:seed"
  }
}
```

#### 4. مكون إحصائيات الفعاليات

**apps/web/src/components/events/EventsStats.tsx:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MapPin, Video } from 'lucide-react';

interface EventsStatsProps {
  stats: {
    totalEvents: number;
    totalRegistrations: number;
    onlineEvents: number;
    upcomingEvents: number;
  };
}

export default function EventsStats({ stats }: EventsStatsProps) {
  const statsData = [
    {
      title: 'إجمالي الفعاليات',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'إجمالي المشاركين',
      value: stats.totalRegistrations,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'فعاليات قادمة',
      value: stats.upcomingEvents,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'فعاليات أونلاين',
      value: stats.onlineEvents,
      icon: Video,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق

#### Backend APIs
- [ ] Event CRUD APIs مع دعم التصنيفات
- [ ] Event Categories CRUD APIs
- [ ] Registration system مع التحقق المتقدم
- [ ] Attendee management والإحصائيات
- [ ] نظام الفلترة والبحث المتقدم
- [ ] APIs للإحصائيات والتقارير

#### قاعدة البيانات
- [ ] Event model محدث مع الحقول الجديدة
- [ ] EventCategory model
- [ ] EventType enum مع جميع الأنواع
- [ ] EventRegistration مع حالات متقدمة
- [ ] البيانات الأولية للفئات
- [ ] فهرسة قاعدة البيانات للأداء

#### واجهات المستخدم
- [ ] صفحة عرض الفعاليات مع الفلاتر
- [ ] مكون EventCard محسن
- [ ] EventTypeFilter للتصنيف
- [ ] صفحة تفاصيل الفعالية محدثة
- [ ] لوحة تحكم الفعاليات
- [ ] نظام البحث المتقدم
- [ ] واجهة إدارة الفئات

#### ميزات متقدمة
- [ ] دعم الفعاليات الأونلاين
- [ ] نظام العلامات (Tags)
- [ ] دعم اللغات المتعددة
- [ ] إحصائيات مفصلة
- [ ] نظام التسجيل المحسن
- [ ] إشعارات البريد الإلكتروني
- [ ] تقويم الفعاليات التفاعلي

#### الاختبارات والجودة
- [ ] اختبارات وحدة للـ APIs
- [ ] اختبارات التكامل
- [ ] اختبارات واجهة المستخدم
- [ ] اختبارات الأداء
- [ ] مراجعة الكود والأمان

#### الميزات المتقدمة الجديدة
- [ ] نظام التقييمات والمراجعات
- [ ] قائمة الانتظار للفعاليات الممتلئة
- [ ] نظام التذاكر الرقمية مع QR Code
- [ ] تكامل التقويم (Google/Outlook/Apple)
- [ ] دعم متقدم للفعاليات الافتراضية
- [ ] مسح التذاكر وتسجيل الدخول
- [ ] إحصائيات مفصلة للمنظمين
- [ ] تصدير بيانات الحضور
- [ ] إشعارات قائمة الانتظار
- [ ] تتبع معدلات الحضور

---

## الخطوة التالية | Next Steps

📄 **المرحلة الخامسة:** `PHASE_05_PAYMENTS_SUBSCRIPTIONS.md`

---

---

## 🚀 الميزات المتقدمة المضافة | Advanced Features Added

### 1. **نظام التقييمات والمراجعات**
- تقييم بالنجوم (1-5)
- تعليقات مفصلة
- خيار النشر المجهول
- حساب متوسط التقييم التلقائي
- عرض إحصائيات التقييمات

### 2. **قائمة الانتظار الذكية**
- انضمام تلقائي عند امتلاء الفعالية
- ترتيب حسب الأولوية
- تقدير زمن الانتظار
- إشعارات فورية عند توفر مقعد
- تسجيل تلقائي من قائمة الانتظار

### 3. **نظام التذاكر الرقمية**
- توليد QR Code فريد لكل تذكرة
- كود تذكرة آمن ومشفر
- تحميل التذكرة كـ PDF
- إرسال التذكرة عبر البريد
- تتبع حالة الاستخدام

### 4. **تكامل التقويم المتقدم**
- دعم Google Calendar
- دعم Microsoft Outlook
- دعم Apple Calendar
- تصدير ملفات ICS
- مزامنة تلقائية للتحديثات

### 5. **الفعاليات الافتراضية المحسنة**
- روابط اجتماعات متعددة
- كلمات مرور للاجتماعات
- روابط بث مباشر
- مواد تدريبية قابلة للتحميل
- دعم المناطق الزمنية

### 6. **مسح التذاكر وتسجيل الدخول**
- مسح QR Code بالكاميرا
- إدخال يدوي للأكواد
- تحقق فوري من صحة التذكرة
- تسجيل وقت الدخول
- منع الاستخدام المتكرر

### 7. **إحصائيات وتقارير متقدمة**
- معدلات الحضور الفعلي
- إحصائيات قائمة الانتظار
- تتبع عمليات تسجيل الدخول
- تصدير بيانات الحضور
- تحليل أداء الفعاليات

### 8. **واجهات المستخدم الجديدة**
- مكون التقييمات التفاعلي
- عرض حالة قائمة الانتظار
- التذكرة الرقمية الكاملة
- مسح QR Code للمنظمين
- لوحة إحصائيات شاملة

---

## 📊 **مقارنة قبل وبعد التطوير**

### **قبل الإضافات:**
- تسجيل بسيط للفعاليات
- عرض أساسي للفعاليات
- نظام تسجيل تقليدي
- لا توجد تقييمات
- لا يوجد نظام انتظار

### **بعد الإضافات:**
✅ **نظام متكامل للفعاليات**  
✅ **تجربة مستخدم متقدمة**  
✅ **إدارة احترافية للمنظمين**  
✅ **تقييمات ومراجعات**  
✅ **نظام انتظار ذكي**  
✅ **تذاكر رقمية آمنة**  
✅ **تكامل مع التقاويم**  
✅ **إحصائيات شاملة**  

---

## 🎯 **التأثير المتوقع**

### **للمستخدمين:**
- تجربة تسجيل سلسة ومتطورة
- إمكانية تقييم الفعاليات ومشاركة الآراء
- قائمة انتظار ذكية للفعاليات الشائعة
- تذاكر رقمية سهلة الاستخدام
- تكامل مع التقاويم الشخصية

### **للمنظمين:**
- أدوات إدارة متقدمة ومتكاملة
- إحصائيات مفصلة عن الأداء
- نظام تسجيل دخول آمن ومتطور
- إدارة قوائم الانتظار التلقائية
- تقارير شاملة عن الحضور

### **للمنصة:**
- زيادة معدل المشاركة والاستخدام
- تحسين جودة الفعاليات المنشورة
- بيانات قيمة عن تفضيلات المستخدمين
- ميزة تنافسية قوية في السوق
- إمكانيات تسويقية متقدمة

---

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**آخر تحديث:** 1 نوفمبر 2025  
**الحالة:** 🟢 محدث بالميزات المتقدمة - جاهز للتنفيذ
