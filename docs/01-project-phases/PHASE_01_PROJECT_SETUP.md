# المرحلة الأولى: إعداد المشروع والبنية الأساسية
# Phase 1: Project Setup & Core Infrastructure

## نظرة عامة | Overview
هذه المرحلة تركز على إعداد البنية التحتية الأساسية للمشروع، تكوين بيئة التطوير، وإنشاء الهيكل الأساسي للتطبيق.

**المدة المتوقعة:** 2-3 أسابيع  
**الأولوية:** عالية جداً  
**الحالة:** 🟡 جاهز للبدء

---

## الأهداف الرئيسية | Main Objectives

### 1. إعداد بيئة التطوير
- ✅ إعداد Monorepo باستخدام npm workspaces
- ✅ تكوين TypeScript للمشروع بالكامل
- ✅ إعداد ESLint و Prettier
- ✅ تكوين Git و Husky للـ pre-commit hooks

### 2. إعداد Backend (NestJS)
- ✅ إنشاء تطبيق NestJS أساسي
- ✅ تكوين PostgreSQL و Prisma
- ✅ إعداد نظام المصادقة (JWT)
- ✅ إعداد Swagger للتوثيق
- ✅ تكوين Redis للتخزين المؤقت

### 3. إعداد Frontend (Next.js)
- ✅ إنشاء تطبيق Next.js 14 بـ App Router
- ✅ تكوين Tailwind CSS و Shadcn/ui
- ✅ إعداد NextAuth.js للمصادقة
- ✅ إنشاء التخطيط الأساسي (Layout)
- ✅ إعداد نظام التوجيه (Routing)

### 4. Docker و DevOps
- ✅ إنشاء Docker Compose للتطوير
- ✅ إعداد PostgreSQL و Redis containers
- ✅ تكوين hot-reload للتطوير

---

## خطوات التنفيذ | Implementation Steps

### المرحلة 1.1: إنشاء هيكل Monorepo

#### 1. إنشاء المجلد الرئيسي
```bash
cd d:\xampp\htdocs\Rukny.io
npm init -y
```

#### 2. تكوين npm workspaces
```json
{
  "name": "rukny-io",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "npm run start:dev --workspace=apps/api",
    "dev:web": "npm run dev --workspace=apps/web",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.50.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  }
}
```

#### 3. إنشاء هيكل المجلدات
```bash
mkdir -p apps/api apps/web packages/ui packages/types packages/database
```

---

### المرحلة 1.2: إعداد Backend (NestJS)

#### 1. إنشاء تطبيق NestJS
```bash
cd apps
npx @nestjs/cli new api
cd api
```

#### 2. تثبيت التبعيات الأساسية
```bash
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client bcryptjs class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/cache-manager cache-manager redis

npm install -D @types/passport-jwt @types/bcryptjs prisma
```

#### 3. تكوين Prisma
```bash
npx prisma init
```

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(BASIC)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profile   Profile?
  stores    Store[]
  events    Event[]
  
  @@map("users")
}

enum Role {
  ADMIN
  PREMIUM
  BASIC
  GUEST
}

model Profile {
  id          String   @id @default(uuid())
  userId      String   @unique
  username    String   @unique
  bio         String?
  avatar      String?
  coverImage  String?
  visibility  Visibility @default(PUBLIC)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  socialLinks SocialLink[]
  
  @@map("profiles")
}

enum Visibility {
  PUBLIC
  PRIVATE
}

model SocialLink {
  id           String   @id @default(uuid())
  profileId    String
  platform     String
  username     String
  url          String
  shortUrl     String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  profile      Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@map("social_links")
}

