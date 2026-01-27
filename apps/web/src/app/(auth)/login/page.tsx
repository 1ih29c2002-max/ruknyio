'use client';

/**
 * 🔐 Login Page - QuickSign (Magic Link) Authentication
 * Clean, simple design with magic link authentication
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers';
import { getGoogleAuthUrl, getLinkedInAuthUrl } from '@/lib/api';
import { resetRefreshState } from '@/lib/api/client';
import AuthForm from '@/components/ui/auth-form';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendMagicLink, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  // Check for session expired message
  useEffect(() => {
    const sessionParam = searchParams.get('session');
    if (sessionParam === 'expired') {
      setSessionMessage('انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.');
    } else if (sessionParam === 'invalid') {
      setSessionMessage('جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.');
    }
    
    // Reset refresh state when landing on login page
    resetRefreshState();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSessionMessage(null);

    try {
      await sendMagicLink(email);
      // Redirect to check-email page
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
    } catch {
      // Error is handled by auth provider
    }
  };

  const handleGoogleLogin = () => {
    // Store current URL for callback
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_callback', '/app');
    }
    window.location.href = getGoogleAuthUrl();
  };

  const handleLinkedInLogin = () => {
    // Store current URL for callback
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_callback', '/app');
    }
    window.location.href = getLinkedInAuthUrl();
  };

  // Combine session message with error
  const displayError = sessionMessage || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ffffff] dark:bg-zinc-900 px-4 py-12">
      <AuthForm
        type="login"
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={displayError}
        onGoogleLogin={handleGoogleLogin}
        onLinkedInLogin={handleLinkedInLogin}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#ffffff] dark:bg-zinc-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
