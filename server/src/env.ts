import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3000',
  SERVER_BASE_URL: process.env.SERVER_BASE_URL || 'http://localhost:4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Convenience timeout / feature flags
export const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 8000);
export const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS || 5000);
export const PDF_TIMEOUT_MS = Number(process.env.PDF_TIMEOUT_MS || 5000);
export const DRY_RUN = process.env.DRY_RUN === 'true';
export const HAS_OPENAI = Boolean(process.env.OPENAI_API_KEY);
export const HAS_EMAIL = Boolean(process.env.RESEND_API_KEY);
