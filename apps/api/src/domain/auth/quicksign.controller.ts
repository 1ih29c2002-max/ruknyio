import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { QuickSignService } from './quicksign.service';
import { IpVerificationService } from './ip-verification.service';
import { TokenService } from './token.service';
import { TwoFactorService } from './two-factor.service';
import { PendingTwoFactorService } from './pending-two-factor.service';
import { AccountLockoutService } from './account-lockout.service';
import { EmailService } from '../../integrations/email/email.service';
import { SecurityLogService } from '../../infrastructure/security/log.service';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RequestQuickSignDto, ResendQuickSignDto, VerifyIPCodeDto, CompleteProfileDto, CheckUsernameDto } from './dto';
import { UAParser } from 'ua-parser-js';
import * as crypto from 'crypto';
import { QuickSignType, VerificationType } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { RedisOAuthCodeService } from './redis-oauth-code.service';
import { 
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setCsrfTokenCookie,
  generateCsrfToken,
} from './cookie.config';

// Throttle policies:
// - Production: strict limits to prevent abuse
// - Development: more lenient to avoid blocking local/mobile testing
const QUICK_SIGN_REQUEST_THROTTLE =
  process.env.NODE_ENV === 'production'
    ? { default: { limit: 3, ttl: 900000 } } // 3 requests per 15 minutes
    : { default: { limit: 20, ttl: 60000 } }; // 20 requests per 1 minute

const QUICK_SIGN_RESEND_THROTTLE =
  process.env.NODE_ENV === 'production'
    ? { default: { limit: 2, ttl: 60000 } } // 2 requests per minute
    : { default: { limit: 30, ttl: 60000 } }; // 30 requests per minute

@ApiTags('QuickSign Authentication')
@Controller('auth/quicksign')
export class QuickSignController {
  constructor(
    private quickSignService: QuickSignService,
    private ipVerificationService: IpVerificationService,
    private tokenService: TokenService,
    private twoFactorService: TwoFactorService,
    private pendingTwoFactorService: PendingTwoFactorService,
    private accountLockoutService: AccountLockoutService,
    private emailService: EmailService,
    private securityLogService: SecurityLogService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsGateway: NotificationsGateway,
    private oauthCodeService: RedisOAuthCodeService,
  ) {}

