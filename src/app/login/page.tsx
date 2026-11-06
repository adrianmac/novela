'use client';

import { useState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await login(formData.get('password') as string);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4F0]">
      <div className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-800 rounded-lg flex items-center justify-center text-white font-serif font-bold text-2xl mx-auto mb-3">
            N
          </div>
          <h1 className="font-serif text-2xl text-stone-900">Novela</h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800 transition-colors"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-800 text-white rounded-lg font-medium hover:bg-rose-900 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
