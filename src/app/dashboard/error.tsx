'use client';

import { useEffect } from 'react';

export default function DashboardError({
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
    <div className="flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 bg-rose-100 text-rose-800 rounded-xl flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">Something went wrong</h2>
        <p className="text-stone-500 text-sm mb-6">An error occurred loading this page. Please try again.</p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-rose-800 text-white rounded-xl font-semibold text-sm hover:bg-rose-900 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
