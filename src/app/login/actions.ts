'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken } from '@/lib/auth';

export async function login(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return { error: 'Authentication not configured. Set ADMIN_PASSWORD env var.' };
  }
  if (!password || password !== adminPassword) {
    return { error: 'Invalid password' };
  }

  cookies().set('novela-session', createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  redirect('/dashboard');
}
