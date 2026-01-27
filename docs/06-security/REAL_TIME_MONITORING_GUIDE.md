# 📊 Real-Time Security Monitoring Guide

## 🔍 ما هو Real-Time Security Monitoring؟

**Real-Time Security Monitoring** يعني مراقبة الأحداث الأمنية بشكل فوري (live) والتنبيه الفوري عند حدوث مشاكل أمنية.

---

## 🎯 الهدف الرئيسي

بدلاً من الانتظار لمراجعة الـ logs لاحقاً، تحصل على **تنبيهات فورية** عند:

1. ❌ محاولات تسجيل دخول فاشلة متعددة
2. 🚨 محاولات وصول غير مصرح بها
3. ⚠️ نشاطات مشبوهة (مثل تغيير IP مفاجئ)
4. 🔒 محاولات CSRF
5. 📊 Rate limiting triggers
6. 🐛 أخطاء أمنية حرجة

---

## 📋 الفرق بين Monitoring العادي و Real-Time

### Monitoring العادي (الحالي في المشروع):
```typescript
// تسجيل الأحداث في Database
await prisma.securityLog.create({
  data: {
    userId: user.id,
    action: 'LOGIN_FAILED',
    ipAddress: req.ip,
    // ... بيانات أخرى
  }
});

// لاحقاً، يمكن مراجعة الـ logs
// لكن لا يوجد تنبيه فوري!
```

### Real-Time Monitoring (المطلوب):
```typescript
// 1. تسجيل في Database (كما هو)
await prisma.securityLog.create({...});

// 2. إرسال تنبيه فوري! 🚨
securityGateway.emitSecurityAlert({
  userId: user.id,
  type: 'LOGIN_FAILED_MULTIPLE',
  severity: 'high',
  message: '5 failed login attempts in 5 minutes',
  timestamp: new Date(),
});
```

---

## 🏗️ البنية المقترحة

### 1. Security Monitoring Dashboard (Frontend)

```typescript
// components/security/SecurityDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
}

export function SecurityDashboard() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState({
    failedLogins: 0,
    blockedIPs: 0,
    suspiciousActivity: 0,
  });

  useEffect(() => {
    // الاتصال بـ WebSocket للـ security events
    const socket = io(`${API_URL}/security`, {
      auth: {
        token: getAccessToken(),
      },
    });

    // استقبال تنبيهات أمنية جديدة
    socket.on('security-alert', (alert: SecurityAlert) => {
      setAlerts(prev => [alert, ...prev]);
      
      // عرض notification فوري
      toast.error(`Security Alert: ${alert.message}`, {
        severity: alert.severity,
      });

      // تحديث الإحصائيات
      updateStats(alert);
    });

    // استقبال تحديثات الإحصائيات
    socket.on('security-stats-update', (newStats) => {
      setStats(newStats);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="security-dashboard">
      <h2>Security Monitoring</h2>
      
      {/* Live Stats */}
      <div className="stats-grid">
        <StatCard title="Failed Logins" value={stats.failedLogins} />
        <StatCard title="Blocked IPs" value={stats.blockedIPs} />
        <StatCard title="Suspicious Activity" value={stats.suspiciousActivity} />
      </div>

      {/* Live Alerts */}
      <div className="alerts-list">
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
```

### 2. Backend Security Monitoring Service

