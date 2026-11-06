import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4F0] px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-rose-100 text-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M16 16c-.5-1.5-1.79-2-4-2s-3.5.5-4 2"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Page not found</h1>
        <p className="text-stone-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-rose-800 text-white rounded-xl font-semibold hover:bg-rose-900 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