model Store {
  id           String   @id @default(uuid())
  userId       String
  name         String
  slug         String   @unique
  description  String?
  logo         String?
  banner       String?
  contactEmail String?
  contactPhone String?
  status       StoreStatus @default(ACTIVE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  products     Product[]
  
  @@map("stores")
}

enum StoreStatus {
  ACTIVE
  INACTIVE
}

model Product {
  id          String   @id @default(uuid())
  storeId     String
  name        String
  slug        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  salePrice   Decimal? @db.Decimal(10, 2)
  quantity    Int      @default(0)
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  images      ProductImage[]
  
  @@map("products")
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}

model ProductImage {
  id           String   @id @default(uuid())
  productId    String
  imagePath    String
  displayOrder Int      @default(0)
  isPrimary    Boolean  @default(false)
  createdAt    DateTime @default(now())
  
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@map("product_images")
}

model Event {
  id           String   @id @default(uuid())
  userId       String
  title        String
  slug         String   @unique
  description  String?
  startDate    DateTime
  endDate      DateTime
  location     String?
  venue        String?
  maxAttendees Int?
  price        Decimal? @db.Decimal(10, 2)
  isFeatured   Boolean  @default(false)
  status       EventStatus @default(SCHEDULED)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("events")
}

enum EventStatus {
  SCHEDULED
  ONGOING
  COMPLETED
  CANCELLED
}

model ShortUrl {
  id          String   @id @default(uuid())
  userId      String?
  originalUrl String
  shortCode   String   @unique
  clicks      Int      @default(0)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("short_urls")
}
```

#### 4. ملف البيئة (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rukny_io?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Application
PORT=3001
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

#### 5. إنشاء Module الأساسية

**src/auth/auth.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**src/auth/auth.controller.ts:**
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**src/auth/dto/register.dto.ts:**
```typescript
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

**src/main.ts:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Rukny.io API')
    .setDescription('API documentation for Rukny.io platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

### المرحلة 1.3: إعداد Frontend (Next.js)

#### 1. إنشاء تطبيق Next.js
```bash
cd apps
npx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*"
cd web
```

#### 2. تثبيت التبعيات
```bash
npm install next-auth zustand axios react-hook-form zod
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node
```

#### 3. تثبيت Shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

#### 4. تكوين NextAuth

**src/app/api/auth/[...nextauth]/route.ts:**
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.user) {
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.access_token,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
```

#### 5. التخطيط الأساسي

**src/app/layout.tsx:**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rukny.io - Your Digital Profile',
  description: 'Create your professional profile with social links, store, and events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**src/app/page.tsx:**
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          Welcome to <span className="text-blue-600">Rukny.io</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create your digital presence in minutes
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

---

### المرحلة 1.4: Docker و DevOps

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: rukny_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: rukny_io
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rukny_network

  redis:
    image: redis:6-alpine
    container_name: rukny_redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - rukny_network

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4
    container_name: rukny_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@rukny.io
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '5050:80'
    depends_on:
      - postgres
    networks:
      - rukny_network

volumes:
  postgres_data:
  redis_data:

networks:
  rukny_network:
    driver: bridge
```

---

## المخرجات المتوقعة | Expected Deliverables

### ✅ قائمة التحقق
- [ ] Monorepo مُعد وجاهز
- [ ] NestJS API يعمل على المنفذ 3001
- [ ] Next.js Frontend يعمل على المنفذ 3000
- [ ] PostgreSQL متصل وجاهز
- [ ] Redis يعمل
- [ ] Swagger docs متاح على `/api/docs`
- [ ] نظام المصادقة يعمل (تسجيل/تسجيل دخول)
- [ ] Prisma migrations منفذة
- [ ] ESLint و Prettier مكونة
- [ ] Git hooks تعمل

### 📁 الملفات الأساسية
```
rukny-io/
├── apps/
│   ├── api/              ✅ NestJS Backend
│   └── web/              ✅ Next.js Frontend
├── packages/
│   ├── ui/               ⏳ للمرحلة القادمة
│   ├── types/            ⏳ للمرحلة القادمة
│   └── database/         ✅ Prisma Schema
├── docker-compose.yml    ✅
├── .gitignore           ✅
├── .prettierrc          ✅
├── .eslintrc.json       ✅
└── package.json         ✅
```

---

## اختبار المرحلة | Phase Testing

### 1. اختبار Backend
```bash
# تشغيل API
cd apps/api
npm run start:dev

# اختبار Swagger
# فتح المتصفح: http://localhost:3001/api/docs

# اختبار التسجيل
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. اختبار Frontend
```bash
# تشغيل Frontend
cd apps/web
npm run dev

# فتح المتصفح: http://localhost:3000
```

### 3. اختبار Database
```bash
# تنفيذ migrations
cd apps/api
npx prisma migrate dev --name init

# فتح Prisma Studio
npx prisma studio
```

---

## المشاكل المحتملة والحلول | Troubleshooting

### مشكلة: PostgreSQL لا يعمل
**الحل:**
```bash
docker-compose down
docker-compose up -d postgres
```

### مشكلة: Port مستخدم
**الحل:**
```bash
# Windows PowerShell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### مشكلة: Prisma migration فشل
**الحل:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

---

## الخطوة التالية | Next Steps

بعد إتمام المرحلة الأولى بنجاح، انتقل إلى:
📄 **المرحلة الثانية:** `PHASE_02_USER_PROFILES.md`

---

**تاريخ الإنشاء:** 24 أكتوبر 2025  
**آخر تحديث:** 24 أكتوبر 2025  
**الحالة:** 🟡 جاهز للتنفيذ