```typescript
// apps/api/src/infrastructure/security/security-monitoring.service.ts
import { Injectable } from '@nestjs/common';
import { SecurityGateway } from './security.gateway';
import { PrismaService } from '../../core/database/prisma/prisma.service';

@Injectable()
export class SecurityMonitoringService {
  // تخزين مؤقت للأنشطة (يمكن استخدام Redis في Production)
  private activityCache = new Map<string, ActivityRecord[]>();

  constructor(
    private gateway: SecurityGateway,
    private prisma: PrismaService,
  ) {}

  /**
   * 🔒 مراقبة محاولات تسجيل الدخول الفاشلة
   */
  async trackFailedLogin(email: string, ipAddress: string) {
    const key = `failed_login:${email}:${ipAddress}`;
    const now = Date.now();
    const window = 5 * 60 * 1000; // 5 دقائق

    // الحصول على المحاولات السابقة
    const attempts = this.activityCache.get(key) || [];
    
    // إزالة المحاولات القديمة (خارج النافذة الزمنية)
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < window
    );

    recentAttempts.push({ timestamp: now });
    this.activityCache.set(key, recentAttempts);

    // تسجيل في Database
    await this.prisma.securityLog.create({
      data: {
        action: 'LOGIN_FAILED',
        userId: null,
        ipAddress,
        metadata: { email },
      },
    });

    // 🚨 تنبيه فوري إذا تجاوز العدد المسموح
    if (recentAttempts.length >= 5) {
      await this.triggerAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'high',
        message: `Multiple failed login attempts for ${email} from ${ipAddress}`,
        metadata: {
          email,
          ipAddress,
          attempts: recentAttempts.length,
        },
      });
    }
  }

  /**
   * 🔒 مراقبة تغيير IP مفاجئ
   */
  async trackIPChange(userId: string, newIP: string, lastKnownIP: string) {
    // التحقق من تغيير IP خلال فترة قصيرة (مشبوه)
    const ipChange = newIP !== lastKnownIP;
    
    if (ipChange) {
      await this.triggerAlert({
        type: 'IP_CHANGE',
        severity: 'medium',
        message: `User ${userId} logged in from new IP: ${newIP}`,
        userId,
        metadata: {
          newIP,
          lastKnownIP,
        },
      });
    }
  }

  /**
   * 🔒 مراقبة Rate Limiting Triggers
   */
  async trackRateLimit(userId: string | null, endpoint: string, ipAddress: string) {
    await this.triggerAlert({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'medium',
      message: `Rate limit exceeded for ${endpoint}`,
      userId: userId || undefined,
      metadata: {
        endpoint,
        ipAddress,
      },
    });
  }

  /**
   * 🔒 مراقبة محاولات الوصول غير المصرح بها
   */
  async trackUnauthorizedAccess(userId: string, resource: string, action: string) {
    await this.triggerAlert({
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'high',
      message: `Unauthorized access attempt: ${action} on ${resource}`,
      userId,
      metadata: {
        resource,
        action,
      },
    });
  }

  /**
   * 🚨 إرسال تنبيه فوري
   */
  private async triggerAlert(alert: SecurityAlert) {
    // 1. حفظ في Database
    await this.prisma.securityLog.create({
      data: {
        userId: alert.userId,
        action: alert.type,
        ipAddress: alert.metadata?.ipAddress,
        metadata: alert.metadata,
        severity: alert.severity,
      },
    });

    // 2. إرسال عبر WebSocket للمستخدم (إذا كان مسجل)
    if (alert.userId) {
      this.gateway.emitSecurityAlert(alert.userId, {
        id: crypto.randomUUID(),
        ...alert,
        timestamp: new Date(),
      });
    }

    // 3. إرسال للمسؤولين (Admins)
    if (alert.severity === 'critical' || alert.severity === 'high') {
      await this.notifyAdmins(alert);
    }

    // 4. إرسال Email/SMS للتنبيهات الحرجة
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert);
    }
  }

  /**
   * 📧 إشعار المسؤولين
   */
  private async notifyAdmins(alert: SecurityAlert) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of admins) {
      this.gateway.emitSecurityAlert(admin.id, {
        ...alert,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      });
    }
  }

  /**
   * 📧 إرسال تنبيه حرج (Email/SMS)
   */
  private async sendCriticalAlert(alert: SecurityAlert) {
    // إرسال Email للمسؤولين
    // يمكن استخدام EmailService هنا
    console.log('CRITICAL ALERT:', alert);
  }

  /**
   * 📊 الحصول على إحصائيات أمنية
   */
  async getSecurityStats(userId?: string) {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const where = userId ? { userId } : {};

    const [failedLogins, blockedIPs, suspiciousActivity] = await Promise.all([
      this.prisma.securityLog.count({
        where: {
          ...where,
          action: 'LOGIN_FAILED',
          createdAt: { gte: last24Hours },
        },
      }),
      this.prisma.securityLog.count({
        where: {
          ...where,
          action: 'IP_BLOCKED',
          createdAt: { gte: last24Hours },
        },
      }),
      this.prisma.securityLog.count({
        where: {
          ...where,
          severity: { in: ['high', 'critical'] },
          createdAt: { gte: last24Hours },
        },
      }),
    ]);

    return {
      failedLogins,
      blockedIPs,
      suspiciousActivity,
      lastUpdated: new Date(),
    };
  }
}

interface ActivityRecord {
  timestamp: number;
}

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
}
```

