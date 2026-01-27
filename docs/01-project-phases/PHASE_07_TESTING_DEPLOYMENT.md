# المرحلة السابعة: الاختبارات والنشر
# Phase 7: Testing & Deployment

## نظرة عامة | Overview
المرحلة النهائية التي تركز على الاختبارات الشاملة، تحسين الأداء، والنشر للإنتاج.

**المدة المتوقعة:** 2-3 أسابيع  
**الأولوية:** عالية جداً  
**الحالة:** 🔵 في الانتظار (بعد المرحلة 6)

---

## الأهداف الرئيسية | Main Objectives

### 1. الاختبارات
- ✅ Unit Tests (اختبارات الوحدة)
- ✅ Integration Tests (اختبارات التكامل)
- ✅ E2E Tests (اختبارات شاملة)
- ✅ Performance Tests (اختبارات الأداء)

### 2. تحسين الأداء
- ✅ تحسين قاعدة البيانات
- ✅ تحسين التخزين المؤقت
- ✅ تحسين الصور
- ✅ Code splitting

### 3. الأمان
- ✅ اختبارات الأمان
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS configuration

### 4. النشر
- ✅ إعداد Production environment
- ✅ CI/CD pipeline
- ✅ Monitoring setup
- ✅ Backup strategy

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 7.1: Unit Tests

#### 1. Backend Tests

**apps/api/src/auth/auth.service.spec.ts:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        ...registerDto,
        password: await bcrypt.hash(registerDto.password, 10),
        role: 'BASIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(registerDto.email);
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        name: 'Test User',
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        role: 'BASIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
    });
  });
});
```

**apps/api/src/profiles/profiles.service.spec.ts:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a profile', async () => {
      const createDto = {
        username: 'testuser',
        bio: 'Test bio',
      };

      const mockProfile = {
        id: '1',
        userId: 'user-1',
        ...createDto,
        avatar: null,
        coverImage: null,
        visibility: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.profile, 'create').mockResolvedValue(mockProfile as any);

      const result = await service.create('user-1', createDto);

      expect(result.username).toBe(createDto.username);
    });

    it('should throw error if username exists', async () => {
      const createDto = {
        username: 'testuser',
        bio: 'Test bio',
      };

      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({} as any);

      await expect(service.create('user-1', createDto)).rejects.toThrow(ConflictException);
    });
  });
});
```

#### 2. Frontend Tests

**apps/web/src/components/ui/button.test.tsx:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });
});
```

---

### المرحلة 7.2: E2E Tests

**apps/web/tests/auth.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[data-testid=name]', 'Test User');
    await page.fill('[data-testid=email]', `test${Date.now()}@example.com`);
    await page.fill('[data-testid=password]', 'password123');

    await page.click('[data-testid=register-button]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('user can login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password123');

    await page.click('[data-testid=login-button]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid=email]', 'invalid@example.com');
    await page.fill('[data-testid=password]', 'wrongpassword');

    await page.click('[data-testid=login-button]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

**apps/web/tests/profile.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
  });

  test('user can create profile', async ({ page }) => {
    await page.goto('/dashboard/profile/create');

    await page.fill('[data-testid=username]', `user${Date.now()}`);
    await page.fill('[data-testid=bio]', 'This is my test bio');

    await page.click('[data-testid=create-profile-button]');

    await expect(page.locator('text=Profile created')).toBeVisible();
  });

  test('user can view their profile', async ({ page }) => {
    await page.goto('/dashboard/profile');

    await expect(page.locator('[data-testid=profile-username]')).toBeVisible();
    await expect(page.locator('[data-testid=profile-bio]')).toBeVisible();
  });
});
```

---

### المرحلة 7.3: Performance Optimization

#### 1. Database Indexing

```sql
-- Add indexes for better query performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_social_links_profile_id ON social_links(profile_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 2. Caching Strategy

**apps/api/src/common/decorators/cache.decorator.ts:**
```typescript
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_metadata';
export const CACHE_TTL = 'cache_ttl';

export const CacheResult = (ttl = 300) => SetMetadata(CACHE_TTL, ttl);
```

**apps/api/src/common/interceptors/cache.interceptor.ts:**
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_TTL } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ttl = this.reflector.get(CACHE_TTL, context.getHandler());
    
    if (!ttl) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.method}:${request.url}`;

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, ttl);
      }),
    );
  }
}
```

#### 3. Image Optimization

**apps/web/next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cloudinary.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
```

---

### المرحلة 7.4: Security Hardening

#### 1. Rate Limiting

**apps/api/src/main.ts:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3001);
}
bootstrap();
```

#### 2. Input Sanitization

**apps/api/src/common/pipes/sanitize.pipe.ts:**
```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as xss from 'xss';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return xss(value);
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        if (typeof value[key] === 'string') {
          sanitized[key] = xss(value[key]);
        } else {
          sanitized[key] = value[key];
        }
      }
      return sanitized;
    }

    return value;
  }
}
```

---

### المرحلة 7.5: Deployment

#### 1. Production Environment

**apps/api/.env.production:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/rukny_io_prod"
REDIS_HOST="redis-prod.example.com"
REDIS_PORT=6379
JWT_SECRET="production-secret-key"
STRIPE_SECRET_KEY="sk_live_..."
FRONTEND_URL="https://rukny.io"
```

#### 2. CI/CD Pipeline

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run API tests
        run: |
          cd apps/api
          npm run test
          npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run Frontend tests
        run: |
          cd apps/web
          npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/rukny-io
            git pull origin main
            npm ci
            npm run build
            pm2 restart all
```

#### 3. Docker Production Setup

**docker-compose.production.yml:**
```yaml
version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.production
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - api

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=rukny_io
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:6-alpine
    restart: always
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: always

volumes:
  postgres_data:
  redis_data:
```

#### 4. Monitoring Setup

**docker-compose.monitoring.yml:**
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق النهائية

#### Testing
- [ ] Unit tests للـ Backend (coverage > 80%)
- [ ] Unit tests للـ Frontend
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Security tests

#### Optimization
- [ ] Database indexes
- [ ] Caching implemented
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle size optimization

#### Security
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CORS configured
- [ ] Security headers
- [ ] SSL certificate

#### Deployment
- [ ] Production environment
- [ ] CI/CD pipeline
- [ ] Docker setup
- [ ] Monitoring tools
- [ ] Backup strategy
- [ ] Documentation updated

---

## Launch Checklist | قائمة الإطلاق

### قبل الإطلاق
- [ ] جميع الاختبارات تعمل بنجاح
- [ ] الأداء محسّن
- [ ] الأمان محقق
- [ ] النسخ الاحتياطي جاهز
- [ ] المراقبة مفعّلة
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Email service configured

### بعد الإطلاق
- [ ] مراقبة الأداء
- [ ] تتبع الأخطاء
- [ ] دعم المستخدمين
- [ ] جمع التعليقات
- [ ] تحسين مستمر

---

## 🎉 تهانينا! المشروع جاهز للإطلاق

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**الحالة:** ✅ المشروع مكتمل وجاهز للإنتاج
