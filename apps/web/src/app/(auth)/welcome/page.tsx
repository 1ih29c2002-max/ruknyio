'use client';

/**
 * 🎉 Welcome Page - Shown after successful registration/profile completion
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Welcome Animation */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome to Rukny! 🎉
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Hey {user.name || 'there'}, you&apos;re all set!
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            What&apos;s next?
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">1</span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Complete your profile with a photo and bio</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">2</span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Create your first store or event</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">3</span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Explore what others are sharing</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/app')}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
