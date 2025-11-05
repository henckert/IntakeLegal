import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3000',
  SERVER_BASE_URL: process.env.SERVER_BASE_URL || 'http://localhost:4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
