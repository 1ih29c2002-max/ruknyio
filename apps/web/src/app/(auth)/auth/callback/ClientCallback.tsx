'use client';

/**
 * 🔐 Auth Callback Client Component
 * 
 * Handles OAuth callback flow entirely on the client.
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers';
import { Loader2, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      return;
    }

    if (!code) {
      setError('لم يتم استلام رمز التفويض');
      return;
    }

    // Exchange OAuth code for tokens
    const exchangeCode = async () => {
      try {
        const response = await handleOAuthCallback(code);

        // Check if profile needs completion
        if (response.needsProfileCompletion) {
          router.push('/complete-profile');
        } else {
          // Redirect to app or stored callback URL
          const callbackUrl = sessionStorage.getItem('oauth_callback') || '/app';
          sessionStorage.removeItem('oauth_callback');
          router.push(callbackUrl);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'فشل التوثيق';
        setError(message);
      }
    };

    exchangeCode();
  }, [searchParams, handleOAuthCallback, router]);

  if (error) {
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
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            فشل التوثيق
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">
            {error}
          </p>

          {/* Button */}
          <button
            onClick={() => router.push('/login')}
            className="flex items-center justify-center gap-2 w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base rounded-2xl font-medium transition-all"
          >
            <span>المحاولة مرة أخرى</span>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </motion.div>
      </div>
    );
  }

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
          جاري تسجيل الدخول...
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          يرجى الانتظار بينما نكمل عملية التوثيق
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackClient() {
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
      <CallbackContent />
    </Suspense>
  );
}

