'use client';

/**
 * 👤 Complete Profile Page - For new users after QuickSign/OAuth
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import { checkUsername } from '@/lib/api';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, completeUserProfile, isLoading, error, clearError, needsProfileCompletion } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Redirect if profile is already complete
  useEffect(() => {
    if (user && !needsProfileCompletion) {
      router.push('/app');
    }
  }, [user, needsProfileCompletion, router]);

  // Pre-fill name from user data
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, name: user.name || '' }));
    }
  }, [user]);

  // Check username availability with debounce
  useEffect(() => {
    if (formData.username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const result = await checkUsername(formData.username);
        if (result.available) {
          setUsernameStatus('available');
          setSuggestions([]);
        } else {
          setUsernameStatus('taken');
          setSuggestions(result.suggestions || []);
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (usernameStatus !== 'available') {
      return;
    }

    try {
      await completeUserProfile(formData);
      router.push('/app');
    } catch {
      // Error handled by auth provider
    }
  };

  const selectSuggestion = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Just a few more details to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Display Name
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Username
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                @
              </span>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-8 pr-10 py-3 text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                placeholder="username"
              />
              {/* Status Icon */}
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                {usernameStatus === 'checking' && (
                  <div className="animate-spin h-5 w-5 border-2 border-zinc-300 border-t-blue-500 rounded-full" />
                )}
                {usernameStatus === 'available' && (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {usernameStatus === 'taken' && (
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Letters, numbers, and underscores only. This will be your unique @handle.
            </p>
            
            {/* Username Suggestions */}
            {usernameStatus === 'taken' && suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                  Try one of these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    >
                      @{suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || usernameStatus !== 'available' || formData.name.length < 2}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
