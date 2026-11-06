import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { createSessionToken, requireAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_SECRET = process.env.AUTH_SECRET || 'default-secret-change-in-production';

describe('createSessionToken', () => {
  it('returns a string with two dot-separated parts', () => {
    const token = createSessionToken();
    const parts = token.split('.');
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  it('first part decodes to JSON with authenticated: true and future exp', () => {
    const token = createSessionToken();
    const [payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    expect(payload.authenticated).toBe(true);
    expect(payload.exp).toBeGreaterThan(Date.now());
  });

  it('exp is roughly 7 days from now', () => {
    const token = createSessionToken();
    const [payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const diff = payload.exp - Date.now();
    expect(diff).toBeGreaterThan(sevenDaysMs - 5000);
    expect(diff).toBeLessThanOrEqual(sevenDaysMs);
  });

  it('signature is a valid hex string', () => {
    const token = createSessionToken();
    const [, signature] = token.split('.');
    expect(signature).toMatch(/^[0-9a-f]+$/);
  });

  it('signature matches HMAC-SHA256 of the payload', () => {
    const token = createSessionToken();
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    expect(signature).toBe(expected);
  });

  it('produces tokens with different timestamps', async () => {
    const token1 = createSessionToken();
    await new Promise((r) => setTimeout(r, 5));
    const token2 = createSessionToken();
    expect(token1).not.toBe(token2);
  });
});

describe('requireAuth', () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCookieStore);
  });

  it('redirects to /login when no cookie is set', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /login when cookie value is garbage', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'not-a-valid-token' });
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
  });

  it('redirects when signature is wrong', async () => {
    const payload = JSON.stringify({ authenticated: true, exp: Date.now() + 100000 });
    const badToken = Buffer.from(payload).toString('base64') + '.badsignature';
    mockCookieStore.get.mockReturnValue({ value: badToken });
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
  });

  it('redirects when token is expired', async () => {
    const payload = JSON.stringify({ authenticated: true, exp: Date.now() - 1000 });
    const signature = createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    const token = Buffer.from(payload).toString('base64') + '.' + signature;
    mockCookieStore.get.mockReturnValue({ value: token });
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
  });

  it('succeeds with a valid token', async () => {
    const validToken = createSessionToken();
    mockCookieStore.get.mockReturnValue({ value: validToken });
    await expect(requireAuth()).resolves.toBeUndefined();
  });
});
