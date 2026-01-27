# 📚 دليل نشر مشروع Rukny.io على VPS

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#نظرة-عامة-على-المشروع)
2. [البنية التقنية](#البنية-التقنية)
3. [متطلبات النظام](#متطلبات-النظام)
4. [إعداد VPS](#إعداد-vps)
5. [تثبيت المتطلبات](#تثبيت-المتطلبات)
6. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
7. [متغيرات البيئة](#متغيرات-البيئة)
8. [النشر باستخدام Docker](#النشر-باستخدام-docker)
9. [النشر باستخدام PM2](#النشر-باستخدام-pm2)
10. [إعداد Nginx](#إعداد-nginx)
11. [إعداد SSL](#إعداد-ssl)
12. [المراقبة والصيانة](#المراقبة-والصيانة)
13. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 نظرة عامة على المشروع

**Rukny.io** هو منصة متكاملة لإدارة الأعمال تتضمن:

- 🏪 **إدارة المتجر** - منتجات، طلبات، فئات، تحليلات
- 📝 **نظام النماذج** - إنشاء نماذج ديناميكية مع ردود
- 📅 **إدارة الفعاليات** - تذاكر، حضور، منظمين
- ✅ **نظام المهام** - إدارة المهام والتذكيرات
- 🔗 **روابط الملف الشخصي** - صفحة bio links مخصصة
- 🔔 **نظام الإشعارات** - إشعارات فورية

---

## 🏗️ البنية التقنية

### Monorepo Structure (Turborepo)

```
Rukny.io/
├── apps/
│   ├── api/              # NestJS Backend API
│   │   ├── prisma/       # Database Schema & Migrations
│   │   └── src/          # Source Code
│   └── web/              # Next.js Frontend
│       ├── app/          # App Router Pages
│       ├── components/   # React Components
│       └── lib/          # Utilities & Auth
├── packages/
│   ├── database/         # Prisma Client Package
│   ├── types/            # Shared TypeScript Types
│   └── ui/               # Shared UI Components
└── docs/                 # Documentation
```

### التقنيات المستخدمة

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| **Frontend** | Next.js (App Router) | 14.x |
| **Backend** | NestJS | 10.x |
| **ORM** | Prisma | 5.x |
| **Database** | PostgreSQL (Supabase) | 15.x |
| **Auth** | Supabase Auth | - |
| **Storage** | Supabase Storage | - |
| **Styling** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui | - |
| **Animations** | Framer Motion | 12.x |
| **Icons** | Lucide React | 0.5x |
| **Package Manager** | pnpm | 8.x |
| **Monorepo** | Turborepo | 2.x |

---

## 💻 متطلبات النظام

### الحد الأدنى لـ VPS

| المتطلب | الحد الأدنى | المُوصى |
|---------|-------------|---------|
| **RAM** | 2GB | 4GB+ |
| **CPU** | 1 Core | 2+ Cores |
| **Storage** | 20GB SSD | 40GB+ SSD |
| **Bandwidth** | 1TB | 2TB+ |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### البرمجيات المطلوبة

| البرنامج | الإصدار |
|----------|---------|
| Node.js | 18.x+ (يُفضل 20 LTS) |
| pnpm | 8.x+ |
| PostgreSQL | 15.x+ (أو Supabase) |
| Nginx | 1.24+ |
| Docker | 24.x+ (اختياري) |
| Git | 2.x+ |

---

## 🖥️ إعداد VPS

### 1. تحديث النظام

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. إنشاء مستخدم غير root

```bash
# إنشاء مستخدم جديد
sudo adduser rukny

# إضافة صلاحيات sudo
sudo usermod -aG sudo rukny

# تبديل للمستخدم الجديد
su - rukny
```

### 3. إعداد Firewall

```bash
# تفعيل UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# التحقق من الحالة
sudo ufw status
```

### 4. إعداد SSH Keys (اختياري لكن مُوصى)

```bash
# على جهازك المحلي
ssh-keygen -t ed25519 -C "your-email@example.com"

# نسخ المفتاح للسيرفر
ssh-copy-id rukny@your-server-ip
```

---

## 📦 تثبيت المتطلبات

### 1. تثبيت Node.js (باستخدام nvm)

```bash
# تثبيت nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# تحميل nvm
source ~/.bashrc

# تثبيت Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# التحقق
node --version
npm --version
```

### 2. تثبيت pnpm

```bash
npm install -g pnpm

# التحقق
pnpm --version
```

### 3. تثبيت Git

```bash
sudo apt install git -y

# إعداد Git
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 4. تثبيت Nginx

```bash
sudo apt install nginx -y

# تشغيل Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# التحقق
sudo systemctl status nginx
```

### 5. تثبيت PM2

```bash
npm install -g pm2

# التحقق
pm2 --version
```

---

## 🗄️ إعداد قاعدة البيانات

### الخيار 1: استخدام Supabase Cloud (مُوصى)

1. إنشاء حساب على [supabase.com](https://supabase.com)
2. إنشاء مشروع جديد
3. الحصول على Connection String من Settings > Database

```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### الخيار 2: PostgreSQL محلي على VPS

```bash
# تثبيت PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# تشغيل PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# إنشاء قاعدة بيانات
sudo -u postgres psql

# داخل PostgreSQL
CREATE USER rukny WITH PASSWORD 'your-secure-password';
CREATE DATABASE rukny_db OWNER rukny;
GRANT ALL PRIVILEGES ON DATABASE rukny_db TO rukny;
\q
```

```
DATABASE_URL="postgresql://rukny:your-secure-password@localhost:5432/rukny_db"
DIRECT_URL="postgresql://rukny:your-secure-password@localhost:5432/rukny_db"
```

---

## 🔐 متغيرات البيئة

### إنشاء ملف `.env.production`

#### للـ Frontend (apps/web/.env.production)

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://rukny.io
NEXT_PUBLIC_API_URL=https://api.rukny.io

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Analytics (اختياري)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### للـ Backend (apps/api/.env.production)

```env
# App
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d

# CORS
CORS_ORIGINS=https://rukny.io,https://www.rukny.io

# Storage
UPLOAD_PATH=/var/www/rukny/uploads
MAX_FILE_SIZE=10485760
```

---

## 🐳 النشر باستخدام Docker (مُوصى)

### 1. تثبيت Docker

```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم لمجموعة docker
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo apt install docker-compose-plugin -y

# التحقق
docker --version
docker compose version
```

### 2. إنشاء Dockerfile للـ Web

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 3. إنشاء Dockerfile للـ API

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### 4. تحديث docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./apps/web/.env.production
    restart: unless-stopped
    networks:
      - rukny-network

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./apps/api/.env.production
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - rukny-network
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: rukny
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: rukny_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - rukny-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./certbot/www:/var/www/certbot
    depends_on:
      - web
      - api
    restart: unless-stopped
    networks:
      - rukny-network

networks:
  rukny-network:
    driver: bridge

volumes:
  postgres_data:
```

### 5. أوامر Docker

```bash
# بناء الصور
docker compose build

# تشغيل الخدمات
docker compose up -d

# عرض السجلات
docker compose logs -f

# إيقاف الخدمات
docker compose down

# تشغيل Prisma migrations
docker compose exec api pnpm prisma migrate deploy
```

---

## 🚀 النشر باستخدام PM2 (بدون Docker)

### 1. استنساخ المشروع

```bash
cd /var/www
sudo mkdir rukny
sudo chown $USER:$USER rukny
cd rukny

git clone https://github.com/your-repo/rukny.io.git .
```

### 2. تثبيت المكتبات

```bash
pnpm install
```

### 3. إعداد Prisma

```bash
# توليد Prisma Client
cd apps/api
pnpm prisma generate

# تطبيق Migrations
pnpm prisma migrate deploy

# (اختياري) تعبئة بيانات أولية
pnpm prisma db seed
```

### 4. بناء المشروع

```bash
# العودة للجذر
cd /var/www/rukny

# بناء كل التطبيقات
pnpm build
```

### 5. إعداد PM2

```bash
# إنشاء ملف ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'rukny-web',
      cwd: './apps/web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'rukny-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
EOF
```

### 6. تشغيل PM2

```bash
# تشغيل التطبيقات
pm2 start ecosystem.config.js

# حفظ قائمة التطبيقات
pm2 save

# إعداد التشغيل التلقائي عند إعادة التشغيل
pm2 startup

# عرض الحالة
pm2 status

# عرض السجلات
pm2 logs
```

---

## 🌐 إعداد Nginx

### 1. إنشاء ملف التكوين

```bash
sudo nano /etc/nginx/sites-available/rukny.io
```

```nginx
# Upstream للـ Frontend
upstream web_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Upstream للـ API
upstream api_upstream {
    server 127.0.0.1:4000;
    keepalive 64;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name rukny.io www.rukny.io api.rukny.io;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# Main Website
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rukny.io www.rukny.io;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/rukny.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rukny.io/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Static Files
    location /_next/static {
        proxy_cache_valid 60m;
        proxy_pass http://web_upstream;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://web_upstream;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Main App
    location / {
        proxy_pass http://web_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.rukny.io;

    ssl_certificate /etc/letsencrypt/live/rukny.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rukny.io/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Upload limit
    client_max_body_size 50M;

    location / {
        proxy_pass http://api_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads directory
    location /uploads {
        alias /var/www/rukny/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. تفعيل الموقع

```bash
# إنشاء رابط
sudo ln -s /etc/nginx/sites-available/rukny.io /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

## 🔒 إعداد SSL (Let's Encrypt)

### 1. تثبيت Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. الحصول على الشهادة

```bash
sudo certbot --nginx -d rukny.io -d www.rukny.io -d api.rukny.io
```

### 3. التجديد التلقائي

```bash
# اختبار التجديد
sudo certbot renew --dry-run

# إضافة cron job للتجديد
sudo crontab -e
# أضف:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 المراقبة والصيانة

### 1. مراقبة PM2

```bash
# لوحة المراقبة
pm2 monit

# عرض الحالة
pm2 status

# عرض السجلات المباشرة
pm2 logs

# إعادة تشغيل تطبيق
pm2 restart rukny-web
pm2 restart rukny-api

# إعادة تشغيل الكل
pm2 restart all
```

### 2. سجلات النظام

```bash
# سجلات Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# سجلات PM2
pm2 logs --lines 100
```

### 3. النسخ الاحتياطي لقاعدة البيانات

```bash
# إنشاء سكريبت النسخ الاحتياطي
cat > /home/rukny/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/rukny/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="rukny_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U rukny rukny_db > $BACKUP_DIR/$FILENAME

# Compress
gzip $BACKUP_DIR/$FILENAME

# Delete backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
EOF

chmod +x /home/rukny/backup.sh

# إضافة cron job
crontab -e
# أضف:
0 2 * * * /home/rukny/backup.sh
```

### 4. تحديث المشروع

```bash
#!/bin/bash
# update.sh

cd /var/www/rukny

# سحب التحديثات
git pull origin main

# تثبيت المكتبات الجديدة
pnpm install

# تحديث Prisma
cd apps/api
pnpm prisma generate
pnpm prisma migrate deploy
cd ../..

# إعادة البناء
pnpm build

# إعادة تشغيل PM2
pm2 restart all

echo "Update completed!"
```

---

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. خطأ في Prisma Connection

```bash
# التحقق من اتصال قاعدة البيانات
cd apps/api
pnpm prisma db pull

# إعادة توليد Client
pnpm prisma generate
```

#### 2. خطأ في الذاكرة

```bash
# زيادة ذاكرة Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# أو في PM2
pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"
```

#### 3. خطأ 502 Bad Gateway

```bash
# التحقق من تشغيل التطبيقات
pm2 status

# التحقق من السجلات
pm2 logs

# التحقق من Nginx
sudo nginx -t
sudo systemctl status nginx
```

#### 4. خطأ في الصلاحيات

```bash
# إصلاح صلاحيات المجلد
sudo chown -R $USER:$USER /var/www/rukny
chmod -R 755 /var/www/rukny
```

#### 5. خطأ CORS

```bash
# التأكد من إعداد CORS في API
# في apps/api/.env.production
CORS_ORIGINS=https://rukny.io,https://www.rukny.io
```

---

## 📝 قائمة التحقق قبل النشر

- [ ] إعداد VPS وتحديث النظام
- [ ] تثبيت Node.js, pnpm, Git
- [ ] تثبيت وإعداد PostgreSQL أو Supabase
- [ ] إنشاء ملفات `.env.production`
- [ ] استنساخ المشروع
- [ ] تشغيل Prisma migrations
- [ ] بناء المشروع
- [ ] تثبيت وإعداد PM2 أو Docker
- [ ] تثبيت وإعداد Nginx
- [ ] الحصول على شهادة SSL
- [ ] إعداد Firewall
- [ ] إعداد النسخ الاحتياطي
- [ ] اختبار جميع الصفحات والـ APIs

---

## 🎉 الخلاصة

مبروك! مشروع Rukny.io جاهز للنشر على VPS.

### موارد إضافية

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Documentation](https://docs.nestjs.com)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)

### الدعم

للمساعدة أو الاستفسارات:
- 📧 Email: support@rukny.io
- 📖 Docs: /docs

---

*آخر تحديث: 4 يناير 2026*
