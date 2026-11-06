function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example for reference.`);
  }
  return value;
}

function getOptionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  get DATABASE_URL() {
    return getRequiredEnv('DATABASE_URL');
  },
  get ADMIN_PASSWORD() {
    return getOptionalEnv('ADMIN_PASSWORD', '');
  },
  get AUTH_SECRET() {
    return getOptionalEnv('AUTH_SECRET', 'default-secret-change-in-production');
  },
  get TWILIO_AUTH_TOKEN() {
    return getOptionalEnv('TWILIO_AUTH_TOKEN', '');
  },
} as const;
