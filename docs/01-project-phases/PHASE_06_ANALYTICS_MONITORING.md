# المرحلة السادسة: التحليلات والمراقبة
# Phase 6: Analytics & Monitoring

## نظرة عامة | Overview
هذه المرحلة تركز على بناء نظام تحليلات شامل، مراقبة الأداء، وتتبع سلوك المستخدمين.

**المدة المتوقعة:** 2-3 أسابيع  
**الأولوية:** متوسطة  
**الحالة:** 🔵 في الانتظار (بعد المرحلة 5)

---

## الأهداف الرئيسية | Main Objectives

### 1. تتبع سلوك المستخدمين
- ✅ تتبع الزيارات والمشاهدات
- ✅ تحليل رحلة المستخدم
- ✅ معدلات التحويل
- ✅ وقت التفاعل

### 2. تحليلات الأعمال
- ✅ إحصائيات المبيعات
- ✅ معدلات الاشتراك
- ✅ إيرادات شهرية
- ✅ نمو المستخدمين

### 3. مراقبة الأداء
- ✅ مراقبة سرعة API
- ✅ استخدام الموارد
- ✅ معدلات الأخطاء
- ✅ Uptime monitoring

### 4. لوحات التحكم
- ✅ Dashboard للمستخدم
- ✅ Dashboard للمسؤول
- ✅ تقارير مفصلة
- ✅ تصدير البيانات

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 6.1: Backend - Analytics Module

#### 1. تحديث Prisma Schema

```prisma
model AnalyticsEvent {
  id        String   @id @default(uuid())
  userId    String?
  eventType String
  eventData Json?
  ipAddress String?
  userAgent String?
  referrer  String?
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
  @@map("analytics_events")
}

model PageView {
  id        String   @id @default(uuid())
  userId    String?
  page      String
  duration  Int?     // seconds
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([page])
  @@index([createdAt])
  @@map("page_views")
}

model Metric {
  id         String   @id @default(uuid())
  name       String
  value      Float
  dimension  String?
  dimensionValue String?
  timestamp  DateTime @default(now())
  
  @@index([name])
  @@index([timestamp])
  @@map("metrics")
}
```

#### 2. Analytics Service

