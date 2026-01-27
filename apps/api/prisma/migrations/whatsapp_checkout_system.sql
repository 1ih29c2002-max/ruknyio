-- =====================================================
-- 📱 WhatsApp Checkout System Migration
-- =====================================================
-- Date: 2026-01-14
-- Description: Add WhatsApp OTP and checkout support
-- =====================================================

-- =================== ENUMS ===================

-- نوع حساب المستخدم
CREATE TYPE "AccountType" AS ENUM ('REGULAR', 'GUEST_CHECKOUT');

-- نوع رمز OTP
CREATE TYPE "OtpType" AS ENUM ('CHECKOUT', 'LOGIN', 'VERIFICATION');

-- قناة إرسال الرسائل
CREATE TYPE "MessageChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS');

-- حالة الإشعار
CREATE TYPE "WhatsappNotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- نوع إشعار واتساب
CREATE TYPE "WhatsappNotificationType" AS ENUM (
  'OTP', 
  'ORDER_CONFIRMED', 
  'ORDER_PROCESSING', 
  'ORDER_SHIPPED', 
  'ORDER_OUT_FOR_DELIVERY', 
  'ORDER_DELIVERED', 
  'ORDER_CANCELLED'
);

-- =================== USER TABLE UPDATE ===================

-- إضافة حقول جديدة لجدول المستخدمين
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accountType" "AccountType" DEFAULT 'REGULAR';

-- إنشاء فهرس فريد على phoneNumber
CREATE UNIQUE INDEX IF NOT EXISTS "users_phoneNumber_key" ON "users"("phoneNumber");

-- إنشاء فهرس للبحث
CREATE INDEX IF NOT EXISTS "users_phoneNumber_idx" ON "users"("phoneNumber");

-- =================== WHATSAPP OTP TABLE ===================

-- جدول رموز OTP - 🔒 يخزن Hash فقط، لا نخزن النص الصريح أبداً
CREATE TABLE IF NOT EXISTS "whatsapp_otps" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "phoneNumber" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,           -- 🔒 bcrypt hash - لا نخزن الرمز الصريح
  "type" "OtpType" NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentVia" "MessageChannel" NOT NULL DEFAULT 'WHATSAPP',

  CONSTRAINT "whatsapp_otps_pkey" PRIMARY KEY ("id")
);

-- Foreign key
ALTER TABLE "whatsapp_otps" ADD CONSTRAINT "whatsapp_otps_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "whatsapp_otps_phoneNumber_idx" ON "whatsapp_otps"("phoneNumber");
CREATE INDEX IF NOT EXISTS "whatsapp_otps_expiresAt_idx" ON "whatsapp_otps"("expiresAt");
CREATE INDEX IF NOT EXISTS "whatsapp_otps_verified_idx" ON "whatsapp_otps"("verified");

-- =================== WHATSAPP NOTIFICATION TABLE ===================

-- جدول إشعارات واتساب
CREATE TABLE IF NOT EXISTS "whatsapp_notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "phoneNumber" TEXT NOT NULL,
  "type" "WhatsappNotificationType" NOT NULL,
  "template" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "WhatsappNotificationStatus" NOT NULL DEFAULT 'PENDING',
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "orderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "whatsapp_notifications_pkey" PRIMARY KEY ("id")
);

-- Foreign key
ALTER TABLE "whatsapp_notifications" ADD CONSTRAINT "whatsapp_notifications_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "whatsapp_notifications_phoneNumber_idx" ON "whatsapp_notifications"("phoneNumber");
CREATE INDEX IF NOT EXISTS "whatsapp_notifications_status_idx" ON "whatsapp_notifications"("status");
CREATE INDEX IF NOT EXISTS "whatsapp_notifications_orderId_idx" ON "whatsapp_notifications"("orderId");
CREATE INDEX IF NOT EXISTS "whatsapp_notifications_createdAt_idx" ON "whatsapp_notifications"("createdAt");

-- =====================================================
-- 🔐 SECURITY NOTES
-- =====================================================
-- 1. OTP codes are NEVER stored in plain text
-- 2. We store bcrypt hash of OTP (codeHash field)
-- 3. Verification is done via bcrypt.compare()
-- 4. OTPs expire after 10 minutes
-- 5. Max 3 attempts per OTP
-- 6. Rate limit: 3 OTPs per phone per 15 minutes
-- =====================================================
