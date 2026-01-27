import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res, Delete, Param, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { ExchangeCodeDto } from './dto';
import { JwtAuthGuard } from '../../core/common/guards/auth/jwt-auth.guard';
import { GoogleAuthGuard } from '../../core/common/guards/auth/google-auth.guard';
import { LinkedInAuthGuard } from '../../core/common/guards/auth/linkedin-auth.guard';
import { CurrentUser } from '../../core/common/decorators/auth/current-user.decorator';
import { Request, Response } from 'express';
import { OAuthCodeService } from './oauth-code.service';
import { RedisOAuthCodeService } from './redis-oauth-code.service';
import { WebSocketTokenService } from './websocket-token.service';
import { Throttle } from '@nestjs/throttler';
import { 
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setCsrfTokenCookie,
  clearAuthCookies,
  clearRefreshTokenCookie, 
  extractAccessToken, 
  extractRefreshToken,
  validateCsrfOrigin,
  generateCsrfToken,
} from './cookie.config';

// Throttle policies:
// - Production: strict
// - Development: more lenient to avoid blocking mobile/local testing when the client retries
const AUTH_REFRESH_THROTTLE =
  process.env.NODE_ENV === 'production'
    ? { default: { limit: 30, ttl: 60000 } } // 30 requests per minute
    : { default: { limit: 300, ttl: 60000 } }; // 300 requests per minute (dev only)

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private oauthCodeService: RedisOAuthCodeService, // Use Redis implementation
    private webSocketTokenService: WebSocketTokenService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get('ws-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get WebSocket authentication token' })
  @ApiResponse({ status: 200, description: 'WebSocket token generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWebSocketToken(@CurrentUser() user: any) {
    const token = this.webSocketTokenService.generateToken(user.id);
    return { token, expiresIn: 300 }; // 5 minutes
  }

  // Debug endpoint to inspect cookies received by server
  @Get('debug')
  @ApiOperation({ summary: 'Debug - return cookies seen by server' })
  async debugCookies(@Req() req: Request) {
    try {
      // Return both raw header and parsed cookies
      return {
        cookies: req.cookies || {},
        cookieHeader: req.headers?.cookie || null,
      };
    } catch (err) {
      return { error: String(err) };
    }
  }

  /**
   * 🔒 تجديد التوكنز باستخدام Refresh Token
   * 
   * Refresh Token في httpOnly Cookie → Access Token في Response Body
   * 
   * الحماية:
   * - SameSite=Lax (يسمح بـ OAuth redirect)
   * - Origin/Referer validation (حماية CSRF إضافية)
   * - Rate limiting
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_REFRESH_THROTTLE)
  @ApiOperation({ summary: 'Refresh access token using refresh token from cookie' })
  @ApiResponse({ status: 200, description: 'New access token returned in body' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 403, description: 'CSRF validation failed' })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 🔒 CSRF Protection - التحقق من Origin
    const csrfCheck = validateCsrfOrigin(req);
    if (!csrfCheck.valid) {
      throw new ForbiddenException(`CSRF validation failed: ${csrfCheck.reason}`);
    }

    const refreshToken = extractRefreshToken(req);
    
    if (!refreshToken) {
      // 🔒 مسح الكوكي في حالة عدم وجود token
      clearRefreshTokenCookie(res);
      throw new UnauthorizedException('Refresh token not found. Please login again.');
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    try {
      // 🔒 تجديد التوكنز مع التدوير (Rotation)
      const tokens = await this.tokenService.refreshTokens(
        refreshToken,
        ipAddress,
        userAgent,
      );

      // 🔒 Access Token في httpOnly Cookie
      setAccessTokenCookie(res, tokens.accessToken);
      
      // 🔒 Refresh Token الجديد في httpOnly Cookie
      setRefreshTokenCookie(res, tokens.refreshToken);

      // 🔒 توليد CSRF Token جديد
      const csrfToken = generateCsrfToken();
      setCsrfTokenCookie(res, csrfToken);

      // 🔒 Response - لا نُرسل التوكنات في الـ body (فقط في cookies)
      return {
        success: true,
        message: 'Tokens refreshed successfully',
        csrf_token: csrfToken, // 🔒 CSRF token للـ frontend
        expires_in: 15 * 60,
      };
    } catch (error) {
      // 🔒 مسح الكوكي الفاسدة عند فشل التجديد
      // هذا يمنع الحلقة اللانهائية من محاولات التجديد
      clearRefreshTokenCookie(res);
      throw error;
    }
  }

  /**
   * 🔒 الحصول على الجلسات النشطة للمستخدم
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user active sessions' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved' })
  async getActiveSessions(@CurrentUser() user: any) {
    return this.tokenService.getUserActiveSessions(user.id);
  }

  /**
   * 🔒 تسجيل الخروج من جميع الأجهزة
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  async logoutAll(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const count = await this.tokenService.revokeAllUserSessions(
      user.id,
      'User requested logout from all devices',
    );

    // 🔒 مسح جميع Auth Cookies
    clearAuthCookies(res);

    return {
      success: true,
      message: `تم تسجيل الخروج من ${count} جهاز`,
      devicesLoggedOut: count,
    };
  }

  /**
   * 🔒 إبطال جلسة معينة
   */
  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
  ) {
    await this.tokenService.revokeSession(sessionId, 'User revoked session');
    return {
      success: true,
      message: 'تم إنهاء الجلسة بنجاح',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Extract Access Token from Cookie or Authorization header
    const token = extractAccessToken(req);
    
    // 🔒 مسح جميع Auth Cookies
    clearAuthCookies(res);
    
    // Invalidate session in database
    return this.authService.logout(token);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth(@Req() req: Request) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google OAuth successful' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    const result = await this.authService.googleLogin(req.user, userAgent, ipAddress);
    
    // 🔒 لا نضع Cookie هنا - سيُضبط في /oauth/exchange
    // السبب: redirect من port 3001 إلى 3000 يُعتبر cross-origin

    // Generate one-time code with Access Token AND Refresh Token
    const code = await this.oauthCodeService.generate({
      access_token: result.access_token,
      refresh_token: result.refresh_token, // ✅ أضفنا refresh_token
      user: result.user,
      needsProfileCompletion: result.needsProfileCompletion,
    });

    // Redirect with code only
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${base}/auth/callback?code=${code}`;
    res.redirect(redirectUrl);
  }

  @Post('oauth/exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // 50 requests per minute (lenient for development/debugging)
  @ApiOperation({ summary: 'Exchange one-time OAuth code for access token' })
  @ApiResponse({ status: 200, description: 'Access token returned in body, refresh token in cookie' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async exchangeOAuthCode(
    @Body() body: ExchangeCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user, needsProfileCompletion } = await this.oauthCodeService.exchange(body.code);
    
    // 🔒 Access Token في httpOnly Cookie
    if (access_token) {
      setAccessTokenCookie(res, access_token);
    }
    
    // 🔒 Refresh Token في httpOnly Cookie
    if (refresh_token) {
      setRefreshTokenCookie(res, refresh_token);
    }

    // 🔒 توليد CSRF Token
    const csrfToken = generateCsrfToken();
    setCsrfTokenCookie(res, csrfToken);
    
    // 🔒 Response - لا نُرسل التوكنات في الـ body
    return { 
      success: true,
      csrf_token: csrfToken,
      expires_in: 15 * 60,
      user,
      needsProfileCompletion,
      message: 'Tokens stored in httpOnly cookies',
    };
  }

  @Get('linkedin')
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'LinkedIn OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to LinkedIn OAuth' })
  async linkedinAuth(@Req() req: Request) {
    // Guard redirects to LinkedIn
  }

  @Get('linkedin/callback')
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'LinkedIn OAuth callback' })
  @ApiResponse({ status: 200, description: 'LinkedIn OAuth successful' })
  async linkedinAuthCallback(@Req() req: any, @Res() res: Response) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    const result = await this.authService.linkedinLogin(req.user, userAgent, ipAddress);

    // 🔒 لا نضع Cookie هنا - سيُضبط في /oauth/exchange
    // السبب: redirect من port 3001 إلى 3000 يُعتبر cross-origin

    // Generate one-time code with Access Token AND Refresh Token
    const code = await this.oauthCodeService.generate({
      access_token: result.access_token,
      refresh_token: result.refresh_token, // ✅ أضفنا refresh_token
      user: result.user,
      needsProfileCompletion: result.needsProfileCompletion,
    });

    // Redirect with code only
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${base}/auth/callback?code=${code}`;
    res.redirect(redirectUrl);
  }
}