### 3. تحديث Security Gateway

```typescript
// apps/api/src/infrastructure/security/security.gateway.ts
// إضافة methods جديدة

/**
 * 🚨 إرسال تنبيه أمني فوري
 */
emitSecurityAlert(userId: string, alert: SecurityAlert) {
  this.server.to(`user:${userId}`).emit('security-alert', alert);
  this.logger.warn(`Security alert sent to user ${userId}: ${alert.message}`);
}

/**
 * 📊 إرسال تحديث للإحصائيات
 */
emitSecurityStats(userId: string, stats: any) {
  this.server.to(`user:${userId}`).emit('security-stats-update', stats);
}
```

---

## 📊 Dashboard Components

### 1. Real-Time Alert Feed

```typescript
// components/security/AlertFeed.tsx
export function AlertFeed() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  return (
    <div className="alert-feed">
      <h3>Live Security Alerts</h3>
      {alerts.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}
    </div>
  );
}
```

### 2. Security Statistics Widgets

```typescript
// components/security/SecurityStats.tsx
export function SecurityStats() {
  const [stats, setStats] = useState({
    failedLogins: 0,
    blockedIPs: 0,
    suspiciousActivity: 0,
  });

  // تحديث كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(async () => {
      const newStats = await fetchSecurityStats();
      setStats(newStats);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stats-grid">
      <StatCard
        title="Failed Logins (24h)"
        value={stats.failedLogins}
        icon={<AlertTriangle />}
        trend="up"
      />
      <StatCard
        title="Blocked IPs (24h)"
        value={stats.blockedIPs}
        icon={<ShieldOff />}
      />
      <StatCard
        title="Suspicious Activity"
        value={stats.suspiciousActivity}
        icon={<AlertCircle />}
        severity="high"
      />
    </div>
  );
}
```

---

## 🎯 أنواع التنبيهات (Alert Types)

### 1. Critical (حرجة) - تنبيه فوري
- ❌ محاولات Brute Force متعددة
- 🚨 محاولات SQL Injection
- 🔒 محاولات Remote Code Execution
- ⚠️ تسريب بيانات حساسة

### 2. High (عالية) - تنبيه سريع
- 🔓 محاولات وصول غير مصرح بها
- 📍 تغيير IP مفاجئ من دولة مختلفة
- 🚫 Rate limit exceeded بشكل كبير

### 3. Medium (متوسطة) - تنبيه عادي
- 🔄 تغيير IP عادي
- 📊 نشاط غير اعتيادي
- ⚡ استخدام API بشكل مكثف

### 4. Low (منخفضة) - معلومات فقط
- ✅ تسجيل دخول ناجح من IP جديد
- 📝 تحديث ملف شخصي
- 🔔 إشعارات عادية

---

## 🔧 Integration مع النظام الحالي

### 1. في Auth Service

```typescript
// apps/api/src/domain/auth/auth.service.ts
async login(email: string, password: string) {
  try {
    const user = await this.validateCredentials(email, password);
    
    // ✅ تسجيل دخول ناجح
    await this.securityMonitoring.trackSuccessfulLogin(user.id, req.ip);
    
    return this.createSession(user.id, email);
  } catch (error) {
    // ❌ تسجيل دخول فاشل
    await this.securityMonitoring.trackFailedLogin(email, req.ip);
    throw error;
  }
}
```

### 2. في Owner Guard

