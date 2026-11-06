import { NextRequest, NextResponse } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET || 'default-secret-change-in-production';

async function verifySession(token: string): Promise<boolean> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;
    const payload = atob(payloadB64);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    if (signature !== expected) return false;
    const data = JSON.parse(payload);
    return data.exp > Date.now() && data.authenticated === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('novela-session')?.value;
  if (!session || !(await verifySession(session))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
