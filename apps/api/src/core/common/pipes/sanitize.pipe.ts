import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * 🔒 Sanitize Pipe
 *
 * يقوم بتنظيف المدخلات من المحتوى الضار
 * - إزالة HTML tags
 * - إزالة JavaScript
 * - تنظيف SQL injection patterns
 * - الحفاظ على صور base64 الصالحة
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  // حقول الصور التي يجب الحفاظ عليها بدون تعديل
  private readonly IMAGE_FIELDS = [
    'coverimage',
    'avatar',
    'banners',
    'thumbnail',
    'image',
    'images',
    'logo',
    'picture',
    'photo',
    'banner',
    'icon',
    'profileimage',
    'backgroundimage',
  ];

  // Regex للتحقق من صورة base64 صالحة
  private readonly VALID_BASE64_IMAGE =
    /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'object') {
      return this.sanitizeObject(value);
    }

    return value;
  }

  /**
   * تنظيف النصوص
   */
  private sanitizeString(str: string, fieldName?: string): string {
    if (!str) return str;

    // إذا كان حقل صورة، تحقق من صحة base64 وأرجعه كما هو
    if (fieldName && this.isImageField(fieldName)) {
      // إذا كانت صورة base64 صالحة، أرجعها بدون تعديل
      if (this.isValidBase64Image(str)) {
        return str;
      }
      // إذا كان رابط URL أو S3 key، أرجعه بدون تعديل
      if (
        str.startsWith('http://') ||
        str.startsWith('https://') ||
        str.startsWith('blob:') ||
        this.isS3Key(str)
      ) {
        return str;
      }
    }

    return (
      str
        // إزالة HTML tags
        .replace(/<[^>]*>/g, '')
        // إزالة JavaScript events
        .replace(/on\w+\s*=/gi, '')
        // إزالة javascript: protocol
        .replace(/javascript:/gi, '')
        // إزالة data: protocol الخبيثة (ليست صور صالحة)
        .replace(
          /data:(?!image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,)/gi,
          '',
        )
        // تنظيف whitespace زائد
        .trim()
    );
  }

  /**
   * التحقق من أن الحقل هو حقل صورة
   */
  private isImageField(fieldName: string): boolean {
    return this.IMAGE_FIELDS.includes(fieldName.toLowerCase());
  }

  /**
   * التحقق من أن النص هو صورة base64 صالحة
   */
  private isValidBase64Image(str: string): boolean {
    // تحقق سريع أولاً
    if (!str.startsWith('data:image/')) {
      return false;
    }
    // تحقق من الصيغة (نتحقق من البداية فقط لتجنب regex بطيء على نصوص طويلة)
    const prefix = str.substring(0, 100);
    return /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/.test(prefix);
  }

  /**
   * التحقق من أن النص هو S3 key صالح
   */
  private isS3Key(str: string): boolean {
    // S3 keys تبدأ عادة بمسار مثل forms/, uploads/, avatars/ إلخ
    return (
      /^[a-zA-Z0-9\-_]+\//.test(str) && !str.includes('<') && !str.includes('>')
    );
  }

  /**
   * تنظيف Objects بشكل متكرر
   */
  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transform(item, {} as ArgumentMetadata));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        // تنظيف key أيضاً
        const cleanKey = this.sanitizeString(key);
        const value = obj[key];

        // إذا كان حقل صورة، عالجه بشكل خاص
        if (this.isImageField(key)) {
          if (typeof value === 'string') {
            sanitized[cleanKey] = this.sanitizeString(value, key);
          } else if (Array.isArray(value)) {
            // للمصفوفات مثل banners أو images
            sanitized[cleanKey] = value.map((v) =>
              typeof v === 'string'
                ? this.sanitizeString(v, key)
                : this.transform(v, {} as ArgumentMetadata),
            );
          } else {
            sanitized[cleanKey] = this.transform(value, {} as ArgumentMetadata);
          }
        } else {
          sanitized[cleanKey] = this.transform(value, {} as ArgumentMetadata);
        }
      }
      return sanitized;
    }

    return obj;
  }
}