```typescript
// apps/api/src/core/common/guards/owner.guard.ts
async canActivate(context: ExecutionContext) {
  // ... التحقق من الملكية
  
  if (!isOwner) {
    // 🚨 محاولة وصول غير مصرح بها
    await this.securityMonitoring.trackUnauthorizedAccess(
      user.id,
      resourceType,
      'access'
    );
    throw new ForbiddenException();
  }
}
```

### 3. في Rate Limiter

```typescript
// عند تجاوز Rate Limit
async trackRateLimit(userId, endpoint, ipAddress) {
  await this.securityMonitoring.trackRateLimit(userId, endpoint, ipAddress);
}
```

---

## 📱 Notifications Channels

### 1. In-App Notifications (WebSocket)
- ✅ فوري
- ✅ لا يحتاج refresh
- ✅ يعمل في الوقت الفعلي

### 2. Email Alerts
- للتنبيهات الحرجة فقط
- للمسؤولين
- ملخص يومي/أسبوعي

### 3. SMS Alerts (اختياري)
- للتنبيهات الحرجة جداً
- للمسؤولين على call

### 4. Slack/Discord Integration (اختياري)
- للفريق التقني
- ملخصات أسبوعية

---

## 🎨 مثال: Security Dashboard UI

```
┌─────────────────────────────────────────────────┐
│  🔒 Security Monitoring Dashboard              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Failed  │  │ Blocked │  │Suspicious│       │
│  │ Logins  │  │   IPs   │  │ Activity │       │
│  │   12    │  │    3    │  │    5     │       │
│  └─────────┘  └─────────┘  └─────────┘        │
│                                                 │
│  🚨 Live Alerts                                │
│  ─────────────────────────────────────────     │
│  ⚠️  [HIGH] Multiple failed logins from        │
│      192.168.1.100 (5 attempts)               │
│      Just now                                  │
│                                                 │
│  🔔 [MEDIUM] User logged in from new IP        │
│      203.0.113.45 (last: 198.51.100.0)        │
│      2 minutes ago                             │
│                                                 │
│  ✅ [LOW] Successful login from                │
│      192.168.1.50                              │
│      5 minutes ago                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📈 الفوائد

### 1. الاستجابة السريعة
- ✅ معرفة المشاكل فوراً
- ✅ إمكانية التصرف بسرعة
- ✅ تقليل الضرر

### 2. الشفافية
- ✅ المستخدمون يرون نشاطاتهم الأمنية
- ✅ المسؤولون يرون المشاكل مباشرة

### 3. الثقة
- ✅ يزيد ثقة المستخدمين
- ✅ يظهر اهتمامك بالأمان

---

## 🚀 خطوات التطبيق

### المرحلة 1: الأساسيات (يوم واحد)
1. ✅ تحديث SecurityGateway
2. ✅ إنشاء SecurityMonitoringService
3. ✅ إضافة WebSocket events

### المرحلة 2: Integration (يوم واحد)
1. ✅ ربط مع Auth Service
2. ✅ ربط مع Guards
3. ✅ ربط مع Rate Limiter

### المرحلة 3: Frontend (يوم واحد)
1. ✅ إنشاء Security Dashboard
2. ✅ إضافة WebSocket client
3. ✅ إضافة Alert components

### المرحلة 4: Testing (نصف يوم)
1. ✅ اختبار التنبيهات
2. ✅ اختبار WebSocket connection
3. ✅ اختبار Dashboard

---

## 💡 ملاحظات مهمة

1. **Performance**: استخدام Redis للـ caching في Production
2. **Privacy**: إرسال التنبيهات للمستخدمين فقط عن نشاطاتهم
3. **Rate Limiting**: عدم إرسال تنبيهات كثيرة (مثل 1000 في الدقيقة)
4. **Storage**: تنظيف الـ logs القديمة (أكثر من 90 يوم)

---

## 📚 المراجع

- [WebSocket Security Best Practices](https://owasp.org/www-community/vulnerabilities/WebSocket_Security)
- [Real-time Monitoring Patterns](https://martinfowler.com/articles/real-time-application-architecture.html)

