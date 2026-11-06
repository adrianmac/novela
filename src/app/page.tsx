import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-2xl font-serif font-bold text-rose-950 tracking-tight">
          Novela
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-rose-800 hover:text-rose-950 transition-colors px-4 py-2 rounded-lg hover:bg-rose-100"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-serif font-bold text-rose-950 leading-tight tracking-tight">
          Your bridal boutique,{' '}
          <span className="text-rose-600">beautifully managed</span>
        </h1>
        <p className="mt-6 text-lg text-rose-800/80 max-w-xl leading-relaxed">
          Appointments, alterations, inventory, and events — everything your
          boutique needs in one place. Built for the way you actually work.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-rose-800 text-white font-semibold text-base hover:bg-rose-900 transition-colors shadow-lg shadow-rose-200"
          >
            Open dashboard
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl border-2 border-rose-200 text-rose-800 font-semibold text-base hover:bg-rose-50 transition-colors"
          >
            Book an appointment
          </Link>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-sm text-rose-400">
        &copy; {new Date().getFullYear()} Novela. All rights reserved.
      </footer>
    </div>
  );
}
