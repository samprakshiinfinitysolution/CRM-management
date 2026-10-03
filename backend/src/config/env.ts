import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || 'crm_default_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  tokenKey: process.env.NEXT_PUBLIC_TOKEN_KEY || process.env.TOKEN_KEY || 'CRM_Management',
  databaseUrl: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  redis: {
    url: process.env.REDIS_URL || '',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    defaultTtlSeconds: process.env.REDIS_DEFAULT_TTL ? parseInt(process.env.REDIS_DEFAULT_TTL, 10) : 3600,
    sessionTtlSeconds: process.env.SESSION_TTL_SECONDS ? parseInt(process.env.SESSION_TTL_SECONDS, 10) : 7 * 24 * 3600, // 7 days
  },
};

