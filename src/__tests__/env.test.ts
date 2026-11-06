import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;
    const { env } = await import('@/lib/env');
    expect(() => env.DATABASE_URL).toThrow('Missing required environment variable: DATABASE_URL');
  });

  it('returns DATABASE_URL when set', async () => {
    process.env.DATABASE_URL = 'postgres://localhost/test';
    const { env } = await import('@/lib/env');
    expect(env.DATABASE_URL).toBe('postgres://localhost/test');
  });

  it('returns default AUTH_SECRET when not set', async () => {
    delete process.env.AUTH_SECRET;
    const { env } = await import('@/lib/env');
    expect(env.AUTH_SECRET).toBe('default-secret-change-in-production');
  });

  it('returns custom AUTH_SECRET when set', async () => {
    process.env.AUTH_SECRET = 'my-production-secret';
    const { env } = await import('@/lib/env');
    expect(env.AUTH_SECRET).toBe('my-production-secret');
  });

  it('returns empty string for ADMIN_PASSWORD when not set', async () => {
    delete process.env.ADMIN_PASSWORD;
    const { env } = await import('@/lib/env');
    expect(env.ADMIN_PASSWORD).toBe('');
  });

  it('returns empty string for TWILIO_AUTH_TOKEN when not set', async () => {
    delete process.env.TWILIO_AUTH_TOKEN;
    const { env } = await import('@/lib/env');
    expect(env.TWILIO_AUTH_TOKEN).toBe('');
  });
});
