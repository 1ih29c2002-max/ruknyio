'use client';

/**
 * 🔐 Auth Verify Page - Handles IP verification and error redirects from QuickSign API
 * This page handles:
 * 1. IP verification flow (when userId & token are present)
 * 2. Error cases from QuickSign API
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowRight, RefreshCw, Shield, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildApiPath } from '@/lib/config';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'ip-verification' | 'verifying' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters from API redirect
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (errorParam) {
      setStatus('error');
      setError(messageParam || getErrorMessage(errorParam));
      return;
    }

    // If has userId/token, this is IP verification flow
    const userIdParam = searchParams.get('userId');
    const tokenParam = searchParams.get('token');
    
    if (userIdParam && tokenParam) {
      setUserId(userIdParam);
      setToken(tokenParam);
      setStatus('ip-verification');
      return;
    }

    // No valid parameters - show error
    setStatus('error');
    setError('رابط غير صالح');
  }, [searchParams]);

  function getErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'used':
        return 'هذا الرابط تم استخدامه مسبقاً';
      case 'expired':
        return 'انتهت صلاحية هذا الرابط';
      case 'invalid':
        return 'رابط غير صالح';
      default:
        return 'حدث خطأ غير متوقع';
    }
  }

  // Handle code input change
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only keep last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerifyCode(pastedData);
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify the IP code
  const handleVerifyCode = async (codeValue: string) => {
    if (!token) return;
    
    setStatus('verifying');
    setError(null);

    try {
      const response = await fetch(buildApiPath('/auth/quicksign/auth-verify-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quickSignToken: token,
          code: codeValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('ip-verification');
        setError(data.message || 'رمز التحقق غير صحيح');
        setCode(['', '', '', '', '', '']);
        // Focus first input
        setTimeout(() => {
          document.getElementById('code-0')?.focus();
        }, 100);
        return;
      }

      // Success! Redirect to dashboard
      setStatus('success');
      setTimeout(() => {
        router.push('/app');
      }, 1500);
    } catch (err) {
      setStatus('ip-verification');
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى');
      setCode(['', '', '', '', '', '']);
    }
  };

  // IP Verification UI
  if (status === 'ip-verification' || status === 'verifying') {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6 py-12"
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-sm"
        >
          {/* Shield Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            التحقق من الجهاز
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">
            لاحظنا أنك تسجل الدخول من جهاز أو موقع جديد.
            <br />
            أدخل الرمز المرسل إلى بريدك الإلكتروني
          </p>

          {/* Code Input */}
          <div className="flex gap-2 mb-6 justify-center" dir="ltr">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={status === 'verifying'}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center mb-4"
            >
              {error}
            </motion.p>
          )}

          {/* Loading state */}
          {status === 'verifying' && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التحقق...</span>
            </div>
          )}

          {/* Help text */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
            لم تستلم الرمز؟{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline"
            >
              طلب رابط جديد
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Success UI
  if (status === 'success') {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6 py-12"
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-sm"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            تم التحقق بنجاح!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center">
            جاري تحويلك إلى لوحة التحكم...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error UI
  if (status === 'error') {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6 py-12"
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-sm"
        >
          {/* Error Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            الرابط منتهي الصلاحية
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">
            {error || 'هذا الرابط السحري منتهي الصلاحية أو تم استخدامه مسبقاً'}
          </p>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center gap-2 w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base rounded-2xl font-medium transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>طلب رابط جديد</span>
            </button>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              الروابط السحرية تنتهي صلاحيتها بعد ١٠ دقائق لأسباب أمنية
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading UI
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6 py-12"
      style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center w-full max-w-sm"
      >
        {/* Loading Spinner */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
          <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
          جاري التحقق من الرابط...
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          يرجى الانتظار بينما نتحقق من الرابط السحري
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthVerifyPage() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
