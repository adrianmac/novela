import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { redirect } from 'next/navigation';

const AUTH_SECRET = process.env.AUTH_SECRET || 'default-secret-change-in-production';

export function createSessionToken(): string {
  const payload = JSON.stringify({
    authenticated: true,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  const signature = createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

export async function requireAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('novela-session')?.value;
  if (!token) redirect('/login');

  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    if (signature !== expected) redirect('/login');
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) redirect('/login');
  } catch {
    redirect('/login');
  }
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete('novela-session');
  redirect('/login');
}