  /**
   * طلب QuickSign link
   * POST /auth/quicksign/request
   */
  @Post('request')
  @HttpCode(HttpStatus.OK)
  @Throttle(QUICK_SIGN_REQUEST_THROTTLE)
  @ApiOperation({ summary: 'طلب رابط QuickSign للدخول السريع' })
  @ApiResponse({ status: 200, description: 'تم إرسال الرابط بنجاح' })
  @ApiResponse({ status: 429, description: 'تجاوزت الحد المسموح من الطلبات' })
  @ApiResponse({ status: 403, description: 'الحساب مقفل' })
  async requestQuickSign(
    @Body() dto: RequestQuickSignDto,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    // 🔒 التحقق من قفل الحساب قبل إرسال الرابط
    const lockoutCheck = await this.accountLockoutService.checkBeforeAttempt(dto.email, ipAddress);
    if (!lockoutCheck.allowed) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Account Locked',
        message: lockoutCheck.message,
        lockoutUntil: lockoutCheck.lockoutUntil,
        lockoutMinutes: lockoutCheck.lockoutMinutes,
      });
    }

    // Parse device info
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // إبطال جميع الروابط السابقة لنفس البريد
    await this.quickSignService.invalidateAllForEmail(dto.email);

    // إنشاء QuickSign link جديد
    const { token, type } = await this.quickSignService.generateQuickSign(
      dto.email,
      ipAddress,
      userAgent,
    );

    // ⚡ إرسال البريد الإلكتروني بشكل غير متزامن (fire and forget)
    // هذا يحسن الأداء بشكل كبير - المستخدم لا ينتظر إرسال البريد
    const deviceInfo = {
      ipAddress,
      browser: result.browser.name,
      os: result.os.name,
      deviceType: result.device.type || 'desktop',
    };

    // إرسال البريد في الخلفية (لا ننتظر)
    if (type === QuickSignType.LOGIN) {
      this.emailService.sendQuickSignLogin(dto.email, token, deviceInfo).catch((error) => {
        console.error('[QuickSign] Failed to send login email:', error);
        // لا نرمي الخطأ - البريد فشل لكن الطلب نجح
      });
    } else {
      this.emailService.sendQuickSignSignup(dto.email, token, deviceInfo).catch((error) => {
        console.error('[QuickSign] Failed to send signup email:', error);
        // لا نرمي الخطأ - البريد فشل لكن الطلب نجح
      });
    }

    // ⚡ Security log بشكل غير متزامن أيضاً
    this.securityLogService.createLog({
      userId: null,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: `طلب QuickSign ${type === QuickSignType.LOGIN ? 'للدخول' : 'للتسجيل'}: ${dto.email}`,
      ipAddress,
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
      userAgent,
    }).catch((error) => {
      console.error('[QuickSign] Failed to create security log:', error);
      // لا نرمي الخطأ - التسجيل فشل لكن الطلب نجح
    });

    // ⚡ إرجاع الاستجابة فوراً بدون انتظار البريد أو التسجيل
    return {
      success: true,
      message: type === QuickSignType.LOGIN
        ? 'تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني'
        : 'تم إرسال رابط التسجيل إلى بريدك الإلكتروني',
      type,
      expiresIn: 600, // 10 minutes in seconds
    };
  }

  /**
   * فحص صلاحية token بدون استهلاكه
   * GET /auth/quicksign/check-token
   * يستخدم من الفرونت للتأكد من صلاحية الرابط قبل عرض صفحة إكمال الملف
   */
  @Get('check-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فحص صلاحية QuickSign token بدون استهلاكه' })
  @ApiResponse({ status: 200, description: 'نتيجة فحص الـ token' })
  async checkToken(
    @Query('token') token: string,
  ) {
    if (!token) {
      return {
        valid: false,
        error: 'missing_token',
        message: 'لم يتم تقديم token',
      };
    }

    // التحقق من Token بدون استهلاكه
    const verification = await this.quickSignService.verifyQuickSign(token);

    return {
      valid: verification.valid,
      used: verification.used || false,
      expired: verification.expired || false,
      type: verification.type || null,
      email: verification.valid ? verification.email : null,
    };
  }

  /**
   * التحقق من QuickSign token
   * GET /auth/quicksign/verify/:token
   */
  @Get('verify/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'التحقق من صلاحية QuickSign token' })
  @ApiResponse({ status: 200, description: 'Token صالح' })
  @ApiResponse({ status: 401, description: 'Token غير صالح أو منتهي' })
  async verifyQuickSign(
    @Param('token') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // التحقق من Token
    const verification = await this.quickSignService.verifyQuickSign(token);

    if (!verification.valid) {
      // 🔒 تسجيل المحاولة الفاشلة
      if (verification.email) {
        await this.accountLockoutService.recordFailedAttempt(
          verification.email,
          ipAddress,
          verification.used ? 'Link already used' : verification.expired ? 'Link expired' : 'Invalid link',
        );
      }

      // Redirect to frontend with error instead of throwing exception
      if (verification.used) {
        const errorUrl = `${frontendUrl}/auth/verify?error=used&message=${encodeURIComponent('هذا الرابط تم استخدامه مسبقاً')}`;
        console.log('🔄 Redirecting to error page (used):', errorUrl);
        return res.redirect(errorUrl);
      }
      if (verification.expired) {
        const errorUrl = `${frontendUrl}/auth/verify?error=expired&message=${encodeURIComponent('انتهت صلاحية هذا الرابط')}`;
        console.log('🔄 Redirecting to error page (expired):', errorUrl);
        return res.redirect(errorUrl);
      }
      const errorUrl = `${frontendUrl}/auth/verify?error=invalid&message=${encodeURIComponent('رابط غير صالح')}`;
      console.log('🔄 Redirecting to error page (invalid):', errorUrl);
      return res.redirect(errorUrl);
    }

    // Parse device info
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // حالة المستخدم الجديد (SIGNUP)
    if (verification.type === QuickSignType.SIGNUP) {
      // لا نعلم الرابط كمستخدم هنا - سيتم تعليمه عند إكمال الملف الشخصي
      // Redirect لصفحة إكمال الملف الشخصي مع الـ token
      const redirectUrl = `${frontendUrl}/complete-profile?email=${encodeURIComponent(verification.email)}&token=${encodeURIComponent(token)}`;
      console.log('🔄 Redirecting to complete-profile:', redirectUrl);
      return res.redirect(redirectUrl);
    }

    // حالة المستخدم الموجود (LOGIN)
    if (!verification.userId) {
      throw new UnauthorizedException('خطأ في التحقق من المستخدم');
    }

    // 🔐 فحص تغيير IP وإرسال تنبيه إذا لزم الأمر
    const ipCheck = await this.ipVerificationService.checkLoginIP(
      verification.userId,
      ipAddress,
    );

    // إرسال تنبيه إذا كان IP جديد (بدون طلب تحقق - لأن 2FA كافٍ)
    if (ipCheck.isNewIP && ipCheck.shouldAlert) {
      const user = await this.prisma.user.findUnique({
        where: { id: verification.userId },
        select: { 
          email: true,
          profile: { select: { name: true } },
        },
      });

      if (user) {
        // إرسال تنبيه فقط (بدون طلب تحقق)
        await this.emailService.sendLoginAlert(
          user.email,
          user.profile?.name || 'مستخدم',
          {
            success: true,
            ipAddress: ipCheck.maskedIP, // IP مُخفى للحماية
            location: 'تسجيل دخول من IP جديد',
            browser: result.browser.name,
            os: result.os.name,
            deviceType: result.device.type || 'desktop',
            timestamp: new Date(),
          },
        ).catch(err => console.warn('Failed to send IP alert email:', err));
      }
    }

    // تحديث آخر IP معروف (كـ fingerprint)
    await this.ipVerificationService.updateLastKnownIP(verification.userId, ipAddress);

    // التحقق من 2FA قبل تسجيل الدخول
    const requires2FA = await this.twoFactorService.requiresTwoFactor(verification.userId);
    
    if (requires2FA) {
      // إنشاء جلسة معلقة وإرجاع طلب التحقق من 2FA
      const pendingSessionId = await this.pendingTwoFactorService.create(
        verification.userId,
        verification.email,
      );

      // تعليم QuickSign كمستخدم
      await this.quickSignService.markQuickSignAsUsed(token);
      
      // Redirect لصفحة 2FA
      const redirectUrl = `${frontendUrl}/auth/verify-2fa?sessionId=${pendingSessionId}`;
      console.log('🔄 Redirecting to verify-2fa:', redirectUrl);
      return res.redirect(redirectUrl);
    }

    // تسجيل الدخول مباشرة (لا يوجد 2FA)
    await this.quickSignService.markQuickSignAsUsed(token);

    // تحديث IP
    await this.ipVerificationService.updateLastKnownIP(
      verification.userId,
      ipAddress,
    );

    // إنشاء JWT token
    const user = await this.prisma.user.findUnique({
      where: { id: verification.userId },
      select: {
        id: true,
        email: true,
        role: true,
        profileCompleted: true,
        twoFactorEnabled: true,
        profile: {
          select: {
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // 🔒 إنشاء زوج من التوكنز (Access + Refresh) باستخدام TokenService
    const { tokens, sessionId } = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      { userId: user.id, userAgent, ipAddress },
    );

    // � Debug: Log token generation
    console.log('🔐 QuickSign login - tokens generated:', {
      userId: user.id,
      sessionId,
      accessTokenLength: tokens.accessToken?.length,
      refreshTokenLength: tokens.refreshToken?.length,
    });

    // Security log
    await this.securityLogService.createLog({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: 'تسجيل دخول ناجح عبر QuickSign',
      ipAddress,
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
      userAgent,
    });

    // إرسال إشعار تسجيل دخول جديد
    await this.notificationsGateway.sendNotification({
      userId: user.id,
      type: 'NEW_LOGIN',
      title: 'تسجيل دخول جديد',
      message: `تم تسجيل الدخول إلى حسابك من ${result.browser.name || 'متصفح غير معروف'} على ${result.os.name || 'جهاز غير معروف'}`,
      data: {
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        deviceType: result.device.type || 'desktop',
      },
    });

    // تسجيل المحاولة الناجحة وإعادة تعيين عداد الإغلاق
    await this.accountLockoutService.recordSuccessfulAttempt(user.email, ipAddress);

    // 🔒 استخدام نفس نظام OAuth - إنشاء one-time code وredirect
    // هذا يحل مشكلة cross-origin cookies
    const code = await this.oauthCodeService.generate({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile?.name,
        avatar: user.profile?.avatar,
        profileCompleted: user.profileCompleted,
      },
      needsProfileCompletion: !user.profileCompleted,
    });

    // Redirect مع code فقط - نفس نظام OAuth
    const callbackUrl = `${frontendUrl}/auth/callback?code=${code}`;
    
    console.log('🔄 Redirecting to:', callbackUrl);
    res.redirect(callbackUrl);
  }

  /**
   * إعادة إرسال QuickSign link
   * POST /auth/quicksign/resend
   */
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @Throttle(QUICK_SIGN_RESEND_THROTTLE)
  @ApiOperation({ summary: 'إعادة إرسال رابط QuickSign' })
  @ApiResponse({ status: 200, description: 'تم إعادة الإرسال بنجاح' })
  async resendQuickSign(
    @Body() dto: ResendQuickSignDto,
    @Req() req: Request,
  ) {
    // نفس منطق request endpoint
    return this.requestQuickSign(dto, req);
  }

  /**
   * التحقق من رمز IP
   * POST /auth/quicksign/auth-verify-code
   */
  @Post('auth-verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'التحقق من رمز IP' })
  @ApiResponse({ status: 200, description: 'تم التحقق بنجاح' })
  @ApiResponse({ status: 401, description: 'رمز غير صحيح' })
  async verifyIPCode(
    @Body() dto: VerifyIPCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    // التحقق من QuickSign token (login/signup verification may include userId)
    const verification = await this.quickSignService.verifyQuickSign(
      dto.quickSignToken,
    );

    // Debug: log verification result to help diagnose invalid/expired tokens
    // (remove or lower verbosity in production)
    try {
      // eslint-disable-next-line no-console
      console.log('[QUICKSIGN] completeProfile verification:', {
        tokenPreview: dto.quickSignToken?.substring?.(0, 20) + '...',
        verification,
      });
    } catch (err) {
      // ignore logging errors
    }

    if (!verification.valid || !verification.userId) {
      throw new UnauthorizedException('Token غير صالح');
    }

    // التحقق من رمز IP
    const isValid = await this.ipVerificationService.verifyCode(
      verification.userId,
      dto.code,
      VerificationType.IP_CHANGE,
    );

    if (!isValid) {
      throw new UnauthorizedException('رمز التحقق غير صحيح');
    }

    // تحديد QuickSign كمستخدم
    await this.quickSignService.markQuickSignAsUsed(dto.quickSignToken);

    // تحديث IP
    await this.ipVerificationService.updateLastKnownIP(
      verification.userId,
      ipAddress,
    );

    // إنشاء JWT token
    const user = await this.prisma.user.findUnique({
      where: { id: verification.userId },
      select: {
        id: true,
        email: true,
        role: true,
        profileCompleted: true,
        profile: {
          select: {
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Parse device info for logging
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // 🔒 إنشاء زوج من التوكنز (Access + Refresh) باستخدام TokenService
    const { tokens, sessionId } = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      { userId: user.id, userAgent, ipAddress },
    );

    // 🔒 إعداد Access Token في httpOnly Cookie
    setAccessTokenCookie(res, tokens.accessToken);
    
    // 🔒 إعداد Refresh Token في httpOnly Cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    // 🔒 توليد CSRF Token
    const csrfToken = generateCsrfToken();
    setCsrfTokenCookie(res, csrfToken);

    // Security log
    await this.securityLogService.createLog({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: 'تسجيل دخول ناجح بعد التحقق من IP',
      ipAddress,
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
      userAgent,
    });

    // إرسال إشعار تسجيل دخول جديد
    await this.notificationsGateway.sendNotification({
      userId: user.id,
      type: 'NEW_LOGIN',
      title: 'تسجيل دخول جديد',
      message: `تم تسجيل الدخول إلى حسابك من ${result.browser.name || 'متصفح غير معروف'} على ${result.os.name || 'جهاز غير معروف'}`,
      data: {
        browser: result.browser.name || 'Unknown',
        os: result.os.name || 'Unknown',
        deviceType: result.device.type || 'desktop',
      },
    });

    // تسجيل المحاولة الناجحة وإعادة تعيين عداد الإغلاق
    await this.accountLockoutService.recordSuccessfulAttempt(user.email, ipAddress);

    return {
      success: true,
      action: 'login_success',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        name: user.profile?.name,
        username: user.profile?.username,
        avatar: user.profile?.avatar,
      },
      csrf_token: csrfToken,
      expires_in: 15 * 60, // 15 minutes in seconds
      message: 'تم التحقق بنجاح',
    };
  }

  /**
   * إكمال الملف الشخصي
   * POST /auth/quicksign/complete-profile
   */
  @Post('complete-profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'إكمال الملف الشخصي للمستخدم الجديد' })
  @ApiResponse({ status: 201, description: 'تم إكمال التسجيل بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: 409, description: 'اسم المستخدم محجوز' })
  async completeProfile(
    @Body() dto: CompleteProfileDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    // التحقق من QuickSign token
    const verification = await this.quickSignService.verifyQuickSign(
      dto.quickSignToken,
    );

    // Debug: log verification result to help diagnose invalid/expired tokens
    try {
      // eslint-disable-next-line no-console
      console.log('[QUICKSIGN] completeProfile verification:', {
        tokenPreview: dto.quickSignToken?.substring?.(0, 20) + '...',
        verification,
      });
    } catch (err) {
      // ignore logging errors
    }

    if (!verification.valid) {
      // Prefer explicit reasons for better UX
      if ((verification as any).alreadyRegistered) {
        throw new BadRequestException('البريد مسجل بالفعل. يرجى تسجيل الدخول.');
      }
      if ((verification as any).used) {
        throw new BadRequestException('هذا الرابط تم استخدامه مسبقاً');
      }
      if ((verification as any).expired) {
        throw new UnauthorizedException('انتهت صلاحية الرابط');
      }
      throw new UnauthorizedException('Token غير صالح');
    }

    if (verification.type !== QuickSignType.SIGNUP) {
      throw new BadRequestException('هذا الرابط غير صالح لإكمال التسجيل');
    }

    // التحقق من توفر اسم المستخدم
    const existingUsername = await this.prisma.profile.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new BadRequestException('اسم المستخدم محجوز بالفعل');
    }

    // Import IP hashing utility
    const { hashIP } = await import('../../core/common/utils/ip-hash.util');
    const ipFingerprint = hashIP(ipAddress);
    
    // إنشاء المستخدم مع Profile
    const user = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: verification.email,
        profileCompleted: true,
        lastKnownIpFingerprint: ipFingerprint,
        lastLoginIpFingerprint: ipFingerprint,
        lastLoginAt: new Date(),
        emailVerified: true, // QuickSign يعتبر verified
        profile: {
          create: {
            id: crypto.randomUUID(),
            username: dto.username,
            name: dto.name,
            bio: null,
            avatar: null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // تحديد QuickSign كمستخدم
    await this.quickSignService.markQuickSignAsUsed(dto.quickSignToken);

    // 🏪 إنشاء Store تلقائياً للمستخدم
    const storeSlug = dto.username.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const store = await this.prisma.store.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        name: dto.name, // نفس اسم المستخدم
        slug: storeSlug, // نفس username
        description: dto.storeDescription || null,
        category: dto.storeCategory || null,
        employeesCount: dto.employeesCount || null,
        status: 'ACTIVE',
        country: dto.storeCountry || dto.country || 'العراق',
        city: dto.storeCity || null,
        address: dto.storeAddress || null,
        latitude: dto.storeLatitude || null,
        longitude: dto.storeLongitude || null,
        contactEmail: user.email, // استخدام email المستخدم
      },
    });

    // Parse device info
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // 🔒 إنشاء زوج من التوكنز (Access + Refresh) باستخدام TokenService
    const { tokens, sessionId } = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      { userId: user.id, userAgent, ipAddress },
    );

    // 🔒 إعداد Access Token في httpOnly Cookie
    setAccessTokenCookie(res, tokens.accessToken);
    
    // 🔒 إعداد Refresh Token في httpOnly Cookie
    setRefreshTokenCookie(res, tokens.refreshToken);

    // 🔒 توليد CSRF Token
    const csrfToken = generateCsrfToken();
    setCsrfTokenCookie(res, csrfToken);

    // Security log
    await this.securityLogService.createLog({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      description: 'تسجيل حساب جديد عبر QuickSign',
      ipAddress,
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
      userAgent,
    });

    // إرسال إشعار ترحيبي للمستخدم الجديد
    await this.notificationsGateway.sendNotification({
      userId: user.id,
      type: 'SYSTEM',
      title: 'مرحباً بك في ركني! 🎉',
      message: 'شكراً لانضمامك إلى منصة ركني. نتمنى لك تجربة رائعة!',
    });

    // تسجيل المحاولة الناجحة وإعادة تعيين عداد الإغلاق
    await this.accountLockoutService.recordSuccessfulAttempt(user.email, ipAddress);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        name: user.profile?.name,
        username: user.profile?.username,
        avatar: user.profile?.avatar,
      },
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
      },
      csrf_token: csrfToken,
      expires_in: 15 * 60, // 15 minutes in seconds
      message: 'تم إنشاء حسابك بنجاح',
    };
  }

  /**
   * التحقق من توفر اسم المستخدم
   * GET /auth/quicksign/check-username/:username
   */
  @Get('check-username/:username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'التحقق من توفر اسم المستخدم' })
  @ApiResponse({ status: 200, description: 'نتيجة التحقق' })
  async checkUsername(@Param('username') username: string) {
    const existingUsername = await this.prisma.profile.findUnique({
      where: { username },
    });

    return {
      available: !existingUsername,
      username,
    };
  }
}