**apps/api/src/analytics/analytics.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Track event
  async trackEvent(data: {
    userId?: string;
    eventType: string;
    eventData?: any;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  }) {
    return this.prisma.analyticsEvent.create({
      data: {
        ...data,
        eventData: data.eventData ? JSON.stringify(data.eventData) : null,
      },
    });
  }

  // Track page view
  async trackPageView(data: {
    userId?: string;
    page: string;
    duration?: number;
  }) {
    return this.prisma.pageView.create({
      data,
    });
  }

  // Record metric
  async recordMetric(data: {
    name: string;
    value: number;
    dimension?: string;
    dimensionValue?: string;
  }) {
    return this.prisma.metric.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  // Get user activity
  async getUserActivity(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [events, pageViews] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          userId,
          createdAt: { gte: since },
        },
      }),
      this.prisma.pageView.count({
        where: {
          userId,
          createdAt: { gte: since },
        },
      }),
    ]);

    return { events, pageViews };
  }

  // Get popular pages
  async getPopularPages(limit = 10) {
    const result = await this.prisma.pageView.groupBy({
      by: ['page'],
      _count: {
        page: true,
      },
      orderBy: {
        _count: {
          page: 'desc',
        },
      },
      take: limit,
    });

    return result.map((item) => ({
      page: item.page,
      views: item._count.page,
    }));
  }

  // Get event counts by type
  async getEventCounts(startDate: Date, endDate: Date) {
    const result = await this.prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: {
        eventType: true,
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return result.map((item) => ({
      eventType: item.eventType,
      count: item._count.eventType,
    }));
  }

  // Get daily active users
  async getDailyActiveUsers(days = 30) {
    const result = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await this.prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: date,
            lt: nextDay,
          },
        },
        distinct: ['userId'],
      });

      result.push({
        date: date.toISOString().split('T')[0],
        users: count.length,
      });
    }

    return result.reverse();
  }

  // Get revenue metrics
  async getRevenueMetrics(startDate: Date, endDate: Date) {
    const payments = await this.prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return {
      totalRevenue: payments._sum.amount || 0,
      totalTransactions: payments._count,
    };
  }

  // Get subscription metrics
  async getSubscriptionMetrics() {
    const [active, cancelled, pastDue] = await Promise.all([
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      this.prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
    ]);

    return { active, cancelled, pastDue };
  }

  // Get profile statistics
  async getProfileStatistics(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            socialLinks: true,
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    // Get profile views (page views for this profile)
    const profileViews = await this.prisma.pageView.count({
      where: {
        page: { contains: profile.username },
      },
    });

    // Get link clicks
    const linkClicks = await this.prisma.shortUrl.aggregate({
      where: { userId },
      _sum: {
        clicks: true,
      },
    });

    return {
      profileViews,
      socialLinksCount: profile._count.socialLinks,
      totalLinkClicks: linkClicks._sum.clicks || 0,
    };
  }

  // Get store statistics
  async getStoreStatistics(userId: string) {
    const stores = await this.prisma.store.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const storeStats = await Promise.all(
      stores.map(async (store) => {
        const products = await this.prisma.product.findMany({
          where: { storeId: store.id },
          include: {
            _count: {
              select: {
                images: true,
              },
            },
          },
        });

        const totalValue = products.reduce(
          (sum, product) => sum + Number(product.price) * product.quantity,
          0,
        );

        return {
          storeId: store.id,
          storeName: store.name,
          productsCount: store._count.products,
          totalInventoryValue: totalValue,
        };
      }),
    );

    return storeStats;
  }
}
```

#### 3. Analytics Controller

**apps/api/src/analytics/analytics.controller.ts:**
```typescript
import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track analytics event' })
  async trackEvent(@Body() data: any, @Request() req) {
    return this.analyticsService.trackEvent({
      ...data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard analytics' })
  async getDashboard(@Request() req) {
    const [activity, profileStats, storeStats] = await Promise.all([
      this.analyticsService.getUserActivity(req.user.userId),
      this.analyticsService.getProfileStatistics(req.user.userId),
      this.analyticsService.getStoreStatistics(req.user.userId),
    ]);

    return {
      activity,
      profile: profileStats,
      stores: storeStats,
    };
  }

  @Get('popular-pages')
  @ApiOperation({ summary: 'Get popular pages' })
  async getPopularPages(@Query('limit') limit?: number) {
    return this.analyticsService.getPopularPages(limit ? +limit : 10);
  }

  @Get('daily-active-users')
  @ApiOperation({ summary: 'Get daily active users' })
  async getDailyActiveUsers(@Query('days') days?: number) {
    return this.analyticsService.getDailyActiveUsers(days ? +days : 30);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue metrics' })
  async getRevenue(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.analyticsService.getRevenueMetrics(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
```

---

### المرحلة 6.2: Performance Monitoring

#### 1. Logging Interceptor

**apps/api/src/common/interceptors/logging.interceptor.ts:**
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          
          this.logger.log(
            `${method} ${url} ${response.statusCode} - ${delay}ms`,
          );

          // Track slow requests
          if (delay > 1000) {
            this.logger.warn(`Slow request detected: ${method} ${url} took ${delay}ms`);
          }
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${error.status || 500} - ${delay}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
```

#### 2. Health Check

**apps/api/src/health/health.controller.ts:**
```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    return this.healthService.check();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'System metrics' })
  async getMetrics() {
    return this.healthService.getMetrics();
  }
}
```

**apps/api/src/health/health.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    const [dbHealth, memoryUsage] = await Promise.all([
      this.checkDatabase(),
      this.getMemoryUsage(),
    ]);

    return {
      status: dbHealth.healthy && memoryUsage.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      memory: memoryUsage,
    };
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        healthy: responseTime < 1000,
        responseTime: `${responseTime}ms`,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  private getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = (usedMemory / totalMemory) * 100;

    return {
      healthy: usagePercent < 90,
      total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
      used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
      free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
      usagePercent: `${usagePercent.toFixed(2)}%`,
    };
  }

  async getMetrics() {
    const [userCount, profileCount, storeCount, eventCount, activeSubscriptions] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.profile.count(),
        this.prisma.store.count(),
        this.prisma.event.count(),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      ]);

    return {
      users: userCount,
      profiles: profileCount,
      stores: storeCount,
      events: eventCount,
      activeSubscriptions,
      uptime: process.uptime(),
      nodeVersion: process.version,
    };
  }
}
```

---

### المرحلة 6.3: Frontend - Analytics Dashboard

#### 1. Analytics Dashboard

**apps/web/src/app/dashboard/analytics/page.tsx:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Link as LinkIcon, ShoppingBag, TrendingUp } from 'lucide-react';
import { getAnalytics } from '@/lib/api/analytics';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.profile?.profileViews || 0}
            </div>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <LinkIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.profile?.totalLinkClicks || 0}
            </div>
            <p className="text-xs text-gray-500">Total clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingBag className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.stores?.reduce((sum: number, store: any) => sum + store.productsCount, 0) || 0}
            </div>
            <p className="text-xs text-gray-500">Across all stores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.activity?.events || 0}
            </div>
            <p className="text-xs text-gray-500">Events tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Stores Overview */}
      {analytics.stores && analytics.stores.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.stores.map((store: any) => (
                <div key={store.storeId} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{store.storeName}</h3>
                    <p className="text-sm text-gray-500">
                      {store.productsCount} products
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ${store.totalInventoryValue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Inventory value</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق
- [ ] Analytics tracking system
- [ ] Performance monitoring
- [ ] Health check endpoints
- [ ] Analytics dashboard
- [ ] Revenue reports
- [ ] User activity tracking
- [ ] Store statistics
- [ ] Profile analytics
- [ ] Export functionality

---

## الخطوة التالية | Next Steps

📄 **المرحلة السابعة:** `PHASE_07_TESTING_DEPLOYMENT.md`

---

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**الحالة:** 🔵 جاهز للتنفيذ بعد المرحلة 5
