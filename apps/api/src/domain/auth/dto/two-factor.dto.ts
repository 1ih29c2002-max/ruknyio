import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 🔐 Two-Factor Authentication DTOs
 */

// ========== إعداد 2FA ==========

export class Setup2FAResponseDto {
  @ApiProperty({
    description: 'المفتاح السري (للإدخال اليدوي)',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'QR Code كـ Data URL (base64)',
    example: 'data:image/png;base64,...',
  })
  qrCodeUrl: string;

  @ApiProperty({
    description: 'الرموز الاحتياطية (10 رموز)',
    example: ['A1B2-C3D4', 'E5F6-G7H8'],
  })
  backupCodes: string[];

  @ApiProperty({
    description: 'المفتاح للإدخال اليدوي في التطبيق',
    example: 'JBSWY3DPEHPK3PXP',
  })
  manualEntryKey: string;
}

// ========== التحقق من رمز OTP ==========

export class Verify2FADto {
  @ApiProperty({
    description: 'رمز التحقق من تطبيق المصادقة (6 أرقام)',
    example: '123456',
  })
  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  @Matches(/^[\d\s]{6,8}$/, {
    message: 'رمز التحقق يجب أن يكون 6 أرقام',
  })
  token: string;
}

export class Verify2FALoginDto {
  @ApiProperty({
    description: 'رمز التحقق من تطبيق المصادقة أو رمز احتياطي',
    example: '123456',
  })
  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  token: string;

  @ApiProperty({
    description: 'معرف جلسة انتظار 2FA',
    example: 'pending-session-uuid',
    required: false,
  })
  @IsString()
  @IsOptional()
  pendingSessionId?: string;
}

// ========== إلغاء تفعيل 2FA ==========

export class Disable2FADto {
  @ApiProperty({
    description: 'رمز التحقق للتأكيد',
    example: '123456',
  })
  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  token: string;
}

// ========== إعادة توليد الرموز الاحتياطية ==========

export class RegenerateBackupCodesDto {
  @ApiProperty({
    description: 'رمز التحقق للتأكيد',
    example: '123456',
  })
  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  token: string;
}

// ========== استجابات ==========

export class TwoFactorStatusDto {
  @ApiProperty({
    description: 'هل المصادقة الثنائية مفعلة',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'عدد الرموز الاحتياطية المتبقية',
    example: 8,
  })
  backupCodesRemaining: number;
}

export class EnableTwoFactorResponseDto {
  @ApiProperty({
    description: 'نجاح التفعيل',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'الرموز الاحتياطية - احفظها في مكان آمن!',
    example: ['A1B2-C3D4', 'E5F6-G7H8'],
  })
  backupCodes: string[];

  @ApiProperty({
    description: 'رسالة للمستخدم',
    example: 'تم تفعيل المصادقة الثنائية بنجاح',
  })
  message: string;
}

export class VerifyTwoFactorLoginResponseDto {
  @ApiProperty({
    description: 'نجاح التحقق',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'هل تم استخدام رمز احتياطي',
    example: false,
  })
  usedBackupCode: boolean;

  @ApiProperty({
    description: 'Access Token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  access_token: string;

  @ApiProperty({
    description: 'مدة صلاحية التوكن بالثواني',
    example: 900,
  })
  expires_in: number;

  @ApiProperty({
    description: 'بيانات المستخدم',
  })
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
}
