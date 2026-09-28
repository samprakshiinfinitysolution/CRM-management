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
};
