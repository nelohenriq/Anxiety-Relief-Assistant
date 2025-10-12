'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Redirect back after a short delay when coming back online
      setTimeout(() => {
        router.replace('/');
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.replace('/');
    } else {
      // Force page refresh to retry
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-100 dark:from-primary-900/50 dark:to-accent-950/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            You're Offline
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isOnline
              ? "You're back online! Redirecting you now..."
              : "Please check your internet connection and try again."
            }
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            disabled={isOnline}
          >
            {isOnline ? 'Redirecting...' : 'Try Again'}
          </button>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isOnline
              ? "You'll be redirected automatically in a moment"
              : "Make sure your Wi-Fi or mobile data is turned on"
            }
          </p>
        </div>

        {/* Available offline features */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Available Offline:
          </h3>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>View cached content</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Basic app navigation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}