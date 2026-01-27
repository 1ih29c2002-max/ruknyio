import { createHmac } from 'crypto';

/**
 * 🔐 IP Address Hashing Utility
 * 
 * يستخدم HMAC-SHA256 لتشفير عناوين IP قبل تخزينها في قاعدة البيانات.
 * 
 * لماذا HMAC بدلاً من Hash عادي؟
 * - عناوين IP مساحة صغيرة نسبياً (IPv4 = ~4 مليار قيمة)
 * - Hash عادي يمكن مهاجمته بـ Rainbow Tables
 * - HMAC يتطلب معرفة المفتاح السري للتخمين
 * 
 * الاستخدام:
 * - تخزين: hashIP('192.168.1.1') → 'a1b2c3d4...'
 * - مقارنة: compareIP('192.168.1.1', storedHash) → true/false
 */

// المفتاح السري - يجب أن يكون في متغيرات البيئة
const getSecretKey = (): string => {
  const key = process.env.IP_HASH_SECRET || process.env.JWT_SECRET;
  if (!key) {
    throw new Error('IP_HASH_SECRET or JWT_SECRET must be set in environment variables');
  }
  return key;
};

/**
 * تحويل عنوان IP إلى HMAC-SHA256 fingerprint
 * @param ipAddress - عنوان IP الأصلي
 * @returns HMAC-SHA256 hash (64 حرف hex)
 */
export function hashIP(ipAddress: string): string {
  if (!ipAddress) {
    throw new Error('IP address is required');
  }

  // تنظيف وتوحيد صيغة IP
  const normalizedIP = normalizeIP(ipAddress);
  
  const hmac = createHmac('sha256', getSecretKey());
  hmac.update(normalizedIP);
  return hmac.digest('hex');
}

/**
 * مقارنة عنوان IP مع fingerprint مخزن
 * @param ipAddress - عنوان IP للتحقق
 * @param storedFingerprint - الـ fingerprint المخزن في قاعدة البيانات
 * @returns true إذا تطابقا
 */
export function compareIP(ipAddress: string, storedFingerprint: string): boolean {
  if (!ipAddress || !storedFingerprint) {
    return false;
  }

  try {
    const currentFingerprint = hashIP(ipAddress);
    // مقارنة آمنة لتجنب timing attacks
    return timingSafeEqual(currentFingerprint, storedFingerprint);
  } catch {
    return false;
  }
}

/**
 * التحقق مما إذا كان IP موجود في قائمة fingerprints
 * @param ipAddress - عنوان IP للبحث عنه
 * @param fingerprints - قائمة الـ fingerprints المخزنة
 * @returns true إذا وُجد
 */
export function isIPInList(ipAddress: string, fingerprints: string[]): boolean {
  if (!ipAddress || !fingerprints || fingerprints.length === 0) {
    return false;
  }

  const currentFingerprint = hashIP(ipAddress);
  return fingerprints.some(fp => timingSafeEqual(currentFingerprint, fp));
}

/**
 * تنظيف وتوحيد صيغة عنوان IP
 */
function normalizeIP(ip: string): string {
  // إزالة المسافات
  let normalized = ip.trim();
  
  // التعامل مع IPv4-mapped IPv6 (مثل ::ffff:192.168.1.1)
  if (normalized.startsWith('::ffff:')) {
    normalized = normalized.substring(7);
  }
  
  // تحويل localhost
  if (normalized === '::1') {
    normalized = '127.0.0.1';
  }
  
  return normalized.toLowerCase();
}

/**
 * مقارنة آمنة للسلاسل النصية (تجنب timing attacks)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * إخفاء جزء من عنوان IP للعرض (Privacy Masking)
 * @param ipAddress - عنوان IP الأصلي
 * @returns عنوان IP مُخفى جزئياً
 * 
 * مثال: '192.168.1.100' → '192.168.*.*'
 */
export function maskIP(ipAddress: string): string {
  if (!ipAddress) return 'غير معروف';
  
  const normalized = normalizeIP(ipAddress);
  
  // IPv4
  if (normalized.includes('.')) {
    const parts = normalized.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }
  
  // IPv6
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:****:****`;
    }
  }
  
  return '***.***.***';
}

/**
 * التحقق من صحة صيغة عنوان IP
 */
export function isValidIP(ipAddress: string): boolean {
  if (!ipAddress) return false;
  
  const normalized = normalizeIP(ipAddress);
  
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(normalized)) {
    const parts = normalized.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
  return ipv6Regex.test(normalized);
}
