'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4F0] px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-rose-100 text-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
        <p className="text-stone-500 mb-8">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-rose-800 text-white rounded-xl font-semibold hover:bg-rose-900 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
